import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Layers, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Sparkles,
  BookOpen
} from 'lucide-react';

const SUGGESTIONS = [
  { text: "I am hiring a Java developer", label: "Developer Role" },
  { text: "Help me find cognitive ability tests for manager positions", label: "Manager Cognitive" },
  { text: "Compare OPQ and GSA assessments", label: "Product Comparison" },
  { text: "I need behavioral and personality tests for customer support", label: "Support Personality" }
];

const TEST_TYPE_LABELS = {
  'K': 'Knowledge Test',
  'A': 'Ability / Cognitive Test',
  'P': 'Personality Questionnaire',
  'C': 'Competency / Skills',
  'U': 'Assessment'
};

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [endOfConversation, setEndOfConversation] = useState(false);
  
  const threadEndRef = useRef(null);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      
      // Update recommendations only if a new list is explicitly returned
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
      }
      
      if (data.end_of_conversation) {
        setEndOfConversation(true);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the backend server. Please verify it is running on port 8000.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setRecommendations([]);
    setEndOfConversation(false);
    setError(null);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo">S</div>
          <h1 className="brand-name">SHL Recommender</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {messages.length > 0 && (
            <button 
              onClick={handleReset}
              className="view-details-btn"
              style={{ width: 'auto', padding: '0.4rem 0.8rem', display: 'flex', gap: '0.25rem' }}
            >
              <RefreshCw size={14} /> Reset Chat
            </button>
          )}
          <div className="status-badge">
            <span className="status-dot"></span>
            Agent Active
          </div>
        </div>
      </header>

      {/* Main Area */}
      <main className="main-content">
        {/* Chat Section */}
        <section className="chat-pane">
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <div className="welcome-icon">
                <Sparkles size={32} />
              </div>
              <h2 className="welcome-title">SHL Assessment Finder</h2>
              <p className="welcome-desc">
                Tell me about the role you are hiring for, the seniority level, or target skills. I will search the catalog and curate a shortlist of matching SHL assessments.
              </p>
              <div className="suggestion-grid">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion.text)}
                    className="suggestion-card"
                  >
                    <div className="suggestion-text">{suggestion.text}</div>
                    <div className="suggestion-action">{suggestion.label} →</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="message-thread">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message-wrapper ${msg.role}`}>
                  <div className="message-bubble">
                    <div className="message-text">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message-wrapper assistant">
                  <div className="message-bubble typing-bubble">
                    <span className="dot-anim"></span>
                    <span className="dot-anim"></span>
                    <span className="dot-anim"></span>
                  </div>
                </div>
              )}

              {error && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                  <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.2)', 
                    color: '#f87171',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <AlertTriangle size={16} />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {endOfConversation && (
                <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
                  <div style={{ 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid rgba(16, 185, 129, 0.2)', 
                    color: '#34d399',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '0.75rem',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <CheckCircle2 size={16} />
                    <span>Shortlist finalized. Feel free to start a new chat if you need anything else!</span>
                  </div>
                </div>
              )}
              
              <div ref={threadEndRef} />
            </div>
          )}

          {/* Input Panel */}
          <div className="chat-input-container">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }} className="chat-input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about roles, skills, seniority, or compare tests..."
                className="chat-textarea"
                disabled={isLoading || endOfConversation}
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || endOfConversation}
                className="send-button"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </section>

        {/* Sidebar / Recommendations */}
        <section className="sidebar-section">
          <div className="sidebar-header">
            <div className="sidebar-title">
              <Layers size={18} style={{ color: '#818cf8' }} />
              <span>Assessment Shortlist</span>
            </div>
            {recommendations.length > 0 && (
              <span className="shortlist-count">{recommendations.length}</span>
            )}
          </div>

          <div className="sidebar-content">
            {recommendations.length === 0 ? (
              <div className="empty-shortlist">
                <div className="empty-shortlist-icon">
                  <BookOpen size={20} />
                </div>
                <div className="empty-shortlist-text">
                  Your shortlist is empty.<br/>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Recommendations will populate here as the conversation progresses.</span>
                </div>
              </div>
            ) : (
              recommendations.map((item, idx) => (
                <div key={idx} className="assessment-card">
                  <div className="assessment-card-header">
                    <span className="assessment-name">{item.name}</span>
                    <span className={`assessment-badge ${item.test_type}`}>
                      {item.test_type}
                    </span>
                  </div>
                  <div className="assessment-type-label">
                    Type: {TEST_TYPE_LABELS[item.test_type] || TEST_TYPE_LABELS['U']}
                  </div>
                  {item.url && (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="view-details-btn"
                    >
                      <span>View in Catalog</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
