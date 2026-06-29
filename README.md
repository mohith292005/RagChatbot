# DocQuery — RAG-Powered Document Chatbot

> Upload your documents. Ask anything. Get grounded, cited answers — no hallucination.

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![Streamlit](https://img.shields.io/badge/Streamlit-1.36+-FF4B4B?style=flat&logo=streamlit&logoColor=white)
![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_DB-FF6B35?style=flat)
![OpenRouter](https://img.shields.io/badge/OpenRouter-LLM_API-7C3AED?style=flat)

---

## Overview

DocQuery is a private, local-first document chatbot built on a full RAG pipeline. Upload PDFs, Excel files, or Markdown documents and ask natural-language questions about their contents. The app retrieves relevant chunks from your uploaded documents and sends them to an LLM so every answer is grounded in your actual data.

---

## Features

- Multi-format ingestion for PDF, Excel, Markdown, text, and HTML files
- Semantic retrieval using ChromaDB and OpenRouter embeddings
- Grounded answers with source citations
- Simple Streamlit UI for uploading files and asking questions

---

## Project Structure

```text
rag-chatbot/
├── backend/
│   ├── api/
│   │   ├── llm.py
│   │   └── main.py
│   ├── ingest/
│   │   ├── chunker.py
│   │   ├── extractor.py
│   │   ├── run_ingest.py
│   │   └── vectorstore.py
│   ├── retriever/
│   │   └── retriever.py
│   └── requirements.txt
├── data/
├── streamlit_app.py
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
.\venv\Scripts\activate
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

Open the local URL shown by Streamlit.

---

## Streamlit Cloud Deployment

1. Push this repository to GitHub.
2. Open Streamlit Cloud.
3. Create a new app from the repository.
4. Set the main file to `streamlit_app.py`.
5. Add the same environment variables in Streamlit secrets.

Example secrets:

```toml
[default]
OPENROUTER_API_KEY = "your_openrouter_key"
LLM_MODEL = "meta-llama/llama-3-8b-instruct"
```

---

## Author

Mohith
GitHub: [@mohith292005](https://github.com/mohith292005)
