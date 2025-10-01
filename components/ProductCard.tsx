"use client";

import Link from "next/link";
import { Button } from "./ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/contexts/CartContext";


interface ProductCardProps {
  product: Product;
  handleAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, handleAddToCart }: ProductCardProps) {
    const { isInCart } = useCart();
    const productInCart = isInCart(product.id);
  return (
    <Link key={product.id} href={`/shop/${product.id}`}>
        <div className="bg-card rounded-card shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105 border overflow-hidden group cursor-pointer">
            <div className="relative">
                <img
                src={product.image[0]}
                alt={product.name}
                className="w-full h-48 object-cover"
                />
                {product.inStock && (
                <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
                    In Stock
                </span>
                )}
                {!product.inStock && (
                <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Out of Stock
                </span>
                )}
                <Button
                size="sm"
                variant="ghost"
                className="absolute top-3 right-3 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle wishlist toggle
                }}
                >
                <Heart className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {product.description}
                </p>

                <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`h-4 w-4 ${
                        i < 4 // Default rating for now
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                    />
                    ))}
                </div>
                <span className="text-sm text-muted-foreground">
                    4.0 (New product)
                </span>
                </div>

                <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-primary">
                    KSh {parseFloat(product.price).toLocaleString()}
                    </span>
                </div>
                {!productInCart ? (
                    <Button 
                    size="sm"
                    onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAddToCart(product);
                    }}
                    disabled={!product.inStock}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                </Button>
                ) : (
                    <Button size="sm" disabled>
                    In Cart
                    </Button>
                )}
                
                </div>
            </div>
        </div>
    </Link>
  );
}