import io, os, wave, numpy as np
USE_POLLY = os.getenv("USE_POLLY", "1") == "1"
DEFAULT_VOICE = os.getenv("POLLY_VOICE", "Joanna")

if USE_POLLY:
    import boto3
    polly = boto3.client("polly", region_name=os.getenv("AWS_REGION", "us-east-1"))
else:
    polly = None

# You can paste your VOICE_MAP here if you want friendly aliases, or just accept a VoiceId directly.
def tts_wav_bytes(text: str, voice: str | None = None) -> bytes:
    if not (USE_POLLY and polly):
        raise RuntimeError("Polly disabled. Set USE_POLLY=1 and AWS creds.")
    resp = polly.synthesize_speech(Text=text, OutputFormat="pcm", SampleRate="16000", VoiceId=voice or DEFAULT_VOICE)
    pcm = resp["AudioStream"].read()
    data = np.frombuffer(pcm, dtype=np.int16)
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(16000)
        w.writeframes(data.tobytes())
    return buf.getvalue()
