"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Grid, List, Star, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";
import { useSearchParams } from "next/navigation";
import { useCategories } from "@/hooks/useCategories";
import ProductCard from "@/components/ProductCard";

interface Category {
  id: string;
  name: string;
}

// Products will be fetched from API

export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { addToCart } = useCart();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      categoryName: product.categoryName
    });
  };

  const searchParams = useSearchParams();
  const categoryIdFromUrl = searchParams.get('category');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let url = '/api/products';
        if (categoryIdFromUrl) {
          url += `?categoryId=${categoryIdFromUrl}`;
        }
        
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('Product response data:', data);
        
        if (data.success && data.products) {
          setProducts(data.products);
        } else {
          throw new Error('API response structure unexpected');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, [searchParams]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "All Categories" || product.categoryName === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Shop <span className="bg-gradient-primary bg-clip-text text-transparent">
              {categoryIdFromUrl && products.length > 0 
                ? products[0]?.categoryName || "Category" 
                : "Student Essentials"}
            </span>
          </h1>
          <p className="text-muted-foreground">
            {categoryIdFromUrl 
              ? `Browse ${products[0]?.categoryName || "category"} products at unbeatable prices`
              : "Discover everything you need for student life at unbeatable prices"
            }
          </p>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            {!categoryIdFromUrl && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All Categories">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-4 text-muted-foreground">Loading products...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg mb-4">Error: {error}</p>
            <Button 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && !error && (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
          {filteredProducts.map((product: any) => (
            <ProductCard product={product} handleAddToCart={handleAddToCart} key={product.id} />
            // <Link key={product.id} href={`/shop/${product.id}`}>
            //   <div className="bg-card rounded-card shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105 border overflow-hidden group cursor-pointer">
            //     <div className="relative">
            //       <img
            //         src={product.image[0]}
            //         alt={product.name}
            //         className="w-full h-48 object-cover"
            //       />
            //       {product.inStock && (
            //         <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            //           In Stock
            //         </span>
            //       )}
            //       {!product.inStock && (
            //         <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            //           Out of Stock
            //         </span>
            //       )}
            //       <Button
            //         size="sm"
            //         variant="ghost"
            //         className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white"
            //         onClick={(e) => {
            //           e.preventDefault();
            //           e.stopPropagation();
            //           // Handle wishlist toggle
            //         }}
            //       >
            //         <Heart className="h-4 w-4" />
            //       </Button>
            //     </div>

            //     <div className="p-4">
            //       <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
            //       <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
            //         {product.description}
            //       </p>

            //       <div className="flex items-center gap-2 mb-3">
            //         <div className="flex items-center">
            //           {[...Array(5)].map((_, i) => (
            //             <Star
            //               key={i}
            //               className={`h-4 w-4 ${
            //                 i < 4 // Default rating for now
            //                   ? "fill-yellow-400 text-yellow-400"
            //                   : "text-gray-300"
            //               }`}
            //             />
            //           ))}
            //         </div>
            //         <span className="text-sm text-muted-foreground">
            //           4.0 (New product)
            //         </span>
            //       </div>

            //       <div className="flex items-center justify-between">
            //         <div className="flex items-center gap-2">
            //           <span className="text-xl font-bold text-primary">
            //             KSh {parseFloat(product.price).toLocaleString()}
            //           </span>
            //         </div>
            //         <Button 
            //           size="sm"
            //           onClick={(e) => {
            //             e.preventDefault();
            //             e.stopPropagation();
            //             handleAddToCart(product);
            //           }}
            //           disabled={!product.inStock}
            //         >
            //           <ShoppingCart className="h-4 w-4 mr-2" />
            //           Add to Cart
            //         </Button>
            //       </div>
            //     </div>
            //   </div>
            // </Link>
          ))}
          </div>
        )}

        {!isLoading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              No products found matching your criteria.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All Categories");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
