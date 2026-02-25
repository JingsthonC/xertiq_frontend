import { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  X,
  Send,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  Ticket,
  Loader2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
import useChatStore from "../store/chat";
import showToast from "../utils/toast";

const PRIORITY_COLORS = {
  LOW: "bg-slate-100 text-slate-600",
  MEDIUM: "bg-blue-100 text-blue-600",
  HIGH: "bg-orange-100 text-orange-600",
  URGENT: "bg-red-100 text-red-600",
};

const STATUS_COLORS = {
  OPEN: "bg-green-100 text-green-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-blue-100 text-blue-700",
  CLOSED: "bg-slate-100 text-slate-600",
};

// ==================== Chat Tab ====================
function ChatTab() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isSending,
    loadConversations,
    startNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const text = input.trim();
    setInput("");
    try {
      await sendMessage(text);
    } catch {
      showToast.error("Failed to send message. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with history toggle */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-2"
        >
          <MessageSquare size={18} />
          History
          {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
        <button
          onClick={() => startNewConversation()}
          className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={16} /> New Chat
        </button>
      </div>

      {/* Conversation history dropdown */}
      {showHistory && (
        <div className="max-h-48 overflow-y-auto border-b border-slate-200 bg-white">
          {conversations.length === 0 ? (
            <p className="text-sm text-slate-400 p-4 text-center">No conversations yet</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between px-5 py-3 text-sm cursor-pointer hover:bg-slate-50 ${
                  c.id === activeConversationId ? "bg-blue-50 text-blue-700" : "text-slate-600"
                }`}
              >
                <span
                  onClick={() => {
                    selectConversation(c.id);
                    setShowHistory(false);
                  }}
                  className="flex-1 truncate"
                >
                  {c.title || "New conversation"}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(c.id);
                  }}
                  className="ml-3 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : messages.length === 0 && !activeConversationId ? (
          <div className="text-center text-slate-400 py-16">
            <MessageCircle size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg">Start a new conversation!</p>
            <p className="text-sm mt-1">Ask me anything about XertiQ.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "USER" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-xl px-5 py-3 text-base leading-relaxed whitespace-pre-wrap ${
                  msg.role === "USER"
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {isSending && (
          <div className="flex justify-start">
            <div className="bg-slate-100 rounded-xl px-5 py-3 text-base text-slate-500">
              <Loader2 className="animate-spin inline mr-2" size={18} />
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-300 px-4 py-3 text-base focus:outline-none focus:border-blue-500 max-h-28"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="bg-blue-500 text-white p-3 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== FAQ Tab ====================
function FaqTab() {
  const { faqs, faqCategories, isLoading, loadFaqs } = useChatStore();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadFaqs();
  }, []);

  const filteredFaqs = selectedCategory
    ? faqs.filter((f) => f.category === selectedCategory)
    : faqs;

  return (
    <div className="flex flex-col h-full">
      {/* Category pills */}
      <div className="flex gap-2 px-5 py-3 overflow-x-auto border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`text-sm px-4 py-1.5 rounded-full whitespace-nowrap ${
            !selectedCategory ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600 hover:bg-slate-300"
          }`}
        >
          All
        </button>
        {faqCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`text-sm px-4 py-1.5 rounded-full whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-600 hover:bg-slate-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : filteredFaqs.length === 0 ? (
          <p className="text-center text-slate-400 text-base py-12">No FAQs found</p>
        ) : (
          filteredFaqs.map((faq) => (
            <div key={faq.id} className="border border-slate-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between px-5 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 text-left"
              >
                <span className="flex-1">{faq.question}</span>
                <ChevronDown
                  size={18}
                  className={`ml-3 text-slate-400 transition-transform ${
                    expandedId === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {expandedId === faq.id && (
                <div className="px-5 py-4 text-base text-slate-600 border-t border-slate-100 bg-slate-50 whitespace-pre-wrap leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== Ticket Tab ====================
function TicketTab() {
  const { tickets, isLoading, loadTickets, submitTicket } = useChatStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "MEDIUM" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.description.trim()) return;
    try {
      setSubmitting(true);
      await submitTicket(form);
      setForm({ subject: "", description: "", priority: "MEDIUM" });
      setShowForm(false);
      showToast.success("Support ticket created!");
    } catch {
      showToast.error("Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50">
        <span className="text-sm text-slate-500 font-semibold">Support Tickets</span>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {/* Create form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="border border-blue-200 rounded-xl p-5 bg-blue-50 space-y-3 mb-4">
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              maxLength={200}
              className="w-full text-base border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
            />
            <textarea
              placeholder="Describe your issue..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              maxLength={5000}
              rows={4}
              className="w-full text-base border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex items-center gap-3">
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-sm text-slate-500 hover:text-slate-700 px-3 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !form.subject.trim() || !form.description.trim()}
                className="text-sm bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? "Creating..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        {/* Ticket list */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-slate-400 py-16">
            <Ticket size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-lg">No tickets yet</p>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <h4 className="text-base font-medium text-slate-700 flex-1">{ticket.subject}</h4>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[ticket.status]}`}>
                  {ticket.status.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2">{ticket.description}</p>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_COLORS[ticket.priority]}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== Main Widget ====================
export default function ChatbotWidget() {
  const { isOpen, activeTab, toggleChat, setActiveTab } = useChatStore();

  const tabs = [
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "faq", label: "FAQs", icon: HelpCircle },
    { id: "ticket", label: "Tickets", icon: Ticket },
  ];

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
          aria-label="Open chat"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[768px] h-[750px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Panel header */}
          <div className="bg-blue-500 text-white px-6 py-4 flex items-center justify-between">
            <h3 className="font-semibold text-lg">XertiQ Support</h3>
            <button onClick={toggleChat} className="hover:bg-blue-600 rounded-lg p-1.5">
              <X size={22} />
            </button>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-slate-200">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-blue-600 border-b-2 border-blue-500"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" && <ChatTab />}
            {activeTab === "faq" && <FaqTab />}
            {activeTab === "ticket" && <TicketTab />}
          </div>
        </div>
      )}
    </>
  );
}
