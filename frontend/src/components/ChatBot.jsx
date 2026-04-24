import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { chatAPI, transactionAPI } from "../utils/api.js";

// Quick suggestion chips for first-time users
const SUGGESTIONS = [
  "How can I save more?",
  "Analyze my spending",
  "Help me budget better",
  "Tips for reducing expenses",
];

export default function ChatBot() {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hey there! 👋 I'm **FinBot**, your personal finance assistant. Ask me about budgeting, spending analysis, or saving tips!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [pulse, setPulse] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Stop pulse animation after first open
  useEffect(() => {
    if (isOpen) setPulse(false);
  }, [isOpen]);

  // Fetch financial context for richer AI responses
  async function getFinancialContext() {
    try {
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const summary = await transactionAPI.getSummary(token, month, year);
      return {
        totalIncome: parseFloat(summary.total_income) || 0,
        totalExpenses: parseFloat(summary.total_expenses) || 0,
        netBalance:
          (parseFloat(summary.total_income) || 0) -
          (parseFloat(summary.total_expenses) || 0),
        transactionCount: parseInt(summary.transaction_count) || 0,
      };
    } catch {
      return null;
    }
  }

  async function handleSend(messageText = null) {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    setShowSuggestions(false);
    setInput("");

    // Add user message
    const userMsg = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const financialContext = await getFinancialContext();

      const data = await chatAPI.send(token, {
        message: text,
        history: messages.filter((m) => m.role !== "system"),
        financialContext,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ ${err.message || "Something went wrong. Please try again."}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Simple markdown-ish rendering for bold text
  function renderContent(text) {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} style={{ color: "var(--accent-green)" }}>
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <>
      {/* ---- Floating Action Button ---- */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: isOpen
            ? "var(--bg-card)"
            : "linear-gradient(135deg, var(--accent-green), #28a850)",
          border: isOpen ? "1px solid var(--border-light)" : "none",
          color: isOpen ? "var(--text-primary)" : "#050d07",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isOpen
            ? "0 4px 20px rgba(0,0,0,0.3)"
            : "0 4px 24px rgba(61, 220, 112, 0.35)",
          transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
          zIndex: 1000,
          animation: pulse ? "chatPulse 2s infinite" : "none",
        }}
      >
        {isOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
            <circle cx="8" cy="10" r="1" />
            <circle cx="12" cy="10" r="1" />
            <circle cx="16" cy="10" r="1" />
          </svg>
        )}
      </button>

      {/* ---- Chat Window ---- */}
      {isOpen && (
        <div
          id="chatbot-window"
          style={{
            position: "fixed",
            bottom: "92px",
            right: "24px",
            width: "380px",
            maxHeight: "520px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow:
              "0 12px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(61, 220, 112, 0.06)",
            zIndex: 999,
            animation: "chatSlideUp 0.3s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background:
                "linear-gradient(135deg, rgba(61,220,112,0.08), transparent)",
              borderBottom: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "12px",
                background:
                  "linear-gradient(135deg, var(--accent-green), #28a850)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="#050d07"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}
              >
                FinBot
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--accent-green)",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--accent-green)",
                    display: "inline-block",
                    animation: "statusPulse 2s infinite",
                  }}
                />
                AI-Powered Assistant
              </div>
            </div>
            <button
              onClick={() =>
                setMessages([
                  {
                    role: "assistant",
                    content:
                      "Hey there! 👋 I'm **FinBot**, your personal finance assistant. Ask me about budgeting, spending analysis, or saving tips!",
                  },
                ])
              }
              title="Clear chat"
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: "5px 8px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "var(--border-light)";
                e.target.style.color = "var(--text-secondary)";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.color = "var(--text-muted)";
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ pointerEvents: "none" }}
              >
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minHeight: "280px",
              maxHeight: "340px",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.role === "user" ? "flex-end" : "flex-start",
                  animation: "msgFadeIn 0.25s ease",
                }}
              >
                <div
                  style={{
                    maxWidth: "85%",
                    padding: "0.65rem 0.9rem",
                    borderRadius:
                      msg.role === "user"
                        ? "14px 14px 4px 14px"
                        : "14px 14px 14px 4px",
                    background:
                      msg.role === "user"
                        ? "linear-gradient(135deg, var(--accent-green), #28a850)"
                        : "var(--bg-card)",
                    color: msg.role === "user" ? "#050d07" : "var(--text-primary)",
                    border:
                      msg.role === "user"
                        ? "none"
                        : "1px solid var(--border)",
                    fontSize: "0.85rem",
                    lineHeight: "1.5",
                    fontWeight: msg.role === "user" ? "500" : "400",
                    wordBreak: "break-word",
                  }}
                >
                  {msg.role === "assistant"
                    ? renderContent(msg.content)
                    : msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "0.7rem 1rem",
                    borderRadius: "14px 14px 14px 4px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    display: "flex",
                    gap: "5px",
                    alignItems: "center",
                  }}
                >
                  <span className="typing-dot" style={{ animationDelay: "0s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.15s" }} />
                  <span className="typing-dot" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {showSuggestions && messages.length <= 1 && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                  marginTop: "4px",
                }}
              >
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    style={{
                      background: "rgba(61, 220, 112, 0.06)",
                      border: "1px solid rgba(61, 220, 112, 0.18)",
                      borderRadius: "20px",
                      color: "var(--accent-green)",
                      fontSize: "0.76rem",
                      padding: "0.35rem 0.75rem",
                      cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.2s",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "rgba(61, 220, 112, 0.12)";
                      e.target.style.borderColor = "rgba(61, 220, 112, 0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "rgba(61, 220, 112, 0.06)";
                      e.target.style.borderColor = "rgba(61, 220, 112, 0.18)";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div
            style={{
              padding: "0.75rem 1rem",
              borderTop: "1px solid var(--border)",
              display: "flex",
              gap: "8px",
              alignItems: "center",
              background: "var(--bg-card)",
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your finances..."
              disabled={isLoading}
              style={{
                flex: 1,
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
                padding: "0.6rem 0.9rem",
                borderRadius: "12px",
                fontSize: "0.85rem",
                fontFamily: "'DM Sans', sans-serif",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--accent-green)")
              }
              onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background:
                  input.trim() && !isLoading
                    ? "linear-gradient(135deg, var(--accent-green), #28a850)"
                    : "var(--bg-surface)",
                border:
                  input.trim() && !isLoading
                    ? "none"
                    : "1px solid var(--border)",
                color:
                  input.trim() && !isLoading
                    ? "#050d07"
                    : "var(--text-muted)",
                cursor:
                  input.trim() && !isLoading ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s",
                flexShrink: 0,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
