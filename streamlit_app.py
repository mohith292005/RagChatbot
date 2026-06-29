import os
import sys
from pathlib import Path
import streamlit as st
from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.append(str(BACKEND))

load_dotenv(ROOT / ".env")

if "OPENROUTER_API_KEY" not in os.environ:
    try:
        os.environ["OPENROUTER_API_KEY"] = st.secrets["OPENROUTER_API_KEY"]
    except Exception:
        pass

if "LLM_MODEL" not in os.environ:
    try:
        os.environ["LLM_MODEL"] = st.secrets["LLM_MODEL"]
    except Exception:
        os.environ["LLM_MODEL"] = "meta-llama/llama-3-8b-instruct"

from ingest.extractor import extract_file
from ingest.chunker import chunk_document
from ingest.vectorstore import add_chunks, collection
from retriever.retriever import retrieve
from api.llm import generate_answer

st.set_page_config(page_title="DocQuery Streamlit", page_icon="📄", layout="wide")
st.title("DocQuery — RAG Chatbot")
st.caption("Upload documents and ask questions grounded in your own content.")

if "uploaded_docs" not in st.session_state:
    st.session_state.uploaded_docs = []

with st.sidebar:
    st.header("Upload documents")
    uploaded_files = st.file_uploader(
        "Choose files",
        type=["pdf", "xlsx", "xls", "md", "txt", "html"],
        accept_multiple_files=True,
    )

    if st.button("Index uploaded files") and uploaded_files:
        try:
            for uploaded in uploaded_files:
                save_path = ROOT / "data" / uploaded.name
                save_path.parent.mkdir(parents=True, exist_ok=True)
                with open(save_path, "wb") as f:
                    f.write(uploaded.getbuffer())

                text = extract_file(str(save_path))
                doc_id = Path(uploaded.name).stem
                chunks = chunk_document(text, doc_id, uploaded.name)
                add_chunks(chunks)
                st.session_state.uploaded_docs.append(uploaded.name)

            st.success("Documents indexed successfully.")
        except Exception as e:
            st.error(f"Indexing failed: {e}")

    st.subheader("Indexed documents")
    if st.session_state.uploaded_docs:
        for doc in st.session_state.uploaded_docs:
            st.write(f"- {doc}")
    else:
        st.write("No documents indexed yet.")

st.header("Ask a question")
question = st.text_input("Your question", placeholder="What does the policy say about leave?")

if st.button("Ask") and question:
    try:
        chunks = retrieve(question)
        result = generate_answer(question, chunks)
        st.write(result["answer"])
        if result.get("sources"):
            st.caption("Sources: " + ", ".join(result["sources"]))
    except Exception as e:
        st.error(f"Query failed: {e}")

st.header("Current knowledge base")
try:
    if collection.count() > 0:
        st.info(f"{collection.count()} chunks indexed")
    else:
        st.info("No chunks indexed yet")
except Exception as e:
    st.error(f"Could not read vector store: {e}")
