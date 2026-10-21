"""Anotações da reunião (Reunião CliqFast): liga e desliga o anotador da sala.

O anotador (``src/agents/anotador.py``) entra por despacho explícito com o nome ``NOTES_AGENT_NAME`` e manda só os
trechos com fala para a CliqGestão, que transcreve, monta a ata e manda por e-mail. Nada é gravado aqui.
O metadado ``notes`` da sala (``{"active", "session", "by", "since"}``) mostra a faixa "anotando" para todos. Quando ele
some, o anotador termina e entrega o que ouviu.
"""

import json
import uuid
from datetime import UTC, datetime
from logging import getLogger

from django.conf import settings

from asgiref.sync import async_to_sync
from livekit.protocol.agent_dispatch import CreateAgentDispatchRequest

from core import utils
from core.services.room_management import (
    RoomManagement,
    RoomManagementException,
    RoomNotFoundException,
)

logger = getLogger(__name__)


class NotesException(Exception):
    """A anotação não pôde ser ligada ou desligada."""


class NotesService:
    """Liga e desliga o anotador de uma sala."""

    @staticmethod
    @async_to_sync
    async def _dispatch(room_name: str, metadata: dict) -> None:
        lkapi = utils.create_livekit_client()
        try:
            await lkapi.agent_dispatch.create_dispatch(
                CreateAgentDispatchRequest(
                    agent_name=settings.NOTES_AGENT_NAME,
                    room=room_name,
                    metadata=json.dumps(metadata),
                )
            )
        finally:
            await lkapi.aclose()

    def start(self, room, user) -> dict:
        """Despacha o anotador e marca a sala como "anotando". Devolve o metadado gravado."""
        name = (
            getattr(user, "full_name", "") or getattr(user, "email", "") or ""
        ).strip()
        notes = {
            "active": True,
            "session": str(uuid.uuid4()),
            "by": name,
            "since": datetime.now(UTC).isoformat(),
        }
        room_name = str(room.id)
        try:
            RoomManagement.update_metadata(room_name, {"notes": notes})
            self._dispatch(
                room_name,
                {
                    "session": notes["session"],
                    "room": {"id": room_name, "slug": room.slug, "nome": room.name},
                    "requestedBy": {
                        "nome": name,
                        "email": getattr(user, "email", "") or "",
                    },
                },
            )
        except (RoomNotFoundException, RoomManagementException) as error:
            raise NotesException("A sala ainda não está aberta no LiveKit.") from error
        except Exception as error:
            logger.exception("Falha ao despachar o anotador na sala %s", room_name)
            with_cleanup(room_name)
            raise NotesException("Não foi possível ligar as anotações.") from error
        return notes

    def stop(self, room) -> None:
        """Tira o metadado: o anotador percebe, entrega o que ouviu e sai."""
        try:
            RoomManagement.update_metadata(str(room.id), remove_keys=["notes"])
        except RoomNotFoundException:
            return
        except RoomManagementException as error:
            raise NotesException("Não foi possível desligar as anotações.") from error


def with_cleanup(room_name: str) -> None:
    """Se o despacho falhou depois de marcar a sala, tira a faixa "anotando"."""
    try:
        RoomManagement.update_metadata(room_name, remove_keys=["notes"])
    except (RoomNotFoundException, RoomManagementException):
        logger.warning(
            "Não consegui limpar o metadado de anotação da sala %s", room_name
        )
