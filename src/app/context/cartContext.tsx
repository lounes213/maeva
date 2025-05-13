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

// Define CartItemIdentifier type for removing specific items
export interface CartItemIdentifier {
  _id: string;
  color?: string;
  size?: string;
}

// Create the context
const CartContext = createContext<{
  cartItems: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (productId: string, color?: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, color?: string, size?: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  setCartItems: (items: CartItem[]) => void;
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
  const removeFromCart = (productId: string, color?: string, size?: string) => {
    setCartItems(prev => prev.filter(item => {
      // Si la couleur et la taille sont spécifiées, on vérifie les trois critères
      if (color !== undefined && size !== undefined) {
        return !(item._id === productId && item.color === color && item.size === size);
      }
      // Si seulement la couleur est spécifiée
      else if (color !== undefined) {
        return !(item._id === productId && item.color === color);
      }
      // Si seulement la taille est spécifiée
      else if (size !== undefined) {
        return !(item._id === productId && item.size === size);
      }
      // Si ni la couleur ni la taille ne sont spécifiées, on vérifie uniquement l'ID
      // mais seulement pour le premier élément correspondant
      else {
        // Trouver l'index du premier élément avec cet ID
        const indexToRemove = prev.findIndex(i => i._id === productId);
        // Si cet élément est celui qu'on est en train de traiter, on le supprime
        return prev.indexOf(item) !== indexToRemove;
      }
    }));
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number, color?: string, size?: string) => {
    setCartItems(prev => 
      prev.map(item => {
        // Si la couleur et la taille sont spécifiées, on vérifie les trois critères
        if (color !== undefined && size !== undefined) {
          return (item._id === productId && item.color === color && item.size === size) 
            ? {...item, quantity} 
            : item;
        }
        // Si seulement la couleur est spécifiée
        else if (color !== undefined) {
          return (item._id === productId && item.color === color) 
            ? {...item, quantity} 
            : item;
        }
        // Si seulement la taille est spécifiée
        else if (size !== undefined) {
          return (item._id === productId && item.size === size) 
            ? {...item, quantity} 
            : item;
        }
        // Si ni la couleur ni la taille ne sont spécifiées, on met à jour le premier élément correspondant
        else {
          // Trouver l'index du premier élément avec cet ID
          const indexToUpdate = prev.findIndex(i => i._id === productId);
          // Si cet élément est celui qu'on est en train de traiter, on le met à jour
          return prev.indexOf(item) === indexToUpdate && item._id === productId
            ? {...item, quantity}
            : item;
        }
      })
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
      totalPrice,
      setCartItems
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