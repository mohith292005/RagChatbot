from langchain_text_splitters import RecursiveCharacterTextSplitter
from typing import List, Dict

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=64,
    separators=["\n\n", "\n", ".", " "]
)

def chunk_document(text: str, doc_id: str, filename: str) -> List[Dict]:
    chunks = splitter.split_text(text)
    return [
        {
            "text": chunk,
            "metadata": {
                "doc_id": doc_id,
                "filename": filename,
                "chunk_index": i,
            }
        }
        for i, chunk in enumerate(chunks)
    ]