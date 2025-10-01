"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCategories } from "@/hooks/useCategories";

const categoryDisplayInfo: Record<string, { description: string; image: string; itemCount: string }> = {
  "Food & Snacks": {
    description: "Quick bites and delicious meals",
    image: "/assets/category-food.jpg",
    itemCount: "500+ items"
  },
  "Groceries": {
    description: "Fresh essentials delivered daily",
    image: "/assets/category-groceries.jpg", 
    itemCount: "300+ items"
  },
  "Personal Care": {
    description: "Self-care and hygiene products",
    image: "/assets/category-personal-care.jpg",
    itemCount: "200+ items"
  },
  "Stationery": {
    description: "Study supplies and office needs", 
    image: "/assets/category-stationery.jpg",
    itemCount: "150+ items"
  },
  "Electronics": {
    description: "Tech gadgets and accessories",
    image: "/assets/category-food.jpg", // Fallback image
    itemCount: "100+ items"
  },
  "Clothing": {
    description: "Fashion and apparel",
    image: "/assets/category-food.jpg", // Fallback image
    itemCount: "50+ items"
  },
  "Books": {
    description: "Academic and leisure reading",
    image: "/assets/category-stationery.jpg", // Similar category image
    itemCount: "200+ items"
  },
  "Health & Wellness": {
    description: "Health supplements and wellness products",
    image: "/assets/category-personal-care.jpg", // Similar category image
    itemCount: "80+ items"
  },
  "Kitchen & Dining": {
    description: "Cooking and dining essentials",
    image: "/assets/category-groceries.jpg", // Similar category image
    itemCount: "120+ items"
  },
  "Sports & Recreation": {
    description: "Sports equipment and recreational items",
    image: "/assets/category-food.jpg", // Fallback image
    itemCount: "60+ items"
  }
};

const FeaturedCategories = () => {
  const { data: categories, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading categories...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">Error loading categories: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Shop by <span className="bg-gradient-primary bg-clip-text text-transparent">Category</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find everything you need for student life. From late-night snacks to study essentials.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const displayInfo = categoryDisplayInfo[category.name] || {
              description: "Quality products for students",
              image: "/assets/category-food.jpg",
              itemCount: "Items available"
            };
            
            return (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="group relative overflow-hidden rounded-card bg-gradient-card border shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="aspect-square overflow-hidden relative">
                <Image
                  src={displayInfo.image}
                  alt={category.name}
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
                
                <p className="text-muted-foreground text-sm mb-3">
                  {displayInfo.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {displayInfo.itemCount}
                  </span>
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;