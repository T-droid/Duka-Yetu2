export interface Product {
  id: string;
  name: string;
  description?: string;
  price: string; // Using string to match database schema
  categoryId: string;
  categoryName?: string;
  image?: string[]; // Array of image URLs
  specifications?: Record<string, string>; // JSON object for specifications
  inStock: boolean;
  stock: number;
  badge?: string;
  rating?: number;
  reviews?: number;
  originalPrice?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
}

export interface NewProduct {
    name: string;
    category: string;
    price: number;
    stock: number;
    image_url: string;
    description: string;
}