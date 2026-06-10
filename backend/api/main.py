from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys, os, shutil

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from retriever.retriever import retrieve
from llm import generate_answer
from ingest.extractor import extract_file
from ingest.chunker import chunk_document
from ingest.vectorstore import add_chunks, collection

app = FastAPI(title="Simple RAG Chatbot")

app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "data")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class QueryRequest(BaseModel):
    question: str

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    filepath = os.path.join(UPLOAD_DIR, file.filename)
    with open(filepath, "wb") as f:
        shutil.copyfileobj(file.file, f)
    text = extract_file(filepath)
    doc_id = os.path.splitext(file.filename)[0]
    chunks = chunk_document(text, doc_id, file.filename)
    add_chunks(chunks)
    return {"message": f"Uploaded and indexed {file.filename}", "chunks": len(chunks)}

@app.post("/query")
def query(req: QueryRequest):
    chunks = retrieve(req.question)
    result = generate_answer(req.question, chunks)
    return {
        "answer": result["answer"],
        "sources": result["sources"]
    }

@app.get("/documents")
def list_documents():
    results = collection.get(include=["metadatas"])
    docs = list({m["filename"] for m in results["metadatas"]}) if results["metadatas"] else []
    return {"documents": docs}

@app.get("/health")
def health():
    return {"status": "ok", "documents": collection.count()}