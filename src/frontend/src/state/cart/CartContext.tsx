import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { CartItemType } from './cartTypes';

interface CartContextType {
  items: CartItemType[];
  addItem: (productName: string, price: bigint) => void;
  updateQuantity: (productName: string, quantity: number) => void;
  removeItem: (productName: string) => void;
  clearCart: () => void;
  getTotal: () => number;
  getCartCount: () => number;
  syncPrices: (products: Array<{ name: string; price: bigint }>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'dairy-field-cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>(() => {
    try {
      const stored = sessionStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((item: any) => ({
          ...item,
          price: BigInt(item.price),
        }));
      }
    } catch (error) {
      console.error('Failed to load cart from storage:', error);
    }
    return [];
  });

  useEffect(() => {
    try {
      const toStore = items.map(item => ({
        ...item,
        price: item.price.toString(),
      }));
      sessionStorage.setItem(CART_STORAGE_KEY, JSON.stringify(toStore));
    } catch (error) {
      console.error('Failed to save cart to storage:', error);
    }
  }, [items]);

  const addItem = (productName: string, price: bigint) => {
    setItems(current => {
      const existing = current.find(item => item.productName === productName);
      if (existing) {
        return current.map(item =>
          item.productName === productName
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...current, { productName, price, quantity: 1 }];
    });
  };

  const updateQuantity = (productName: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(current =>
      current.map(item =>
        item.productName === productName ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (productName: string) => {
    setItems(current => current.filter(item => item.productName !== productName));
  };

  const clearCart = () => {
    setItems([]);
    sessionStorage.removeItem(CART_STORAGE_KEY);
  };

  const getTotal = () => {
    return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  };

  const getCartCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const syncPrices = (products: Array<{ name: string; price: bigint }>) => {
    const productMap = new Map(products.map(p => [p.name, p.price]));
    
    setItems(current =>
      current.map(item => {
        const latestPrice = productMap.get(item.productName);
        if (latestPrice !== undefined) {
          return { ...item, price: latestPrice };
        }
        return item;
      })
    );
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getTotal,
        getCartCount,
        syncPrices,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
