'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define CartItem type
export interface CartItem {
  _id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  color?: string;
  size?: string;
}

// Create the context
const CartContext = createContext<{
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
} | null>(null);

// Provider component
export function CartProvider({ children }: { children: ReactNode }) {
  // Initialize state with empty array
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, []);

  // Save to localStorage when cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // Calculate totals
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Add to cart
  const addToCart = (product: CartItem) => {
    setCartItems(prev => {
      const existing = prev.find(item => 
        item._id === product._id && 
        item.color === product.color && 
        item.size === product.size
      );
      
      if (existing) {
        return prev.map(item => 
          (item._id === product._id && 
           item.color === product.color && 
           item.size === product.size) 
            ? {...item, quantity: item.quantity + product.quantity} 
            : item
        );
      } else {
        return [...prev, product];
      }
    });
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => 
      prev.map(item => item._id === productId ? {...item, quantity} : item)
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart');
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      totalItems,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}