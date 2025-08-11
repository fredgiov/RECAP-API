# src/api/app.py
import os, tempfile
from typing import List, Optional, Dict, Any, Generator
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import Response, StreamingResponse
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse
from src.core.extract import extract_text, SUPPORTED
from src.core.store import (
    upsert_context, get_context, get_history, append_history,
    set_prefs, get_prefs
)
from src.core.asr import transcribe
from src.core.tts import tts_wav_bytes, tts_wav_stream, tts_speech_marks_ndjson
from src.core.llm import stream_chat

app = FastAPI(title="RECAP API", version="1.0.0")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    session_id: str
    message: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[ChatMessage]] = None

class SessionConfig(BaseModel):
    session_id: str
    language: Optional[str] = None
    voice_code: Optional[str] = None

class TTSRequest(BaseModel):
    text: str
    voice: Optional[str] = None
    language: Optional[str] = None
    session_id: Optional[str] = None
    types: Optional[List[str]] = None

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/api/session/config")
async def set_session_config(cfg: SessionConfig):
    set_prefs(cfg.session_id, language=cfg.language, voice_code=cfg.voice_code)
    return {"ok": True, "prefs": get_prefs(cfg.session_id)}

@app.get("/api/session/config")
async def get_session_config(session_id: str):
    return {"ok": True, "prefs": get_prefs(session_id)}

@app.post("/api/upload")
async def upload(session_id: str = Form(...), file: UploadFile = File(...)):
    name = file.filename or "upload"
    data = await file.read()
    ext = os.path.splitext(name.lower())[1]
    if ext not in SUPPORTED:
        raise HTTPException(400, f"Unsupported type: {ext}")
    text, _ = extract_text(name, data)
    upsert_context(session_id, text)
    return {"ok": True, "chars": len(text)}

@app.post("/api/transcribe")
async def transcribe_audio(session_id: str = Form(...), file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "")[1] or ".wav"
    raw = await file.read()
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as tmp:
        tmp.write(raw); tmp.flush()
        text = transcribe(tmp.name)
    return {"text": text}

def _system_prompt(session_id: str, extra: Optional[str]) -> str:
    prefs = get_prefs(session_id)
    lang = prefs["language"]
    header = f"Respond in {lang}." if lang else "Respond in English."
    base = (
        f"You are RECAP. {header} Answer strictly grounded in the uploaded class material below.\n"
        "If the user asks beyond the material, say you don't have that info.\n\n"
        "----- CLASS MATERIAL START -----\n"
        f"{get_context(session_id)}\n"
        "----- CLASS MATERIAL END -----\n"
    )
    if extra:
        base = extra + "\n\n" + base
    return base

def _sse_stream(req: ChatRequest) -> Generator[str, None, None]:
    messages = [{"role": "system", "content": _system_prompt(req.session_id, (req.context or {}).get("system_prompt"))}]
    prior = req.conversation_history if req.conversation_history else get_history(req.session_id)
    messages += [m.model_dump() if hasattr(m, "model_dump") else m for m in prior]
    messages.append({"role": "user", "content": req.message})
    append_history(req.session_id, "user", req.message)
    try:
        for tok in stream_chat(messages):
            yield f"data: {tok}\n\n"
        yield "event: done\ndata: [DONE]\n\n"
    except Exception as e:
        yield f"event: error\ndata: {str(e)}\n\n"

@app.post("/api/chat")
async def chat(req: ChatRequest):
    return EventSourceResponse(_sse_stream(req), media_type="text/event-stream")

def _resolve_tts_prefs(req: TTSRequest):
    lang = req.language
    voice = req.voice
    if req.session_id:
        prefs = get_prefs(req.session_id)
        lang = lang or prefs.get("language")
        voice = voice or prefs.get("voice_code")
    return lang, voice

@app.post("/api/tts")
async def tts(req: TTSRequest):
    try:
        lang, voice = _resolve_tts_prefs(req)
        wav = tts_wav_bytes(req.text, voice=voice, language=lang)
        return Response(content=wav, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/tts_stream")
async def tts_stream(req: TTSRequest):
    try:
        lang, voice = _resolve_tts_prefs(req)
        gen = tts_wav_stream(req.text, voice=voice, language=lang)
        return StreamingResponse(gen, media_type="audio/wav")
    except Exception as e:
        raise HTTPException(500, str(e))

@app.post("/api/tts_marks")
async def tts_marks(req: TTSRequest):
    try:
        lang, voice = _resolve_tts_prefs(req)
        gen = tts_speech_marks_ndjson(req.text, voice=voice, language=lang, types=req.types)
        return StreamingResponse(gen, media_type="application/x-ndjson")
    except Exception as e:
        raise HTTPException(500, str(e))
