'use client';

import { useState, useEffect } from 'react';

interface Category {
  id: string;
  name: string;
}

export const useCategories = () => {
  const [data, setData] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/categories', {
          credentials: "same-origin"
        });
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const result = await response.json();
        setData(result.categories || []);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch categories');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { data, isLoading, error };
};