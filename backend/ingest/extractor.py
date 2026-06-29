import fitz  # PyMuPDF
import pandas as pd
from pathlib import Path

try:
    from docling.document_converter import DocumentConverter
except Exception:  # pragma: no cover - optional dependency for deployment
    DocumentConverter = None


def extract_pdf(path: str) -> str:
    doc = fitz.open(path)
    return "\n".join(page.get_text() for page in doc)

def extract_excel(path: str) -> str:
    """Convert every sheet to readable text."""
    xl = pd.read_excel(path, sheet_name=None)
    parts = []
    for sheet, df in xl.items():
        parts.append(f"## Sheet: {sheet}\n{df.to_markdown(index=False)}")
    return "\n\n".join(parts)

def extract_docling(path: str) -> str:
    """Use Docling for complex PDFs with tables/figures."""
    if DocumentConverter is None:
        raise ImportError("docling is not installed; falling back to basic PDF text extraction")
    converter = DocumentConverter()
    result = converter.convert(path)
    return result.document.export_to_markdown()

def extract_file(path: str) -> str:
    ext = Path(path).suffix.lower()
    if ext == ".pdf":
        return extract_pdf(path)          # or extract_docling(path) for complex docs
    elif ext in (".xlsx", ".xls"):
        return extract_excel(path)
    elif ext in (".md", ".txt", ".html"):
        return Path(path).read_text(encoding="utf-8")
    else:
        raise ValueError(f"Unsupported file type: {ext}")