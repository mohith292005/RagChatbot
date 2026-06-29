# DocQuery — RAG-Powered Document Chatbot

> Upload your documents. Ask anything. Get grounded, cited answers — no hallucination.

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Streamlit](https://img.shields.io/badge/Streamlit-1.36+-FF4B4B?style=flat&logo=streamlit&logoColor=white)](https://streamlit.io)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-FF6B35?style=flat)](https://trychroma.com)
[![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM_API-7C3AED?style=flat)](https://openrouter.ai)
[![Live Demo](https://img.shields.io/badge/Live_Demo-Streamlit_Cloud-FF4B4B?style=flat&logo=streamlit&logoColor=white)](https://ragchatbot-qnbsh4pjgdxgoqwvhkflrg.streamlit.app/)

**Live Demo:** [ragchatbot-qnbsh4pjgdxgoqwvhkflrg.streamlit.app](https://ragchatbot-qnbsh4pjgdxgoqwvhkflrg.streamlit.app/)

---

## Overview

DocQuery is a private, local-first document chatbot built on a full RAG (Retrieval-Augmented Generation) pipeline. Upload PDFs, Excel spreadsheets, or Markdown files and ask natural-language questions about their contents.

The system retrieves semantically relevant chunks from your documents using `bge-m3` embeddings and ChromaDB, then passes them to an LLM at `temperature=0.1` — ensuring every answer is grounded strictly in your data, with source citations included and a safe fallback when no relevant context is found.

---

## Features

- **Multi-format ingestion** — PDF, Excel (.xlsx), Markdown, plain text, and HTML
- **Semantic retrieval** — chunks at 512 tokens with 64-token overlap, embedded with `baai/bge-m3` and stored in ChromaDB
- **Anti-hallucination design** — LLM answers only from retrieved context; returns a safe fallback when no relevant chunks are found
- **Source citations** — every response cites the document it was sourced from
- **Per-document conversations** — each uploaded document maintains its own chat history
- **Grounded at temperature=0.1** — conservative, factual outputs

---

## How It Works

```
User uploads file
      ↓
Extract text (PyMuPDF / Pandas / Markdown parser)
      ↓
Split into chunks (512 tokens, 64 overlap)
      ↓
Embed chunks (baai/bge-m3 via OpenRouter)
      ↓
Store in ChromaDB with metadata
      ↓
User asks a question
      ↓
Embed query → semantic search → top-5 chunks
      ↓
Send chunks + question to LLM with grounding prompt
      ↓
Cited answer returned to UI
```

---

## Project Structure

```text
rag-chatbot/
├── backend/
│   ├── api/
│   │   ├── llm.py              # LLM call with grounding system prompt
│   │   └── main.py             # FastAPI routes (/upload, /query, /documents)
│   ├── ingest/
│   │   ├── chunker.py          # Text splitting with metadata tagging
│   │   ├── extractor.py        # PDF, Excel, Markdown text extraction
│   │   ├── run_ingest.py       # Manual batch ingestion script
│   │   └── vectorstore.py      # ChromaDB client + OpenRouter embedding function
│   ├── retriever/
│   │   └── retriever.py        # Semantic search against ChromaDB
│   └── requirements.txt
├── data/
├── streamlit_app.py            # Streamlit UI
├── requirements.txt
└── README.md
```

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/mohith292005/RagChatbot.git
cd RagChatbot
```

### 2. Create and activate a virtual environment

```bash
python -m venv venv
.\venv\Scripts\activate      # Windows
source venv/bin/activate     # Mac/Linux
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_openrouter_key
LLM_MODEL=meta-llama/llama-3-8b-instruct
```

### 5. Run the app

```bash
streamlit run streamlit_app.py
```

---

## Streamlit Cloud Deployment

1. Push this repository to GitHub.
2. Open [Streamlit Cloud](https://streamlit.io/cloud).
3. Create a new app → set main file to `streamlit_app.py`.
4. Add environment variables under **Secrets**:

```toml
[default]
OPENROUTER_API_KEY = "your_openrouter_key"
LLM_MODEL = "meta-llama/llama-3-8b-instruct"
```

---

## Anti-Hallucination Design

- LLM is instructed via system prompt to answer **only from retrieved context**
- Returns a safe fallback when no relevant chunks are found
- `temperature=0.1` keeps outputs conservative and factual
- Every answer cites the source document filename
- `chunk_overlap=64` prevents context loss at chunk boundaries

---

## Author

**Mohith A**
GitHub: [@mohith292005](https://github.com/mohith292005)
