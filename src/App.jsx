import { useState } from 'react'
import './App.css'

// TODO: replace with real API call once endpoint details are provided
async function sendMessage(messages) {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return 'This is a placeholder response. Hook up the real API to replace me.'
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
      const reply = await sendMessage(nextMessages)
      setMessages([...nextMessages, { role: 'assistant', content: reply }])
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
            {msg.content}
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
