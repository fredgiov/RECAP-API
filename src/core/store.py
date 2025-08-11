# In-memory session store. Replace with Redis later if needed.
from typing import Dict, List, Any

_sessions: Dict[str, Dict[str, Any]] = {}

def upsert_context(session_id: str, text: str) -> None:
    s = _sessions.setdefault(session_id, {"context": "", "history": []})
    # append uploaded text, with delimiter
    if s["context"]:
        s["context"] += "\n\n----- NEW DOCUMENT -----\n\n"
    s["context"] += text

def get_context(session_id: str) -> str:
    return _sessions.get(session_id, {}).get("context", "")

def get_history(session_id: str) -> List[Dict[str, str]]:
    return _sessions.get(session_id, {}).get("history", [])

def append_history(session_id: str, role: str, content: str) -> None:
    s = _sessions.setdefault(session_id, {"context": "", "history": []})
    s["history"].append({"role": role, "content": content})
