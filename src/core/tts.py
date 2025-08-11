# src/core/tts.py
import io, os, wave, numpy as np
from typing import Generator, Iterable, List

USE_POLLY = os.getenv("USE_POLLY", "1") == "1"
DEFAULT_VOICE = os.getenv("POLLY_VOICE", "Joanna")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

if USE_POLLY:
    import boto3
    polly = boto3.client("polly", region_name=AWS_REGION)
else:
    polly = None

# Map language/variant codes -> Polly VoiceId
VOICE_MAP = {
    "arb": "Zeina",
    "ar-AE": "Hala",
    "nl-BE": "Lisa",
    "ca-ES": "Arlet",
    "cs-CZ": "Jitka",
    "yue-CN": "Hiujin",
    "cmn-CN": "Zhiyu",
    "da-DK": "Naja",
    "nl-NL": "Laura",
    "en-AU": "Nicole",
    "en-GB": "Amy",
    "en-IN": "Aditi",
    "en-IE": "Niamh",
    "en-NZ": "Aria",
    "en-SG": "Jasmine",
    "en-ZA": "Ayanda",
    "en-US": "Joanna",
    "en-GB-WLS": "Geraint",
    "fi-FI": "Suvi",
    "fr-FR": "Celine",
    "fr-BE": "Isabelle",
    "fr-CA": "Chantal",
    "de-DE": "Marlene",
    "de-AT": "Hannah",
    "de-CH": "Sabrina",
    "hi-IN": "Kajal",
    "is-IS": "Dora",
    "it-IT": "Carla",
    "ja-JP": "Mizuki",
    "ko-KR": "Seoyeon",
    "nb-NO": "Liv",
    "pl-PL": "Ewa",
    "pt-BR": "Camila",
    "pt-PT": "Ines",
    "ro-RO": "Carmen",
    "ru-RU": "Tatyana",
    "es-ES": "Conchita",
    "es-MX": "Mia",
    "es-US": "Lupe",
    "sv-SE": "Astrid",
    "tr-TR": "Filiz",
    "cy-GB": "Gwyneth",
}

def resolve_voice_id(language_code: str | None, explicit_voice_code: str | None) -> str:
    if explicit_voice_code:
        return VOICE_MAP.get(explicit_voice_code, explicit_voice_code)
    lang = (language_code or "").strip()
    if lang in VOICE_MAP:
        return VOICE_MAP[lang]
    base = lang.split("-", 1)[0] if lang else ""
    if base in VOICE_MAP:
        return VOICE_MAP[base]
    return DEFAULT_VOICE

def _pcm_to_wav(pcm_bytes: bytes, sample_rate: int = 16000) -> bytes:
    data = np.frombuffer(pcm_bytes, dtype=np.int16)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sample_rate)
        w.writeframes(data.tobytes())
    return buf.getvalue()

def tts_wav_bytes(text: str, voice: str | None = None, language: str | None = None) -> bytes:
    if not (USE_POLLY and polly):
        raise RuntimeError("Polly disabled.")
    voice_id = resolve_voice_id(language, voice)
    resp = polly.synthesize_speech(
        Text=text, VoiceId=voice_id, OutputFormat="pcm", SampleRate="16000", Engine="neural"
    )
    pcm = resp["AudioStream"].read()
    return _pcm_to_wav(pcm, 16000)

def tts_wav_stream(text: str, voice: str | None = None, language: str | None = None, chunk_size: int = 32768) -> Iterable[bytes]:
    if not (USE_POLLY and polly):
        raise RuntimeError("Polly disabled.")
    voice_id = resolve_voice_id(language, voice)
    resp = polly.synthesize_speech(
        Text=text, VoiceId=voice_id, OutputFormat="pcm", SampleRate="16000", Engine="neural"
    )
    stream = resp["AudioStream"]
    first = stream.read(chunk_size)
    if not first:
        return
    yield _pcm_to_wav(first, 16000)
    while True:
        chunk = stream.read(chunk_size)
        if not chunk:
            break
        yield chunk

def tts_speech_marks_ndjson(text: str, voice: str | None = None, language: str | None = None, types: List[str] | None = None) -> Generator[str, None, None]:
    if not (USE_POLLY and polly):
        raise RuntimeError("Polly disabled.")
    if types is None:
        types = ["viseme", "word"]
    voice_id = resolve_voice_id(language, voice)
    resp = polly.synthesize_speech(
        Text=text, VoiceId=voice_id, OutputFormat="json", SpeechMarkTypes=types, Engine="neural"
    )
    stream = resp["AudioStream"]
    while True:
        line = stream.readline()
        if not line:
            break
        try:
            s = line.decode("utf-8").strip()
        except Exception:
            s = line.strip()
        if not s:
            continue
        yield s + "\n"
