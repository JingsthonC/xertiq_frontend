import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiService from "../services/api";

const useWalletStore = create(
  persist(
    (set, get) => ({
      // Auth state
      isAuthenticated: false,
      user: null,
      token: null,
      userRole: "issuer", // Add userRole for header component

      // Wallet data
      credits: 150, // Set default credits
      creditsLoading: false,
      lastCreditUpdate: null,
      documents: [
        { id: 1, status: "verified" },
        { id: 2, status: "verified" },
        { id: 3, status: "pending" },
        { id: 4, status: "verified" },
      ],
      certificates: [],

      // Network status
      solana: {
        network: "devnet",
        programId: null,
        connected: false,
      },

      // UI state
      activeTab: "issued",
      isLoading: false,
      error: null,

      // Actions
      setAuth: (user, token) =>
        set({
          isAuthenticated: true,
          user,
          token,
          error: null,
        }),

      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          documents: [],
          certificates: [],
          credits: 0,
        }),

      setCredits: (credits) => set({ credits }),

      // Credit management functions
      fetchCredits: async () => {
        try {
          set({ creditsLoading: true, error: null });
          const response = await apiService.getCreditBalance();
          console.log("Credit balance response:", response);
          if (response.success && response.credits !== undefined) {
            set({
              credits: response.credits,
              lastCreditUpdate: new Date().toISOString(),
              creditsLoading: false,
            });
            return response.credits;
          } else {
            console.error("Invalid credit response format:", response);
            set({ creditsLoading: false });
            return null;
          }
        } catch (error) {
          console.error("Failed to fetch credits:", error);
          set({
            error: "Failed to fetch credit balance",
            creditsLoading: false,
          });
          return null;
        }
      },

      updateCredits: (newCredits) => {
        set({
          credits: newCredits,
          lastCreditUpdate: new Date().toISOString(),
        });
      },

      decrementCredits: (amount) => {
        const currentCredits = get().credits;
        set({
          credits: Math.max(0, currentCredits - amount),
          lastCreditUpdate: new Date().toISOString(),
        });
      },

      checkSufficientCredits: async (operation, count = 1) => {
        try {
          const result = await apiService.checkSufficientCredits(
            operation,
            count
          );
          return result;
        } catch (error) {
          console.error("Failed to check credits:", error);
          return { sufficient: false, cost: 0, balance: 0 };
        }
      },

      setUserRole: (userRole) => set({ userRole }),

      setDocuments: (documents) => set({ documents }),

      setCertificates: (certificates) => set({ certificates }),

      setSolanaStatus: (status) =>
        set({
          solana: { ...get().solana, ...status },
        }),

      setActiveTab: (tab) => set({ activeTab: tab }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "xertiq-wallet-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        token: state.token,
        activeTab: state.activeTab,
      }),
    }
  )
);

export default useWalletStore;
