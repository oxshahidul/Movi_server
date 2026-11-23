import { create } from "zustand";
import { User } from "../types";
import { fetchApi } from "../lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: "login" | "register";
  setUser: (user: User | null) => void;
  openAuthModal: (tab?: "login" | "register") => void;
  closeAuthModal: () => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalTab: "login",

  setUser: (user) => set({ user }),

  openAuthModal: (tab = "login") => set({ isAuthModalOpen: true, authModalTab: tab }),

  closeAuthModal: () => set({ isAuthModalOpen: false }),

  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const res = await fetchApi<{ user: User }>("/auth/me");
      if (res.user) {
        set({ user: res.user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await fetchApi("/auth/logout", { method: "POST" });
      set({ user: null });
    } catch (e) {
      console.error("Logout error", e);
    }
  },
}));
