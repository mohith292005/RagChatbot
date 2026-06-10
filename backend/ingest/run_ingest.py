from extractor import extract_file
from chunker import chunk_document
from vectorstore import add_chunks
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "..", "data")

DOCS = [
    # add more files here:
    # os.path.join(BASE, "my_document.pdf"),
    # os.path.join(BASE, "data.xlsx"),
]

for filepath in DOCS:
    print(f"Ingesting {filepath}...")
    text = extract_file(filepath)
    doc_id = os.path.splitext(os.path.basename(filepath))[0]
    chunks = chunk_document(text, doc_id, filepath)
    add_chunks(chunks)

print("Ingestion complete.")