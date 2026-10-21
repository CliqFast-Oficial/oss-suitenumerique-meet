"""Anotador da Reunião CliqFast: manda à CliqGestão só os trechos com fala.

Nada é gravado. Cada fala de cada pessoa (detectada pelo Silero, com um pouco de
áudio antes do início) vira um WAV curto, de no máximo ``MAX_SEGMENT_S`` segundos,
que vai para a CliqGestão. Ela transcreve, guarda o texto e, no fim, monta a ata e
manda por e-mail. Silêncio não sai daqui: o custo fica só no tempo de fala.

Quem liga é o backend do Meet (``start-notes``), por despacho explícito com o nome
``NOTES_AGENT_NAME``. O metadado ``notes`` da sala mostra a faixa "anotando" para
todos. O anotador sai sozinho quando a anotação é desligada (o metadado some), quando
a sala fica vazia por ``EMPTY_ROOM_S`` segundos ou no limite de ``NOTES_MAX_HOURS``.
"""

import asyncio
import base64
import contextlib
import io
import json
import logging
import os
import time
import wave
from collections import deque
from datetime import UTC, datetime

import httpx
from dotenv import load_dotenv
from livekit import api, rtc
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    JobRequest,
    WorkerOptions,
    WorkerPermissions,
    cli,
)
from livekit.agents import vad as vad_module
from livekit.plugins import silero

load_dotenv()

logger = logging.getLogger("anotador")

AGENT_NAME = os.getenv("NOTES_AGENT_NAME", "anotador-cliqfast")
GESTAO_URL = os.getenv("GESTAO_NOTES_URL", "")
GESTAO_TOKEN = os.getenv("GESTAO_NOTES_TOKEN", "")
MAX_HOURS = float(os.getenv("NOTES_MAX_HOURS", "4"))

RATE = 16000
BYTES_PER_S = RATE * 2  # mono, 16 bits
MAX_SEGMENT_S = 45.0
MIN_SEGMENT_S = 0.6
PREROLL_S = 0.3
EMPTY_ROOM_S = 45.0
DRAIN_TIMEOUT_S = 120.0
SEND_ATTEMPTS = 4
HTTP_SERVER_ERROR = 500
HTTP_REDIRECT = 300


def wav_bytes(pcm: bytes) -> bytes:
    """PCM 16 bits mono a 16 kHz dentro de um WAV."""
    out = io.BytesIO()
    with wave.open(out, "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        w.writeframes(pcm)
    return out.getvalue()


def is_human(participant: rtc.RemoteParticipant) -> bool:
    """Pessoas contam; outros agentes (legendas, coleta de métricas) não."""
    return participant.kind != rtc.ParticipantKind.PARTICIPANT_KIND_AGENT


class Speaker:
    """Escuta uma faixa de áudio e corta as falas pelo detector de fala."""

    def __init__(self, notes: "Notes", participant: rtc.RemoteParticipant, track):
        """Prepara o pré-áudio (início da fala antes de o detector perceber)."""
        self.notes = notes
        self.participant = participant
        self.track = track
        self.preroll: deque[bytes] = deque()
        self.preroll_bytes = 0
        self.buf = bytearray()
        self.speaking = False
        self.started = 0.0

    def flush(self) -> None:
        """Entrega a fala acumulada, se houver."""
        if self.buf:
            self.notes.segment(self.participant, self.started, bytes(self.buf))
        self.buf = bytearray()

    def take(self, chunk: bytes) -> None:
        """Guarda o áudio: na fala vai para o trecho; fora dela, só o pré-áudio."""
        if self.speaking:
            self.buf.extend(chunk)
            if len(self.buf) >= MAX_SEGMENT_S * BYTES_PER_S:
                self.flush()
                self.started = time.time()
            return
        self.preroll.append(chunk)
        self.preroll_bytes += len(chunk)
        while self.preroll and self.preroll_bytes > PREROLL_S * BYTES_PER_S:
            self.preroll_bytes -= len(self.preroll.popleft())

    def on_vad(self, ev: vad_module.VADEvent) -> None:
        """Começo e fim de fala vindos do Silero."""
        if ev.type == vad_module.VADEventType.START_OF_SPEECH and not self.speaking:
            self.speaking = True
            self.started = time.time() - self.preroll_bytes / BYTES_PER_S
            self.buf.extend(b"".join(self.preroll))
            self.preroll.clear()
            self.preroll_bytes = 0
        elif ev.type == vad_module.VADEventType.END_OF_SPEECH and self.speaking:
            self.speaking = False
            self.flush()

    async def run(self) -> None:
        """Lê o áudio até a faixa acabar ou a anotação parar."""
        stream = rtc.AudioStream(self.track, sample_rate=RATE, num_channels=1)
        vad_stream = self.notes.vad.stream()

        async def feed() -> None:
            async for ev in stream:
                vad_stream.push_frame(ev.frame)
                self.take(ev.frame.data.tobytes())
            vad_stream.end_input()

        async def events() -> None:
            async for ev in vad_stream:
                self.on_vad(ev)

        try:
            await asyncio.gather(feed(), events())
        except asyncio.CancelledError:
            pass
        finally:
            self.flush()  # a fala em andamento quando a pessoa saiu ou a anotação parou
            with contextlib.suppress(Exception):
                await vad_stream.aclose()
            with contextlib.suppress(Exception):
                await stream.aclose()


class Notes:
    """Uma anotação: ouve cada pessoa, junta as falas e entrega em ordem."""

    def __init__(self, ctx: JobContext, meta: dict, vad: vad_module.VAD):
        """Guarda a sala, a sessão e o detector de fala."""
        self.ctx = ctx
        self.session = str(meta.get("session") or ctx.job.id)
        self.vad = vad
        self.outbox: asyncio.Queue[dict | None] = asyncio.Queue()
        self.tasks: set[asyncio.Task] = set()
        self.listening: set[str] = set()
        self.people: dict[str, str] = {}
        self.done = asyncio.Event()
        self.reason = ""
        self.empty_timer: asyncio.TimerHandle | None = None
        self.http = httpx.AsyncClient(timeout=60)

    async def post(self, payload: dict) -> None:
        """Manda um evento à CliqGestão, com novas tentativas se ela estiver fora."""
        if not GESTAO_URL or not GESTAO_TOKEN:
            logger.warning("GESTAO_NOTES_URL ou GESTAO_NOTES_TOKEN ausente: nada sai")
            return
        headers = {"Authorization": f"Bearer {GESTAO_TOKEN}"}
        body = {"sessao": self.session, **payload}
        for attempt in range(SEND_ATTEMPTS):
            try:
                r = await self.http.post(GESTAO_URL, json=body, headers=headers)
                if r.status_code < HTTP_SERVER_ERROR:
                    if r.status_code >= HTTP_REDIRECT:
                        logger.warning("CliqGestão recusou: HTTP %s", r.status_code)
                    return
            except httpx.HTTPError as error:
                logger.warning("CliqGestão fora (%s), tentativa %s", error, attempt + 1)
            await asyncio.sleep(2**attempt)
        logger.error("Desisti de enviar %s", payload.get("evento"))

    async def sender(self) -> None:
        """Envia os eventos na ordem em que saíram."""
        while (item := await self.outbox.get()) is not None:
            await self.post(item)

    def segment(self, participant, started: float, pcm: bytes) -> None:
        """Põe uma fala na fila (falas curtas demais são só ruído)."""
        seconds = len(pcm) / BYTES_PER_S
        if seconds < MIN_SEGMENT_S:
            return
        self.outbox.put_nowait(
            {
                "evento": "trecho",
                "quem": {
                    "id": participant.identity,
                    "nome": participant.name or participant.identity,
                },
                "inicio": datetime.fromtimestamp(started, UTC).isoformat(),
                "segundos": round(seconds, 2),
                "audio": base64.b64encode(wav_bytes(pcm)).decode(),
            }
        )

    def spawn(self, coro) -> None:
        """Roda em segundo plano, guardando a referência até terminar."""
        task = asyncio.create_task(coro)
        self.tasks.add(task)
        task.add_done_callback(self.tasks.discard)

    def on_track(self, track, _pub, participant: rtc.RemoteParticipant) -> None:
        """Faixa de áudio de uma pessoa: começa a escutar."""
        if track.kind != rtc.TrackKind.KIND_AUDIO or not is_human(participant):
            return
        key = f"{participant.identity}:{track.sid}"
        if key in self.listening:
            return
        self.listening.add(key)
        speaker = Speaker(self, participant, track)

        async def listen() -> None:
            try:
                await speaker.run()
            finally:
                self.listening.discard(key)

        self.spawn(listen())

    def humans(self) -> list[rtc.RemoteParticipant]:
        """Quem está na sala agora (sem os agentes)."""
        return [p for p in self.ctx.room.remote_participants.values() if is_human(p)]

    def on_join(self, participant: rtc.RemoteParticipant) -> None:
        """Alguém entrou: entra na lista e cancela a saída por sala vazia."""
        if is_human(participant):
            self.people[participant.identity] = participant.name or participant.identity
            if self.empty_timer:
                self.empty_timer.cancel()
                self.empty_timer = None

    def on_leave(self, _participant=None) -> None:
        """Ficou sem ninguém: espera um pouco e encerra."""
        if not self.humans() and self.empty_timer is None:
            loop = asyncio.get_running_loop()
            self.empty_timer = loop.call_later(EMPTY_ROOM_S, self.stop, "sala vazia")

    def on_metadata(self, _old: str, new: str) -> None:
        """O metadado "notes" sumiu ou é de outra sessão: a anotação foi desligada."""
        try:
            notes = (json.loads(new or "{}") or {}).get("notes") or {}
        except ValueError:
            return
        session = str(notes.get("session") or self.session)
        if not notes.get("active") or session != self.session:
            self.stop("anotação desligada")

    def stop(self, reason: str) -> None:
        """Sinaliza o fim (uma vez só)."""
        if not self.done.is_set():
            logger.info("anotação %s termina: %s", self.session, reason)
            self.reason = reason
            self.done.set()

    async def finish(self) -> None:
        """Fecha as escutas (cada uma entrega a fala em andamento) e manda o fim."""
        for task in list(self.tasks):
            task.cancel()
        await asyncio.gather(*self.tasks, return_exceptions=True)
        people = [{"id": i, "nome": n} for i, n in self.people.items()]
        self.outbox.put_nowait(
            {"evento": "fim", "motivo": self.reason, "participantes": people}
        )
        self.outbox.put_nowait(None)


async def entrypoint(ctx: JobContext) -> None:
    """Liga a anotação na sala do despacho e espera o sinal de parar."""
    meta = json.loads(ctx.job.metadata or "{}")
    notes = Notes(ctx, meta, ctx.proc.userdata.get("vad") or silero.VAD.load())
    sender = asyncio.create_task(notes.sender())
    room = meta.get("room") or {"id": ctx.room.name}
    await notes.post(
        {"evento": "inicio", "sala": room, "pedidoPor": meta.get("requestedBy") or {}}
    )

    ctx.room.on("track_subscribed", notes.on_track)
    ctx.room.on("participant_connected", notes.on_join)
    ctx.room.on("participant_disconnected", notes.on_leave)
    ctx.room.on("room_metadata_changed", notes.on_metadata)
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    for participant in ctx.room.remote_participants.values():
        notes.on_join(participant)
        for pub in participant.track_publications.values():
            if pub.track is not None and pub.subscribed:
                notes.on_track(pub.track, pub, participant)
    notes.on_leave()

    try:
        await asyncio.wait_for(notes.done.wait(), timeout=MAX_HOURS * 3600)
    except TimeoutError:
        notes.stop(f"limite de {MAX_HOURS:g} h")
    await notes.finish()
    try:
        await asyncio.wait_for(sender, timeout=DRAIN_TIMEOUT_S)
    except TimeoutError:
        logger.error("anotação %s: o envio não terminou a tempo", notes.session)
    await notes.http.aclose()
    ctx.shutdown(reason=notes.reason or "fim")


async def handle_request(job_req: JobRequest) -> None:
    """Um anotador por sala: se já houver um, recusa."""
    room_name = job_req.room.name
    identity = f"{AGENT_NAME}-{room_name}"
    async with api.LiveKitAPI() as lkapi:
        try:
            response = await lkapi.room.list_participants(
                list=api.ListParticipantsRequest(room=room_name)
            )
            if any(p.identity == identity for p in response.participants):
                await job_req.reject()
            else:
                await job_req.accept(identity=identity, name="Anotações CliqFast")
        except Exception:
            logger.exception("Erro ao aceitar a anotação de %s", room_name)
            await job_req.reject()


def prewarm(proc: JobProcess) -> None:
    """Carrega o detector de fala uma vez por processo."""
    proc.userdata["vad"] = silero.VAD.load()


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            request_fnc=handle_request,
            prewarm_fnc=prewarm,
            agent_name=AGENT_NAME,
            permissions=WorkerPermissions(hidden=True),
        )
    )
