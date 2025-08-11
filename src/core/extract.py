# Portable text extractors for txt, pdf, ipynb
from typing import Tuple
import os, io, json
from pypdf import PdfReader
import nbformat

SUPPORTED = (".txt", ".pdf", ".ipynb")

def sniff(name: str) -> str:
    return os.path.splitext(name.lower())[1]

def extract_text(name: str, data: bytes) -> Tuple[str, int]:
    ext = sniff(name)
    if ext == ".txt":
        try:
            return data.decode("utf-8", errors="ignore"), len(data)
        except Exception:
            return data.decode("latin-1", errors="ignore"), len(data)
    if ext == ".pdf":
        reader = PdfReader(io.BytesIO(data))
        pages = []
        for p in reader.pages:
            pages.append(p.extract_text() or "")
        return "\n\n".join(pages).strip(), len(data)
    if ext == ".ipynb":
        nb = nbformat.reads(data.decode("utf-8", errors="ignore"), as_version=4)
        chunks = []
        for cell in nb.cells:
            if cell.cell_type == "markdown":
                chunks.append(cell.source)
            elif cell.cell_type == "code":
                chunks.append("```python\n" + (cell.source or "") + "\n```")
        return "\n\n".join(chunks).strip(), len(data)
    raise ValueError(f"Unsupported file type: {ext}")
