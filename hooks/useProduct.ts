'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  image?: string[];
  specifications?: Record<string, string>;
  inStock: boolean;
  stock: number;
  badge?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: number;
  categoryName?: string;
  categoryId?: string;
}

export const useProduct = (productId: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/products/${productId}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch product');
        }

        setProduct(result.product);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch product');
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, isLoading, error };
};

export const useRelatedProducts = (categoryName?: string, excludeId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryName) {
        setProducts([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          category: categoryName,
          limit: '4'
        });
        
        if (excludeId) {
          params.append('exclude', excludeId);
        }
        
        const response = await fetch(`/api/products/related?${params}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to fetch related products');
        }

        setProducts(result.products || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch related products');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categoryName, excludeId]);

  return { products, isLoading, error };
};
