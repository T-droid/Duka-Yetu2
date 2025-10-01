"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuthNext';

export interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string[];
  quantity: number;
  stock: number;
  categoryName: string;
  cartId?: string;
  updatedAt?: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> & { quantity?: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'CHECK_ITEM'; payload: string }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean }
  | { type: 'SYNC_SUCCESS'; payload: { items: CartItem[]; lastSyncTime: number } }
  | { type: 'SYNC_CART'; payload: { items: CartItem[]; changes?: { removed: any[]; updated: any[] } } };

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const quantity = action.payload.quantity || 1;
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > existingItem.stock) {
          toast({
            title: "Stock limit reached",
            description: `Only ${existingItem.stock} items available in stock`,
            variant: "destructive"
          });
          return state;
        }
        
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: newQuantity }
              : item
          )
        };
      } else {
        if (quantity > action.payload.stock) {
          toast({
            title: "Stock limit reached",
            description: `Only ${action.payload.stock} items available in stock`,
            variant: "destructive"
          });
          return state;
        }
        
        return {
          ...state,
          items: [...state.items, { ...action.payload, quantity }]
        };
      }
    }
    
    case 'CHECK_ITEM': {
      const itemExists = state.items.some(item => item.id === action.payload);
      return state;
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    
    case 'UPDATE_QUANTITY': {
      const item = state.items.find(item => item.id === action.payload.id);
      if (!item) return state;
      
      if (action.payload.quantity > item.stock) {
        toast({
          title: "Stock limit reached",
          description: `Only ${item.stock} items available in stock`,
          variant: "destructive"
        });
        return state;
      }
      
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== action.payload.id)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: action.payload.quantity }
            : item
        )
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };
    
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_SYNCING':
      return {
        ...state,
        isSyncing: action.payload
      };
    
    case 'SYNC_SUCCESS':
      return {
        ...state,
        items: action.payload.items,
        lastSyncTime: action.payload.lastSyncTime,
        isSyncing: false
      };
    
    case 'SYNC_CART':
      // Handle sync with potential changes notification
      if (action.payload.changes) {
        const { removed, updated } = action.payload.changes;
        
        if (removed.length > 0) {
          toast({
            title: "Items removed from cart",
            description: `${removed.length} item(s) removed due to stock unavailability`,
            variant: "destructive"
          });
        }
        
        if (updated.length > 0) {
          toast({
            title: "Cart quantities updated",
            description: `${updated.length} item(s) quantity reduced due to limited stock`,
            variant: "default"
          });
        }
      }
      
      return {
        ...state,
        items: action.payload.items,
        lastSyncTime: Date.now(),
        isSyncing: false
      };
    
    default:
      return state;
  }
};

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  totalAmount: number;
  isLoading: boolean;
  isSyncing: boolean;
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  clearCart: (showToast?: boolean) => Promise<void>;
  getItemQuantity: (id: string) => number;
  syncCart: () => Promise<void>;
  isInCart: (id: string) => boolean;
  loadCartFromDB: (showLoadingState?: boolean) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isLoading: true,
    isSyncing: false,
    lastSyncTime: 0
  });

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncRef = useRef<number>(0);

  // API Functions
  const loadCartFromDB = useCallback(async (showLoadingState = true) => {
    if (!isAuthenticated || authLoading) return;

    try {
      if (showLoadingState) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      const response = await fetch('/api/cart');
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SYNC_SUCCESS', payload: { items: data.items, lastSyncTime: Date.now() } });
      } else if (response.status === 401) {
        // User not authenticated, clear cart
        dispatch({ type: 'CLEAR_CART' });
      }
    } catch (error) {
      console.error('Error loading cart from database:', error);
      // Fallback to localStorage
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (e) {
          console.error('Error loading cart from localStorage:', e);
        }
      }
    } finally {
      if (showLoadingState) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [isAuthenticated, authLoading]);

  const syncCart = useCallback(async () => {
    if (!isAuthenticated || state.isSyncing || state.items.length === 0) return;

    try {
      dispatch({ type: 'SET_SYNCING', payload: true });
      const response = await fetch('/api/cart/sync', {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'SYNC_CART', payload: data });
        lastSyncRef.current = Date.now();
      }
    } catch (error) {
      console.error('Error syncing cart:', error);
    } finally {
      dispatch({ type: 'SET_SYNCING', payload: false });
    }
  }, [isAuthenticated, state.isSyncing, state.items.length]);

  // Load cart from DB when user authenticates
  useEffect(() => {
    loadCartFromDB();
  }, [loadCartFromDB]);

  // Set up periodic sync when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Initial sync
      syncCart();
      
      // Set up periodic sync every 30 seconds
      syncIntervalRef.current = setInterval(() => {
        syncCart();
      }, 30000);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [isAuthenticated, authLoading, syncCart]);

  // Backup to localStorage for offline support
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    } else {
      localStorage.removeItem('cart');
    }
  }, [state.items]);

  const addToCart = useCallback(async (product: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (!isAuthenticated) {
      // Fallback to local storage for non-authenticated users
      dispatch({ type: 'ADD_ITEM', payload: { ...product, quantity } });
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart`,
      });
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity
        }),
      });

      if (response.ok) {
        // Reload cart to get updated data without showing loading state
        await loadCartFromDB(false);
        toast({
          title: "Added to cart",
          description: `${product.name} has been added to your cart`,
        });
      } else {
        const error = await response.json();
        if (error.error === 'Insufficient stock') {
          toast({
            title: "Insufficient stock",
            description: `Only ${error.availableStock} items available`,
            variant: "destructive"
          });
        } else {
            console.log(error);
          throw new Error(error.error);
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, loadCartFromDB]);

  const isInCart = useCallback((id: string) => {
    return state.items.some(item => item.id === id);
  }, [state.items]);

  const removeFromCart = useCallback(async (id: string) => {
    const item = state.items.find(item => item.id === id);
    
    if (!isAuthenticated) {
      // Fallback to local storage for non-authenticated users
      dispatch({ type: 'REMOVE_ITEM', payload: id });
      toast({
        title: "Removed from cart",
        description: `${item?.name || 'Item'} has been removed from your cart`,
      });
      return;
    }

    try {
      const response = await fetch(`/api/cart?productId=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadCartFromDB(false);
        toast({
          title: "Removed from cart",
          description: `${item?.name || 'Item'} has been removed from your cart`,
        });
      } else {
        throw new Error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  }, [state.items, isAuthenticated, loadCartFromDB]);

  const updateQuantity = useCallback(async (id: string, quantity: number) => {
    if (!isAuthenticated) {
      // Fallback to local storage for non-authenticated users
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: id,
          quantity
        }),
      });

      if (response.ok) {
        await loadCartFromDB(false);
      } else {
        const error = await response.json();
        if (error.error === 'Insufficient stock') {
          toast({
            title: "Insufficient stock",
            description: `Only ${error.availableStock} items available`,
            variant: "destructive"
          });
          // Sync to get the correct stock levels
          await syncCart();
        } else {
          throw new Error(error.error);
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive"
      });
    }
  }, [isAuthenticated, loadCartFromDB, syncCart]);

  const clearCart = useCallback(async (showToast = true) => {
    if (!isAuthenticated) {
      // Fallback to local storage for non-authenticated users
      dispatch({ type: 'CLEAR_CART' });
      if (showToast) {
        toast({
          title: "Cart cleared",
          description: "All items have been removed from your cart",
        });
      }
      return;
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
      });

      if (response.ok) {
        dispatch({ type: 'CLEAR_CART' });
        if (showToast) {
          toast({
            title: "Cart cleared",
            description: "All items have been removed from your cart",
          });
        }
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to clear cart",
          variant: "destructive"
        });
      }
    }
  }, [isAuthenticated]);

  const getItemQuantity = (id: string) => {
    const item = state.items.find(item => item.id === id);
    return item?.quantity || 0;
  };

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = state.items.reduce((total, item) => {
    return total + (parseFloat(item.price) * item.quantity);
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        itemCount,
        totalAmount,
        isLoading: state.isLoading,
        isSyncing: state.isSyncing,
        addToCart,
        isInCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        syncCart,
        loadCartFromDB
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
