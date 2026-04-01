import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (menuItem, quantity = 1, notes = '') => {
        const items = get().items;
        const existingItem = items.find(item => item.menuItem.id === menuItem.id);
        
        if (existingItem) {
          set({
            items: items.map(item =>
              item.menuItem.id === menuItem.id
                ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
                : item
            )
          });
        } else {
          set({
            items: [...items, { menuItem, quantity, notes }]
          });
        }
      },
      
      removeItem: (menuItemId) => {
        set({
          items: get().items.filter(item => item.menuItem.id !== menuItemId)
        });
      },
      
      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId);
        } else {
          set({
            items: get().items.map(item =>
              item.menuItem.id === menuItemId
                ? { ...item, quantity }
                : item
            )
          });
        }
      },
      
      updateNotes: (menuItemId, notes) => {
        set({
          items: get().items.map(item =>
            item.menuItem.id === menuItemId
              ? { ...item, notes }
              : item
          )
        });
      },
      
      clearCart: () => {
        set({ items: [] });
      },
      
      getTotal: () => {
        return get().items.reduce((total, item) => {
          return total + (parseFloat(item.menuItem.price) * item.quantity);
        }, 0);
      },
      
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      }
    }),
    {
      name: 'prebite-cart'
    }
  )
);

