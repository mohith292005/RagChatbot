import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
from dotenv import load_dotenv
import os

# Walk up from ingest/ → backend/ where .env lives
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(ENV_PATH)

print("ENV path:", ENV_PATH)
print("API KEY LOADED:", os.getenv("OPENROUTER_API_KEY")[:10] if os.getenv("OPENROUTER_API_KEY") else "NOT FOUND")

openai_ef = OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    api_base="https://openrouter.ai/api/v1",
    model_name="baai/bge-m3"
)

client = chromadb.PersistentClient(path=os.path.join(BASE_DIR, "chroma_db"))
collection = client.get_or_create_collection(
    name="knowledge_base",
    embedding_function=openai_ef,
    metadata={"hnsw:space": "cosine"}
)

def add_chunks(chunks: list):
    ids = [f"{c['metadata']['doc_id']}_{c['metadata']['chunk_index']}" for c in chunks]
    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    collection.add(documents=texts, metadatas=metadatas, ids=ids)
    print(f"Added {len(chunks)} chunks.")