import React, { useState } from 'react';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setChat((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        const botMessage = { role: 'bot', content: data.response };
        setChat((prev) => [...prev, botMessage]);
      } else {
        const errorMsg = { role: 'bot', content: '⚠️ Error: Invalid response from Gemini API.' };
        setChat((prev) => [...prev, errorMsg]);
      }
    } catch (error) {
      const errorMsg = { role: 'bot', content: '⚠️ Error: Unable to reach the backend.' };
      setChat((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
      <h2>🧠 Chatbot</h2>
      <div style={{
        border: '1px solid #ccc',
        padding: '10px',
        height: '300px',
        overflowY: 'auto',
        marginBottom: '10px',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
      }}>
        {chat.map((msg, index) => (
          <div key={index} style={{ textAlign: msg.role === 'user' ? 'right' : 'left' }}>
            <p><strong>{msg.role === 'user' ? 'You' : 'Gemini'}:</strong> {msg.content}</p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={loading}
        placeholder="Type your message..."
        style={{
          width: '80%',
          padding: '10px',
          borderRadius: '6px',
          border: '1px solid #ccc',
        }}
      />
      <button
        onClick={handleSend}
        disabled={loading}
        style={{
          padding: '10px 16px',
          marginLeft: '8px',
          borderRadius: '6px',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {loading ? '...' : 'Send'}
      </button>
    </div>
  );
};

export default Chatbot;
