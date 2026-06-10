from openai import OpenAI
import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

client = OpenAI(
    api_key=os.getenv("OPENROUTER_API_KEY"),
    base_url="https://openrouter.ai/api/v1",
)

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based on provided documents.
Answer ONLY using the provided context. If the answer is not in the context, say: "I couldn't find information about that in the uploaded documents."
Always mention which document you got the information from."""

def generate_answer(query: str, context_chunks: list) -> dict:
    if not context_chunks:
        return {
            "answer": "No documents have been uploaded yet, or I couldn't find anything relevant to your question.",
            "sources": []
        }

    context_text = "\n\n---\n\n".join(
        f"[Source: {c['metadata']['filename'].split(os.sep)[-1]}]\n{c['text']}"
        for c in context_chunks
    )

    response = client.chat.completions.create(
        model=os.getenv("LLM_MODEL", "meta-llama/llama-3-8b-instruct"),
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Context:\n{context_text}\n\nQuestion: {query}"}
        ],
        temperature=0.1,
        max_tokens=1024,
    )

    sources = list({c["metadata"]["filename"].split(os.sep)[-1] for c in context_chunks})
    return {
        "answer": response.choices[0].message.content,
        "sources": sources
    }