import { useState } from 'react';
import ChatWidget from './components/ChatWidget';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="landing-page">
      <div className="hero-content">
        <h1 className="hero-title">Experience Support Reimagined</h1>
        <p className="hero-subtitle">
          Instant answers, 24/7 availability, and seamless resolution.
          <br />
          See how our AI Assistant can transform your customer service today.
        </p>
        <button
          className="cta-button"
          onClick={() => setIsChatOpen(true)}
        >
          Start Chatting
        </button>
      </div>

      {!isChatOpen && (
        <button
          className="chat-launcher"
          onClick={() => setIsChatOpen(true)}
          aria-label="Open chat"
        >
          💬
        </button>
      )}

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export default App;
