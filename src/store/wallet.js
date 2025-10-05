import { create } from "zustand";
import { persist } from "zustand/middleware";

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
