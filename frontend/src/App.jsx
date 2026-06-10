import { useState, useRef, useEffect } from "react"
import axios from "axios"

const API = "http://127.0.0.1:8000"

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', system-ui, sans-serif; background: #f5f4f0; }
  .page { display: flex; height: 100vh; }

  .sidebar {
    width: 240px; min-width: 240px; background: #fff;
    border-right: 0.5px solid #e8e6e0; display: flex; flex-direction: column;
  }
  .sidebar-header { padding: 18px 16px; border-bottom: 0.5px solid #f0ede8; }
  .logo { display: flex; align-items: center; gap: 9px; }
  .logo-icon {
    width: 28px; height: 28px; background: #1a1a1a; border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 13px; font-weight: 700;
  }
  .logo-text { font-size: 14px; font-weight: 600; color: #1a1a1a; }
  .logo-sub { font-size: 11px; color: #bbb; margin-top: 1px; }

  .upload-area { padding: 12px; border-bottom: 0.5px solid #f0ede8; }
  .upload-btn {
    width: 100%; padding: 9px; border-radius: 7px;
    border: 1px dashed #d8d4cc; background: transparent;
    color: #999; font-size: 12px; cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 5px;
    transition: all 0.15s; font-family: inherit;
  }
  .upload-btn:hover { border-color: #1a1a1a; color: #1a1a1a; background: #faf9f7; }
  .upload-btn.uploading { border-color: #1a1a1a; color: #1a1a1a; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

  .docs-section { flex: 1; overflow-y: auto; padding: 10px; }
  .docs-section::-webkit-scrollbar { width: 3px; }
  .docs-section::-webkit-scrollbar-thumb { background: #e0ddd8; border-radius: 2px; }
  .docs-label {
    font-size: 10px; color: #bbb; letter-spacing: 0.07em;
    text-transform: uppercase; padding: 0 6px; margin-bottom: 6px;
  }
  .doc-item {
    display: flex; align-items: center; gap: 7px; padding: 8px 8px;
    border-radius: 6px; font-size: 12px; color: #888; margin-bottom: 1px;
    cursor: pointer; transition: all 0.12s; border: 0.5px solid transparent;
  }
  .doc-item:hover { background: #faf9f7; color: #444; }
  .doc-item.active { background: #f0ede8; color: #1a1a1a; border-color: #e0ddd6; }
  .doc-dot { width: 5px; height: 5px; border-radius: 50%; background: #ccc; flex-shrink: 0; }
  .doc-item.active .doc-dot { background: #1a1a1a; }
  .doc-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .doc-count {
    font-size: 10px; padding: 1px 5px; border-radius: 8px;
    background: #e8e4dc; color: #888; flex-shrink: 0;
  }
  .doc-item.active .doc-count { background: #d8d3c8; color: #555; }
  .no-docs { font-size: 12px; color: #ccc; padding: 6px 6px; }

  .sidebar-footer { padding: 14px; border-top: 0.5px solid #f0ede8; }
  .stats { display: flex; gap: 8px; }
  .stat { flex: 1; background: #faf9f7; border-radius: 6px; padding: 8px 10px; border: 0.5px solid #eee; }
  .stat-val { font-size: 15px; font-weight: 600; color: #1a1a1a; }
  .stat-label { font-size: 10px; color: #bbb; margin-top: 1px; }

  .chat { flex: 1; display: flex; flex-direction: column; background: #f5f4f0; }
  .chat-header {
    padding: 14px 22px; border-bottom: 0.5px solid #e8e6e0;
    background: #fff; display: flex; align-items: center; justify-content: space-between;
  }
  .chat-title { font-size: 13px; font-weight: 600; color: #1a1a1a; }
  .chat-sub { font-size: 11px; color: #bbb; margin-top: 2px; }
  .header-right { display: flex; align-items: center; gap: 10px; }
  .clear-btn {
    font-size: 11px; color: #bbb; background: none; border: 0.5px solid #e0ddd8;
    border-radius: 5px; padding: 4px 9px; cursor: pointer; transition: all 0.15s;
    font-family: inherit;
  }
  .clear-btn:hover { color: #c0392b; border-color: #c0392b; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #27ae60; }

  .messages {
    flex: 1; overflow-y: auto; padding: 22px;
    display: flex; flex-direction: column; gap: 16px;
  }
  .messages::-webkit-scrollbar { width: 3px; }
  .messages::-webkit-scrollbar-thumb { background: #ddd; border-radius: 2px; }

  .msg-row { display: flex; gap: 9px; animation: fadeIn 0.18s ease; }
  .msg-row.user { flex-direction: row-reverse; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:none} }

  .avatar {
    width: 26px; height: 26px; min-width: 26px; border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; font-weight: 700;
  }
  .avatar.ai { background: #1a1a1a; color: #fff; }
  .avatar.user { background: #f0ede8; color: #888; border: 0.5px solid #e0ddd6; }

  .bubble { max-width: 72%; display: flex; flex-direction: column; gap: 5px; }
  .bubble-text {
    padding: 10px 14px; border-radius: 10px;
    font-size: 13px; line-height: 1.65; white-space: pre-wrap; word-break: break-word;
  }
  .bubble.ai .bubble-text {
    background: #fff; color: #333;
    border: 0.5px solid #e8e6e0; border-radius: 3px 10px 10px 10px;
  }
  .bubble.user .bubble-text {
    background: #1a1a1a; color: #fff;
    border-radius: 10px 3px 10px 10px;
  }
  .sources-row { display: flex; flex-wrap: wrap; gap: 4px; padding: 0 2px; }
  .source-chip {
    font-size: 10px; padding: 2px 7px; border-radius: 20px;
    background: #f0ede8; color: #888; border: 0.5px solid #e0ddd6;
  }
  .sources-label { font-size: 10px; color: #ccc; padding: 0 2px; }

  .thinking-dots { display: flex; gap: 4px; padding: 12px 14px; }
  .dot { width: 5px; height: 5px; border-radius: 50%; background: #ccc; animation: bounce 1.2s infinite; }
  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

  .input-area {
    padding: 14px 22px; background: #fff;
    border-top: 0.5px solid #e8e6e0;
  }
  .input-row { display: flex; gap: 8px; align-items: flex-end; }
  textarea {
    flex: 1; padding: 10px 13px; border-radius: 8px;
    border: 0.5px solid #ddd; background: #faf9f7;
    color: #333; font-size: 13px; font-family: inherit;
    resize: none; outline: none; line-height: 1.5;
    min-height: 40px; max-height: 110px; transition: border-color 0.15s;
  }
  textarea:focus { border-color: #1a1a1a; background: #fff; }
  textarea::placeholder { color: #ccc; }
  textarea:disabled { opacity: 0.5; cursor: not-allowed; }
  .send-btn {
    width: 40px; height: 40px; border-radius: 8px; border: none;
    background: #1a1a1a; color: #fff; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.15s; flex-shrink: 0;
  }
  .send-btn:hover { background: #333; }
  .send-btn:disabled { background: #e8e6e0; color: #bbb; cursor: not-allowed; }
  .input-hint { font-size: 10px; color: #ccc; margin-top: 7px; text-align: center; }

  .empty-state {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 10px;
  }
  .empty-icon { font-size: 36px; opacity: 0.25; }
  .empty-title { font-size: 15px; font-weight: 500; color: #999; }
  .empty-sub { font-size: 12px; color: #bbb; text-align: center; max-width: 260px; line-height: 1.6; }
  .suggestion-chips { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 6px; }
  .chip {
    padding: 6px 12px; border-radius: 20px; border: 0.5px solid #e0ddd6;
    background: #fff; color: #888; font-size: 11px; cursor: pointer;
    transition: all 0.15s; font-family: inherit;
  }
  .chip:hover { border-color: #1a1a1a; color: #1a1a1a; background: #faf9f7; }
`

export default function App() {
  const [docs, setDocs] = useState(() => {
    try {
      const saved = localStorage.getItem("docquery_docs")
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })
  const [activeDoc, setActiveDoc] = useState(() => {
    return localStorage.getItem("docquery_active") || null
  })
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  const bottomRef = useRef()
  const textareaRef = useRef()

  useEffect(() => { fetchDocs() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [docs, loading, activeDoc])
  useEffect(() => {
    try { localStorage.setItem("docquery_docs", JSON.stringify(docs)) } catch {}
  }, [docs])
  useEffect(() => {
    if (activeDoc) localStorage.setItem("docquery_active", activeDoc)
  }, [activeDoc])

  async function fetchDocs() {
    try {
      const res = await axios.get(`${API}/documents`)
      const names = res.data.documents || []
      setDocs(prev => {
        const existing = new Set(prev.map(d => d.name))
        const newDocs = names.filter(n => !existing.has(n)).map(n => ({ name: n, chunks: 0, messages: [] }))
        return [...prev, ...newDocs]
      })
    } catch {}
  }

  async function handleUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append("file", file)
    try {
      const res = await axios.post(`${API}/upload`, form)
      const newDoc = {
        name: file.name, chunks: res.data.chunks,
        messages: [{ role: "ai", text: `Indexed "${file.name}" — ${res.data.chunks} chunks ready. Ask me anything about it.`, sources: [] }]
      }
      setDocs(prev => [...prev.filter(d => d.name !== file.name), newDoc])
      setActiveDoc(file.name)
    } catch {
      alert(`Failed to upload "${file.name}".`)
    }
    setUploading(false)
    fileRef.current.value = ""
  }

  async function handleQuery() {
    if (!question.trim() || loading || !activeDoc) return
    const q = question.trim()
    setQuestion("")
    if (textareaRef.current) textareaRef.current.style.height = "40px"
    setDocs(prev => prev.map(d =>
      d.name === activeDoc ? { ...d, messages: [...d.messages, { role: "user", text: q, sources: [] }] } : d
    ))
    setLoading(true)
    try {
      const res = await axios.post(`${API}/query`, { question: q })
      setDocs(prev => prev.map(d =>
        d.name === activeDoc ? { ...d, messages: [...d.messages, { role: "ai", text: res.data.answer, sources: res.data.sources }] } : d
      ))
    } catch {
      setDocs(prev => prev.map(d =>
        d.name === activeDoc ? { ...d, messages: [...d.messages, { role: "ai", text: "Something went wrong. Please try again.", sources: [] }] } : d
      ))
    }
    setLoading(false)
  }

  function clearConversation() {
    setDocs(prev => prev.map(d => d.name === activeDoc ? { ...d, messages: [] } : d))
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleQuery() }
  }

  function autoResize(e) {
    e.target.style.height = "40px"
    e.target.style.height = Math.min(e.target.scrollHeight, 110) + "px"
  }

  const currentDoc = docs.find(d => d.name === activeDoc)
  const messages = currentDoc?.messages || []
  const totalChunks = docs.reduce((s, d) => s + (d.chunks || 0), 0)
  const suggestions = ["What is this document about?", "Summarize the key points", "List all important dates", "What conclusions are drawn?"]

  return (
    <>
      <style>{css}</style>
      <div className="page">
        <input ref={fileRef} type="file" accept=".pdf,.xlsx,.xls,.md,.txt" style={{ display: "none" }} onChange={handleUpload} />

        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <div className="logo-icon">D</div>
              <div>
                <div className="logo-text">DocQuery</div>
                <div className="logo-sub">RAG-powered search</div>
              </div>
            </div>
          </div>

          <div className="upload-area">
            <button className={`upload-btn ${uploading ? "uploading" : ""}`} onClick={() => fileRef.current.click()} disabled={uploading}>
              {uploading ? "↻ Indexing..." : "+ Upload document"}
            </button>
          </div>

          <div className="docs-section">
            <div className="docs-label">Documents</div>
            {docs.length === 0
              ? <div className="no-docs">No documents yet</div>
              : docs.map((d, i) => (
                <div key={i} className={`doc-item ${activeDoc === d.name ? "active" : ""}`} onClick={() => setActiveDoc(d.name)}>
                  <div className="doc-dot" />
                  <span className="doc-name">{d.name}</span>
                  {d.messages.filter(m => m.role === "user").length > 0 && (
                    <span className="doc-count">{d.messages.filter(m => m.role === "user").length}</span>
                  )}
                </div>
              ))
            }
          </div>

          <div className="sidebar-footer">
            <div className="stats">
              <div className="stat">
                <div className="stat-val">{docs.length}</div>
                <div className="stat-label">Docs</div>
              </div>
              <div className="stat">
                <div className="stat-val">{totalChunks}</div>
                <div className="stat-label">Chunks</div>
              </div>
            </div>
          </div>
        </div>

        <div className="chat">
          <div className="chat-header">
            <div>
              <div className="chat-title">{activeDoc || "Select a document"}</div>
              <div className="chat-sub">
                {activeDoc
                  ? `${messages.filter(m => m.role === "user").length} questions asked`
                  : "Upload or select a document from the sidebar"}
              </div>
            </div>
            <div className="header-right">
              {activeDoc && messages.length > 0 && (
                <button className="clear-btn" onClick={clearConversation}>Clear chat</button>
              )}
              <div className="status-dot" title="Connected" />
            </div>
          </div>

          {!activeDoc ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <div className="empty-title">No document selected</div>
              <div className="empty-sub">Upload a new document or click one from the sidebar to start asking questions.</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <div className="empty-title">No conversation yet</div>
              <div className="empty-sub">Ask anything about "{activeDoc}"</div>
              <div className="suggestion-chips">
                {suggestions.map((s, i) => (
                  <button key={i} className="chip" onClick={() => { setQuestion(s); textareaRef.current?.focus() }}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="messages">
              {messages.map((msg, i) => (
                <div key={i} className={`msg-row ${msg.role}`}>
                  <div className={`avatar ${msg.role}`}>{msg.role === "ai" ? "AI" : "U"}</div>
                  <div className={`bubble ${msg.role}`}>
                    <div className="bubble-text">{msg.text}</div>
                    {msg.sources?.length > 0 && (
                      <div>
                        <div className="sources-label">from</div>
                        <div className="sources-row">
                          {msg.sources.map((src, j) => <span key={j} className="source-chip">{src}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="msg-row ai">
                  <div className="avatar ai">AI</div>
                  <div className="bubble ai">
                    <div className="bubble-text" style={{ padding: 0 }}>
                      <div className="thinking-dots">
                        <div className="dot" /><div className="dot" /><div className="dot" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}

          <div className="input-area">
            <div className="input-row">
              <textarea
                ref={textareaRef}
                placeholder={activeDoc ? `Ask about "${activeDoc}"...` : "Select a document first..."}
                value={question}
                onChange={e => { setQuestion(e.target.value); autoResize(e) }}
                onKeyDown={handleKeyDown}
                disabled={loading || !activeDoc}
                rows={1}
              />
              <button className="send-btn" onClick={handleQuery} disabled={loading || !question.trim() || !activeDoc}>↑</button>
            </div>
            <div className="input-hint">Enter to send · Shift+Enter for new line</div>
          </div>
        </div>
      </div>
    </>
  )
}