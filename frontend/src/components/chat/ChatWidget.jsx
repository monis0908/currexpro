import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiTrash2,
  FiMinimize2,
  FiZap,
} from "react-icons/fi";
import { sendChatMessage } from "../../services/chatService";

const QUICK_PROMPTS = [
  "How do I record a currency buy deal?",
  "How do exchange rates and margins work?",
  "Difference between Cash and Transfer accounts?",
  "How do I export a report?",
];

const INITIAL_MESSAGE = {
  id: "welcome",
  role: "model",
  text: "Hello! I am your CurrEx Assistant. I can help you navigate exchange rates, book transactions, understand reports, and explain ERP features. What would you like to know?",
  time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, loading]);

  // Convert internal messages to Gemini history format [{ role: 'user'|'model', parts: [{ text }] }]
  const buildHistory = () => {
    return messages
      .filter((m) => m.id !== "welcome" && !m.isError)
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));
  };

  const handleSend = async (messageText) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    setError(null);
    setInput("");

    const userMessage = {
      id: "u-" + Date.now(),
      role: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Append user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const history = buildHistory();
      const res = await sendChatMessage(textToSend, history);

      if (res && res.reply) {
        const botReply = {
          id: "m-" + Date.now(),
          role: "model",
          text: res.reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, botReply]);
      } else {
        throw new Error("No response received from assistant.");
      }
    } catch (err) {
      console.error("Chat error:", err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        "Could not connect to CurrEx Assistant. Please try again.";
      setError(errorMessage);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "model",
          text: "⚠️ " + errorMessage,
          isError: true,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        ...INITIAL_MESSAGE,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setError(null);
  };

  // Simple formatting for bold, bullets, and line breaks
  const renderFormattedText = (rawText) => {
    const lines = rawText.split("\n");
    return lines.map((line, idx) => {
      // Check for bullet list
      const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("* ");
      const content = isBullet ? line.trim().substring(2) : line;

      // Handle bold **text**
      const parts = content.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={pIdx} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={idx} className="ml-4 list-disc text-sm text-slate-700 my-0.5">
            {renderedParts}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p key={idx} className="text-sm leading-relaxed text-slate-700 my-0.5">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* ── Floating Action Trigger Button ──────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen((prev) => !prev)}
          className={`flex items-center gap-2.5 px-4 py-3.5 rounded-full shadow-lift transition-colors duration-200 text-white font-medium text-sm ${
            isOpen ? "bg-ink hover:bg-ink-light" : "bg-mint hover:bg-emerald-600"
          }`}
          aria-label={isOpen ? "Close AI Assistant" : "Open CurrEx AI Assistant"}
        >
          {isOpen ? (
            <>
              <FiX size={20} />
              <span className="hidden sm:inline">Close</span>
            </>
          ) : (
            <>
              <div className="relative">
                <FiMessageSquare size={20} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 ring-2 ring-white animate-pulse" />
              </div>
              <span>AI Assistant</span>
            </>
          )}
        </motion.button>
      </div>

      {/* ── Animated Chat Modal / Flyout ────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-20 right-4 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[420px] h-[580px] max-h-[calc(100vh-6.5rem)] bg-white rounded-2xl shadow-2xl border border-black/10 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-ink text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-mint/20 border border-mint/40 flex items-center justify-center text-mint">
                  <FiZap size={18} />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm leading-tight text-white flex items-center gap-2">
                    CurrEx Assistant
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-mint/20 text-mint border border-mint/30">
                      Live
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">Powered by Gemini AI</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleClear}
                  title="Clear conversation"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <FiMinimize2 size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-paper">
              {messages.map((m) => {
                const isUser = m.role === "user";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-soft ${
                        isUser
                          ? "bg-ink text-white rounded-br-sm"
                          : m.isError
                          ? "bg-coral-light text-coral border border-coral/20 rounded-bl-sm"
                          : "bg-white text-ink border border-black/5 rounded-bl-sm"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <div className="space-y-1">{renderFormattedText(m.text)}</div>
                      )}
                    </div>
                    <span className="text-[10px] text-muted mt-1 px-1">{m.time}</span>
                  </div>
                );
              })}

              {/* Typing / Loading indicator */}
              {loading && (
                <div className="flex flex-col items-start">
                  <div className="bg-white border border-black/5 rounded-2xl rounded-bl-sm px-4 py-3 shadow-soft flex items-center gap-2">
                    <span className="text-xs text-muted font-medium">Assistant is thinking</span>
                    <div className="flex gap-1 items-center">
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
                        className="w-1.5 h-1.5 rounded-full bg-mint"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.2,
                          ease: "easeInOut",
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-mint"
                      />
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          delay: 0.4,
                          ease: "easeInOut",
                        }}
                        className="w-1.5 h-1.5 rounded-full bg-mint"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips (Shown when only initial message is visible) */}
            {messages.length <= 1 && (
              <div className="px-4 py-2 bg-paper border-t border-black/5 flex flex-wrap gap-1.5">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    disabled={loading}
                    className="text-xs bg-white hover:bg-mint-light hover:text-mint border border-black/5 px-2.5 py-1.5 rounded-lg text-muted transition-colors text-left"
                  >
                    💬 {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-black/5 flex items-center gap-2 shrink-0">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about rates, deals, accounts..."
                disabled={loading}
                className="flex-1 bg-paper border border-black/10 rounded-xl px-3.5 py-2.5 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-mint focus:border-transparent transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-mint hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-mint text-white transition-colors flex items-center justify-center shrink-0 shadow-soft"
                title="Send"
              >
                <FiSend size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

