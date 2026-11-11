import { useState } from 'react'
import './App.css'
import Trace from './Trace'
import Markdown from './Markdown'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'
const LEAGUE_ID = import.meta.env.VITE_LEAGUE_ID
const TEAM_NAME = import.meta.env.VITE_TEAM_NAME

async function sendMessage(messages) {
  const lastMessage = messages[messages.length - 1].content

  const response = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: lastMessage,
      league_id: Number(LEAGUE_ID),
      ...(TEAM_NAME ? { team_name: TEAM_NAME } : {}),
    }),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  const data = await response.json()
  return {
    reply: data.reply ?? data.response ?? data.message ?? JSON.stringify(data),
    trace: data.trace,
  }
}

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    const nextMessages = [...messages, { role: 'user', content: text }]
    setMessages(nextMessages)
    setInput('')
    setLoading(true)

    try {
      const { reply, trace } = await sendMessage(nextMessages)
      setMessages([...nextMessages, { role: 'assistant', content: reply, trace }])
    } catch (err) {
      setMessages([...nextMessages, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleClear = () => {
    setMessages([])
  }

  return (
    <div className="chat-app">
      <header className="chat-header">
        <h1>Assistant</h1>
        <button type="button" className="clear-btn" onClick={handleClear}>
          Clear chat
        </button>
      </header>

      <main className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.role}`}>
            {msg.role === 'assistant' ? <Markdown text={msg.content} /> : msg.content}
            {msg.trace && <Trace trace={msg.trace} />}
          </div>
        ))}
        {loading && <div className="message assistant loading">Thinking…</div>}
      </main>

      <footer className="chat-input">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
        />
        <button type="button" onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </button>
      </footer>
    </div>
  )
}

export default App
