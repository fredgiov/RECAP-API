# RECAP Custom Model API

Lightweight HTTP API for class-aware chat responses.

## Quick Start

### Run tests
```bash
npm test
```

### Start the API
```bash
npm start
```

### Chat Endpoint
Send a POST request to `/chat` or `/api/chat` with JSON:
```json
{
  "message": "Hello",
  "session_id": "s1",
  "user_id": "u1",
  "context": {
    "class_id": "c1",
    "class_name": "Intro",
    "user_role": "student",
    "conversation_history": []
  }
}
```

The response will be:
```json
{
  "response": "...",
  "timestamp": "...",
  "status": "success",
  "error_message": ""
}
```

Training examples are stored in `data/training.jsonl` and the model prefix is
read from `data/model.json`. Set `MODEL_SERVER_URL` to forward chat requests to
a remote model server.
