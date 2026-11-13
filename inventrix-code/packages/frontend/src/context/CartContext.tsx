import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
  product_id: number;
  name: string;
  image_url: string;
  point_price: number;
  stock: number;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  add: (item: CartItem) => void;
  setQuantity: (productId: number, quantity: number) => void;
  remove: (productId: number) => void;
  clear: () => void;
}

const CART_KEY = 'cart';

const CartContext = createContext<CartContextType | undefined>(undefined);

const clamp = (quantity: number, stock: number) => Math.max(1, Math.min(stock, Math.floor(quantity) || 1));

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(() => JSON.parse(localStorage.getItem(CART_KEY) ?? '[]'));

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const add = (item: CartItem) =>
    setItems(prev => {
      const existing = prev.find(i => i.product_id === item.product_id);
      if (!existing) return [...prev, { ...item, quantity: clamp(item.quantity, item.stock) }];
      return prev.map(i =>
        i === existing ? { ...item, quantity: clamp(existing.quantity + item.quantity, item.stock) } : i
      );
    });

  const setQuantity = (productId: number, quantity: number) =>
    setItems(prev => prev.map(i => (i.product_id === productId ? { ...i, quantity: clamp(quantity, i.stock) } : i)));

  const remove = (productId: number) => setItems(prev => prev.filter(i => i.product_id !== productId));

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, add, setQuantity, remove, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
