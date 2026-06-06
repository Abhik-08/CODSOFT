import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/apiService';
import { motion, AnimatePresence } from 'motion/react';
import { FiX, FiSend } from 'react-icons/fi';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const AIChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: 'Hello! I am your AI ATM Assistant. How can I help you manage your accounts today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!user) return null;

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMsgText = input.trim();
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // API call to /ai/chat (axios baseURL prepends http://localhost:8080/api)
      const res = await apiService.post('/ai/chat', { message: userMsgText });

      const aiMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'ai',
        text: res.data.reply,
        timestamp: res.data.timestamp
          ? new Date(res.data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error in AI Chat:', err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(36).substring(7),
        role: 'ai',
        text: 'Something went wrong. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <style>{`
        .chat-widget-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          font-family: var(--font-sans);
        }

        .chat-fab {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background-color: var(--color-primary, #10b981);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid var(--text-primary);
          box-shadow: 4px 4px 0px var(--text-primary);
          position: relative;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          padding: 0;
          outline: none;
        }

        html.dark .chat-fab {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.1);
        }

        .chat-fab:hover {
          transform: translate(-2px, -2px);
          box-shadow: 6px 6px 0px var(--text-primary);
        }

        html.dark .chat-fab:hover {
          box-shadow: 6px 6px 0px rgba(255, 255, 255, 0.15);
        }

        .chat-fab::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--color-primary, #10b981);
          animation: pulse-ring 2s infinite;
          pointer-events: none;
        }

        .chat-fab-wrapper {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .chat-fab-badge {
          background-color: var(--background-elevated);
          color: var(--text-primary);
          border: 2px solid var(--text-primary);
          box-shadow: 3px 3px 0px var(--text-primary);
          padding: 6px 12px;
          border-radius: 12px;
          font-family: var(--font-mono);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          white-space: nowrap;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          outline: none;
        }

        html.dark .chat-fab-badge {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 3px 3px 0px rgba(255, 255, 255, 0.1);
        }

        .chat-fab-badge:hover {
          transform: translate(-1px, -1px);
          box-shadow: 4px 4px 0px var(--text-primary);
        }

        html.dark .chat-fab-badge:hover {
          box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.15);
        }

        .chat-fab-badge-spark {
          color: #eab308;
          animation: spin-spark 4s linear infinite;
          display: inline-block;
        }

        @keyframes spin-spark {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .chat-fab-badge-arrow {
          transition: transform 0.2s ease;
        }

        .chat-fab-badge:hover .chat-fab-badge-arrow {
          transform: translateX(2px);
        }

        .chat-fab-notification-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          background-color: #ef4444;
          border: 2px solid var(--background-elevated);
          border-radius: 50%;
          animation: dot-pulse 1.8s infinite ease-in-out;
        }

        @keyframes dot-pulse {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.15); }
          100% { transform: scale(0.9); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .chat-fab-logo-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .chat-header-logo-img {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid var(--text-primary);
          object-fit: cover;
        }

        html.dark .chat-header-logo-img {
          border-color: rgba(255, 255, 255, 0.2);
        }

        .chat-window {
          width: 360px;
          height: 500px;
          background-color: var(--background-elevated);
          border: 2px solid var(--text-primary);
          box-shadow: 6px 6px 0px var(--text-primary);
          border-radius: 20px;
          position: absolute;
          bottom: 82px;
          right: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          color: var(--text-primary);
        }

        html.dark .chat-window {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 6px 6px 0px rgba(255, 255, 255, 0.1);
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 2px solid var(--text-primary);
          background-color: var(--background-elevated);
        }

        html.dark .chat-header {
          border-bottom-color: rgba(255, 255, 255, 0.1);
        }

        .chat-header-title {
          font-family: var(--font-mono);
          font-weight: 850;
          font-size: 15px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-close-btn {
          background: transparent;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .chat-close-btn:hover {
          opacity: 1;
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background-color: var(--chassis);
        }

        .chat-bubble-wrapper {
          display: flex;
          flex-direction: column;
          max-width: 80%;
        }

        .chat-bubble-wrapper.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .chat-bubble-wrapper.ai {
          align-self: flex-start;
          align-items: flex-start;
        }

        .chat-bubble {
          padding: 10px 14px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.45;
          border: 1.5px solid var(--text-primary);
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        html.dark .chat-bubble {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 2px 2px 0px rgba(255, 255, 255, 0.1);
        }

        .chat-bubble.user {
          background-color: var(--color-primary, #10b981);
          color: #fff;
          border-bottom-right-radius: 4px;
        }

        .chat-bubble.ai {
          background-color: var(--background-elevated);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }

        .chat-timestamp {
          font-size: 10px;
          color: var(--text-muted);
          margin-top: 4px;
        }

        .chat-input-area {
          padding: 12px 16px;
          border-top: 2px solid var(--text-primary);
          background-color: var(--background-elevated);
          display: flex;
          gap: 8px;
          align-items: center;
        }

        html.dark .chat-input-area {
          border-top-color: rgba(255, 255, 255, 0.1);
        }

        .chat-input {
          flex: 1;
          height: 38px;
          padding: 0 12px;
          border-radius: 8px;
          border: 1.5px solid var(--text-primary);
          background-color: var(--chassis);
          color: var(--text-primary);
          font-size: 13px;
          outline: none;
        }

        html.dark .chat-input {
          border-color: rgba(255, 255, 255, 0.15);
        }

        .chat-input:focus {
          border-color: var(--color-secondary, #3b82f6);
        }

        .chat-send-btn {
          height: 38px;
          width: 38px;
          border-radius: 8px;
          border: 1.5px solid var(--text-primary);
          background-color: var(--color-secondary, #3b82f6);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s ease, box-shadow 0.1s ease;
          box-shadow: 2px 2px 0px var(--text-primary);
        }

        html.dark .chat-send-btn {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 2px 2px 0px rgba(255, 255, 255, 0.1);
        }

        .chat-send-btn:hover:not(:disabled) {
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0px var(--text-primary);
        }

        .chat-send-btn:disabled, .chat-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 10px 14px;
          background-color: var(--background-elevated);
          border: 1.5px solid var(--text-primary);
          box-shadow: 2px 2px 0px var(--text-primary);
          border-radius: 14px;
          border-bottom-left-radius: 4px;
          width: fit-content;
          align-items: center;
          justify-content: center;
        }

        html.dark .typing-indicator {
          border-color: rgba(255, 255, 255, 0.15);
          box-shadow: 2px 2px 0px rgba(255, 255, 255, 0.1);
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          background-color: var(--text-muted);
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>

      <div className="chat-widget-container">
        {/* Expanded Chat Window */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="chat-window"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="chat-header">
                <div className="chat-header-title">
                  <img src="/nexus_ai_logo.jpg" alt="Nexus AI" className="chat-header-logo-img" />
                  <span>Nexus AI Assistant</span>
                </div>
                <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                  <FiX />
                </button>
              </div>

              {/* Message History */}
              <div className="chat-messages">
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    className={`chat-bubble-wrapper ${msg.role}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={`chat-bubble ${msg.role}`}>
                      {msg.text}
                    </div>
                    <span className="chat-timestamp">{msg.timestamp}</span>
                  </motion.div>
                ))}

                {/* Bouncing Dots Loading Indicator */}
                {isTyping && (
                  <div className="typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="chat-input-area">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Ask me about your ledger..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  maxLength={200}
                  disabled={isTyping}
                />
                <button
                  className="chat-send-btn"
                  onClick={sendMessage}
                  disabled={isTyping || !input.trim()}
                >
                  <FiSend size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collapsed FAB and badge */}
        <div className="chat-fab-wrapper">
          <button 
            className={`chat-fab ${isOpen ? 'open' : ''}`} 
            onClick={() => setIsOpen(!isOpen)} 
            aria-label="Toggle AI Chat"
          >
            {isOpen ? (
              <FiX size={24} />
            ) : (
              <img src="/nexus_ai_logo.jpg" alt="Nexus AI Logo" className="chat-fab-logo-img" />
            )}
            {!isOpen && <span className="chat-fab-notification-dot"></span>}
          </button>
          
          {!isOpen && (
            <button className="chat-fab-badge" onClick={() => setIsOpen(true)} type="button">
              <span className="chat-fab-badge-spark">✦</span>
              <span className="chat-fab-badge-text">Vault AI Chat</span>
              <span className="chat-fab-badge-arrow">→</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default AIChatWidget;
