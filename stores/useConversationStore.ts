import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Item, MessageItem } from "@/lib/assistant";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { INITIAL_MESSAGE } from "@/config/constants";

interface ConversationState {
  // Items displayed in the chat
  chatMessages: Item[];
  // Items sent to the Responses API
  conversationItems: any[];
  // Whether we are waiting for the assistant response
  isAssistantLoading: boolean;
  // Session management
  sessions: any[];
  currentSessionId: string | null;
  _hasHydrated: boolean;

  setChatMessages: (items: Item[]) => void;
  setConversationItems: (messages: any[]) => void;
  addChatMessage: (item: Item) => void;
  addConversationItem: (message: ChatCompletionMessageParam) => void;
  setAssistantLoading: (loading: boolean) => void;
  rawSet: (state: any) => void;
  resetConversation: () => void;
  setHasHydrated: (state: boolean) => void;
  
  // Session actions
  loadSessions: () => Promise<void>;
  setCurrentSessionId: (id: string | null) => void;
  switchSession: (id: string) => Promise<void>;
  saveCurrentSession: () => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
}

const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      chatMessages: [],
      conversationItems: [],
      isAssistantLoading: false,
      sessions: [],
      currentSessionId: null,
      _hasHydrated: false,

      setChatMessages: (items) => set({ chatMessages: items }),
      setConversationItems: (messages) => set({ conversationItems: messages }),
      addChatMessage: (item) =>
        set((state) => ({ chatMessages: [...state.chatMessages, item] })),
      addConversationItem: (message) =>
        set((state) => ({
          conversationItems: [...state.conversationItems, message],
        })),
      setAssistantLoading: (loading) => set({ isAssistantLoading: loading }),
      rawSet: set,
      resetConversation: () =>
        set(() => ({
          chatMessages: [],
          conversationItems: [],
          currentSessionId: null,
        })),
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      loadSessions: async () => {
        try {
          const res = await fetch("/api/sessions");
          const data = await res.json();
          set({ sessions: data });
        } catch (error) {
          console.error("Failed to load sessions:", error);
        }
      },

      setCurrentSessionId: (id) => set({ currentSessionId: id }),

      switchSession: async (id) => {
        try {
          const res = await fetch(`/api/sessions/${id}`);
          const session = await res.json();
          if (session.id) {
            set({
              currentSessionId: session.id,
              chatMessages: JSON.parse(session.chatMessages),
              conversationItems: JSON.parse(session.conversationItems),
            });
          }
        } catch (error) {
          console.error("Failed to switch session:", error);
        }
      },

      saveCurrentSession: async () => {
        const { currentSessionId, chatMessages, conversationItems } = get();
        
        // If no messages, don't save yet
        if (chatMessages.length === 0) return;

        try {
          if (currentSessionId) {
            // Update existing
            await fetch(`/api/sessions/${currentSessionId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ chatMessages, conversationItems }),
            });
          } else {
            // Create new
            let title = "New Conversation";
            
            // If we have at least one user message and one assistant message, generate a descriptive title
            const hasUser = chatMessages.some(m => m.type === "message" && m.role === "user");
            const hasAssistant = chatMessages.some(m => m.type === "message" && m.role === "assistant");

            if (hasUser && hasAssistant) {
              try {
                const titleRes = await fetch("/api/sessions/generate_title", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ messages: conversationItems }),
                });
                const titleData = await titleRes.json();
                if (titleData.title) {
                  title = titleData.title;
                }
              } catch (e) {
                console.error("Failed to generate title:", e);
                const firstUserMsg = chatMessages.find(m => m.type === "message" && m.role === "user") as MessageItem | undefined;
                title = (firstUserMsg?.content?.[0] as any)?.text?.slice(0, 40) || "New Conversation";
              }
            } else {
              const firstUserMsg = chatMessages.find(m => m.type === "message" && m.role === "user") as MessageItem | undefined;
              title = (firstUserMsg?.content?.[0] as any)?.text?.slice(0, 40) || "New Conversation";
            }
            
            const res = await fetch("/api/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title, chatMessages, conversationItems }),
            });
            const newSession = await res.json();
            if (newSession.id) {
              set({ currentSessionId: newSession.id });
              get().loadSessions();
            }
          }
        } catch (error) {
          console.error("Failed to save session:", error);
        }
      },

      deleteSession: async (id) => {
        try {
          await fetch(`/api/sessions/${id}`, { method: "DELETE" });
          set((state) => ({
            sessions: state.sessions.filter((s) => s.id !== id),
            currentSessionId: state.currentSessionId === id ? null : state.currentSessionId,
            chatMessages: state.currentSessionId === id ? [] : state.chatMessages,
            conversationItems: state.currentSessionId === id ? [] : state.conversationItems,
          }));
        } catch (error) {
          console.error("Failed to delete session:", error);
        }
      },

      renameSession: async (id, title) => {
        try {
          await fetch(`/api/sessions/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
          });
          set((state) => ({
            sessions: state.sessions.map((s) => (s.id === id ? { ...s, title } : s)),
          }));
        } catch (error) {
          console.error("Failed to rename session:", error);
        }
      },
    }),
    {
      name: "gentel-conversation-storage",
      partialize: (state) => ({ 
        currentSessionId: state.currentSessionId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

export default useConversationStore;
