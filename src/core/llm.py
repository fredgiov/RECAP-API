import os, ollama
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")
_client = ollama.Client(host=os.getenv("OLLAMA_HOST", "http://localhost:11434"))

def stream_chat(messages):
    stream = _client.chat(model=OLLAMA_MODEL, messages=messages, stream=True)
    for chunk in stream:
        token = chunk.get("message", {}).get("content", "")
        if token:
            yield token
