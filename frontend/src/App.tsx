import ChatWidget from './components/ChatWidget';

function App() {
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
          className="cta-button chat-launcher-trigger"
        >
          Start Chatting
        </button>
      </div>
      <ChatWidget />
    </div>
  );
}

export default App;
