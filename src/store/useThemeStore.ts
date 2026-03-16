import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ThemeState {
  mode: "light" | "dark";
  toggleMode: () => void;
  setMode: (mode: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "light",
      toggleMode: () =>
        set((state) => ({
          mode: state.mode === "light" ? "dark" : "light",
        })),
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "theme-mode", // same key as previous localStorage implementation
      storage: createJSONStorage(() => localStorage),
    }
  )
);
