# src/core/store.py
from typing import Dict, List, Any

_sessions: Dict[str, Dict[str, Any]] = {}

DEFAULT_LANG = "en"
DEFAULT_VOICE_CODE = None  # logical code; resolved to Polly VoiceId in tts.py

def upsert_context(session_id: str, text: str) -> None:
    s = _sessions.setdefault(session_id, {"context": "", "history": [], "prefs": {}})
    if s["context"]:
        s["context"] += "\n\n----- NEW DOCUMENT -----\n\n"
    s["context"] += text

def get_context(session_id: str) -> str:
    return _sessions.get(session_id, {}).get("context", "")

def get_history(session_id: str) -> List[Dict[str, str]]:
    return _sessions.get(session_id, {}).get("history", [])

def append_history(session_id: str, role: str, content: str) -> None:
    s = _sessions.setdefault(session_id, {"context": "", "history": [], "prefs": {}})
    s["history"].append({"role": role, "content": content})

def set_prefs(session_id: str, language: str | None = None, voice_code: str | None = None) -> None:
    s = _sessions.setdefault(session_id, {"context": "", "history": [], "prefs": {}})
    prefs = s.setdefault("prefs", {})
    if language is not None:
        prefs["language"] = language
    if voice_code is not None:
        prefs["voice_code"] = voice_code

def get_prefs(session_id: str) -> dict:
    s = _sessions.get(session_id, {})
    prefs = s.get("prefs", {})
    return {
        "language": prefs.get("language", DEFAULT_LANG),
        "voice_code": prefs.get("voice_code", DEFAULT_VOICE_CODE),
    }
