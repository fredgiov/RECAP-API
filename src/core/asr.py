import platform, torch, whisper

def pick_device():
    if platform.machine() == "aarch64" and torch.cuda.is_available(): return "cuda"
    if torch.backends.mps.is_available(): return "mps"
    if torch.cuda.is_available(): return "cuda"
    return "cpu"

_DEVICE = pick_device()
_MODEL = None

def get_asr():
    global _MODEL
    if _MODEL is None:
        m = whisper.load_model("small", device="cpu")
        for name, buf in list(m.named_buffers()):
            if hasattr(buf, "layout") and buf.layout == torch.sparse_coo:
                m.register_buffer(name, buf.to_dense())
        _MODEL = m.to(_DEVICE)
    return _MODEL

def transcribe(path: str) -> str:
    asr = get_asr()
    result = asr.transcribe(path, fp16=False if _DEVICE == "cpu" else True, condition_on_previous_text=False)
    return (result.get("text") or "").strip()
