import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastItem {
   id: number;
   title: string;
   description?: string;
   variant: ToastVariant;
}

interface ToastState {
   items: ToastItem[];
   add: (item: Omit<ToastItem, 'id'>) => number;
   remove: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set) => ({
   items: [],
   add: (item) => {
      const id = nextId++;
      set((state) => ({ items: [...state.items.slice(-3), { ...item, id }] }));
      window.setTimeout(() => useToastStore.getState().remove(id), 4500);
      return id;
   },
   remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export const toast = {
   success: (title: string, description?: string) => useToastStore.getState().add({ title, description, variant: 'success' }),
   error: (title: string, description?: string) => useToastStore.getState().add({ title, description, variant: 'error' }),
   info: (title: string, description?: string) => useToastStore.getState().add({ title, description, variant: 'info' }),
};
