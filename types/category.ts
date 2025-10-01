export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  categoryId: string;
  categoryName?: string;
  image?: string;
  inStock: boolean;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}
