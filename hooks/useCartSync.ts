import { useCart } from '@/contexts/CartContext';
import { useCallback } from 'react';

export const useCartSync = () => {
  const { syncCart, isSyncing } = useCart();

  const triggerSync = useCallback(async () => {
    if (!isSyncing) {
      await syncCart();
    }
  }, [syncCart, isSyncing]);

  return {
    triggerSync,
    isSyncing
  };
};
