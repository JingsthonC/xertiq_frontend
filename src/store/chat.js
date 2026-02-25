import { create } from "zustand";
import apiService from "../services/api";

const useChatStore = create((set, get) => ({
  // UI state
  isOpen: false,
  activeTab: "chat", // chat | faq | ticket

  // Chat state
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isSending: false,

  // FAQ state
  faqs: [],
  faqCategories: [],

  // Ticket state
  tickets: [],

  toggleChat: () => set((s) => ({ isOpen: !s.isOpen })),
  setActiveTab: (tab) => set({ activeTab: tab }),

  loadConversations: async () => {
    try {
      set({ isLoading: true });
      const res = await apiService.getChatConversations();
      set({ conversations: res.data, isLoading: false });
    } catch (error) {
      console.error("Failed to load conversations:", error);
      set({ isLoading: false });
    }
  },

  startNewConversation: async () => {
    try {
      set({ isSending: true });
      const res = await apiService.createChatConversation();
      const conv = res.data;
      set((s) => ({
        conversations: [conv, ...s.conversations],
        activeConversationId: conv.id,
        messages: conv.messages || [],
        isSending: false,
      }));
      return conv;
    } catch (error) {
      console.error("Failed to create conversation:", error);
      set({ isSending: false });
      throw error;
    }
  },

  selectConversation: async (id) => {
    try {
      set({ isLoading: true, activeConversationId: id });
      const res = await apiService.getChatConversation(id);
      set({ messages: res.data.messages || [], isLoading: false });
    } catch (error) {
      console.error("Failed to load conversation:", error);
      set({ isLoading: false });
    }
  },

  deleteConversation: async (id) => {
    try {
      await apiService.deleteChatConversation(id);
      set((s) => {
        const conversations = s.conversations.filter((c) => c.id !== id);
        const newState = { conversations };
        if (s.activeConversationId === id) {
          newState.activeConversationId = null;
          newState.messages = [];
        }
        return newState;
      });
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  },

  sendMessage: async (content) => {
    const { activeConversationId } = get();
    let conversationId = activeConversationId;

    try {
      set({ isSending: true });

      // Auto-create conversation if none active
      if (!conversationId) {
        const conv = await get().startNewConversation();
        conversationId = conv.id;
      }

      // Optimistically add user message
      const userMsg = {
        id: "temp-" + Date.now(),
        role: "USER",
        content,
        createdAt: new Date().toISOString(),
      };
      set((s) => ({ messages: [...s.messages, userMsg] }));

      const res = await apiService.sendChatMessage(conversationId, content);

      // Replace temp message and add assistant response
      set((s) => ({
        messages: [
          ...s.messages.filter((m) => m.id !== userMsg.id),
          { ...userMsg, id: "user-" + Date.now() },
          res.data,
        ],
        isSending: false,
      }));

      // Update conversation title in list
      set((s) => ({
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                messages: [{ content: res.data.content, createdAt: res.data.createdAt, role: "ASSISTANT" }],
              }
            : c
        ),
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      set({ isSending: false });
      throw error;
    }
  },

  loadFaqs: async () => {
    try {
      set({ isLoading: true });
      const [faqRes, catRes] = await Promise.all([
        apiService.getFaqs(),
        apiService.getFaqCategories(),
      ]);
      set({
        faqs: faqRes.data,
        faqCategories: catRes.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to load FAQs:", error);
      set({ isLoading: false });
    }
  },

  loadTickets: async () => {
    try {
      set({ isLoading: true });
      const res = await apiService.getMyTickets();
      set({ tickets: res.data, isLoading: false });
    } catch (error) {
      console.error("Failed to load tickets:", error);
      set({ isLoading: false });
    }
  },

  submitTicket: async (data) => {
    try {
      const res = await apiService.createTicket(data);
      set((s) => ({ tickets: [res.data, ...s.tickets] }));
      return res.data;
    } catch (error) {
      console.error("Failed to create ticket:", error);
      throw error;
    }
  },
}));

export default useChatStore;
