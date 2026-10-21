"""Equipe da CliqGestão (a central de gestão da CliqFast): quem pode entrar com conta na Reunião CliqFast e quem é admin.

A CliqGestão responde ``GET CLIQGESTAO_TEAM_URL`` com ``{"members": [{"email", "name", "admin"}]}`` (só a equipe
ativa), autenticado por ``Authorization: Bearer CLIQGESTAO_TEAM_TOKEN``. A lista fica 5 minutos no cache; se a
CliqGestão não responder, vale a última lista conhecida. Sem ``CLIQGESTAO_TEAM_URL``, nada é conferido (Meet original).
"""

import logging

from django.conf import settings
from django.core.cache import cache

import requests

logger = logging.getLogger(__name__)

CACHE_KEY = "cliqgestao:team"
LAST_KEY = "cliqgestao:team:last"
TTL = 300


class NotInTeam(Exception):
    """O e-mail não é da equipe ativa da CliqGestão."""


def enabled() -> bool:
    return bool(getattr(settings, "CLIQGESTAO_TEAM_URL", None))


def team() -> dict[str, bool]:
    """E-mail (minúsculo) → é admin. Vazio quando não há lista (nem a última conhecida)."""
    cached = cache.get(CACHE_KEY)
    if cached is not None:
        return cached
    try:
        response = requests.get(
            settings.CLIQGESTAO_TEAM_URL,
            headers={"Authorization": f"Bearer {settings.CLIQGESTAO_TEAM_TOKEN}"},
            timeout=8,
        )
        response.raise_for_status()
        members = response.json().get("members") or []
        found = {
            str(m["email"]).strip().lower(): bool(m.get("admin"))
            for m in members
            if isinstance(m, dict) and m.get("email")
        }
    except (requests.RequestException, ValueError, KeyError, TypeError) as error:
        logger.warning("CliqGestão: equipe indisponível (%s)", type(error).__name__)
        return cache.get(LAST_KEY) or {}
    cache.set(CACHE_KEY, found, TTL)
    cache.set(LAST_KEY, found, None)
    return found


def check(email: str | None) -> bool:
    """O e-mail é da equipe? Levanta ``NotInTeam`` quando não é. Devolve se é admin."""
    found = team()
    key = (email or "").strip().lower()
    if not key or key not in found:
        raise NotInTeam(key)
    return found[key]
