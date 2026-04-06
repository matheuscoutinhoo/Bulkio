import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
   theme: Theme;
   toggleTheme: () => void;
}

function applyTheme(theme: Theme) {
   if (theme === 'dark') {
      document.documentElement.classList.add('dark');
   } else {
      document.documentElement.classList.remove('dark');
   }
}

export const useThemeStore = create<ThemeState>()(
   persist(
      (set) => ({
         theme: 'dark',
         toggleTheme: () =>
            set((state) => {
               const next = state.theme === 'dark' ? 'light' : 'dark';
               applyTheme(next);
               return { theme: next };
            }),
      }),
      {
         name: 'bulkio-theme',
         onRehydrateStorage: () => (state) => {
            if (state) applyTheme(state.theme);
         },
      },
   ),
);

// Apply theme immediately on module load to prevent flash
const stored = localStorage.getItem('bulkio-theme');
if (stored) {
   try {
      const parsed = JSON.parse(stored);
      applyTheme(parsed.state?.theme ?? 'dark');
   } catch {
      applyTheme('dark');
   }
} else {
   applyTheme('dark');
}
