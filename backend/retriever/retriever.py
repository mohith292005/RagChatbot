import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from typing import List
from ingest.vectorstore import collection

def retrieve(query: str, top_k: int = 5) -> List[dict]:
    count = collection.count()
    if count == 0:
        return []

    results = collection.query(
        query_texts=[query],
        n_results=min(top_k, count),
        include=["documents", "metadatas", "distances"]
    )

    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]

    return [
        {
            "text": doc,
            "metadata": meta,
            "score": 1 - dist
        }
        for doc, meta, dist in zip(docs, metas, distances)
    ]