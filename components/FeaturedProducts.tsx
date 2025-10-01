import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Student Laptop Pro",
    description: "Perfect for studies and entertainment",
    price: 899.99,
    originalPrice: 999.99,
    image: "/assets/product-laptop.jpg",
    rating: 4.8,
    reviews: 124,
    category: "Electronics",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Instant Noodles Pack",
    description: "Quick and delicious meal solution",
    price: 12.99,
    originalPrice: null,
    image: "/assets/product-noodles.jpg",
    rating: 4.5,
    reviews: 89,
    category: "Food",
    badge: "Popular",
  },
  {
    id: 3,
    name: "Study Notebook Set",
    description: "Complete stationery bundle",
    price: 24.99,
    originalPrice: 29.99,
    image: "/assets/product-notebooks.jpg",
    rating: 4.7,
    reviews: 156,
    category: "Stationery",
    badge: "Student Choice",
  },
  {
    id: 4,
    name: "Premium Shampoo",
    description: "Gentle care for healthy hair",
    price: 8.99,
    originalPrice: null,
    image: "/assets/product-shampoo.jpg",
    rating: 4.6,
    reviews: 67,
    category: "Personal Care",
    badge: "New",
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-16 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-primary bg-clip-text text-transparent">Best Sellers</span> & Featured Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Popular items among students. Quality products at student-friendly prices.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-card rounded-card shadow-card hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in border overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Badge */}
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-gradient-primary text-white text-xs font-medium px-2 py-1 rounded-full">
                  {product.badge}
                </span>
              </div>

              {/* Wishlist Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 z-10 h-8 w-8 bg-background/80 hover:bg-background"
              >
                <Heart className="h-4 w-4" />
              </Button>

              {/* Product Image */}
              <div className="aspect-square overflow-hidden relative">
                <Image
                  src={product.image}
                  alt={product.name}
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
              </div>

              {/* Product Details */}
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Rating */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-primary">
                    ${product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${product.originalPrice}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <Button variant="default" className="w-full group">
                  <ShoppingCart className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                  Add to Cart
                </Button>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;