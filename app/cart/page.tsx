"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingBag, Heart, Tag, Loader2 } from "lucide-react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";


const suggestedProducts = [
  {
    id: 5,
    name: "Wireless Mouse",
    price: 25.99,
    image: "/assets/product-laptop.jpg",
    category: "Electronics"
  },
  {
    id: 6,
    name: "Coffee Mug",
    price: 9.99,
    image: "/assets/product-noodles.jpg",
    category: "Kitchen"
  },
  {
    id: 7,
    name: "Highlighter Set",
    price: 15.99,
    image: "/assets/product-notebooks.jpg",
    category: "Stationery"
  }
];

export default function CartPage() {
  const { items: cartItems, removeFromCart, updateQuantity, totalAmount, isLoading, addToCart } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [addingItems, setAddingItems] = useState<Set<number>>(new Set());

  const handleUpdateQuantity = async (id: string, newQuantity: number) => {
    setUpdatingItems(prev => new Set([...prev, id]));
    try {
      await updateQuantity(id, newQuantity);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (id: string) => {
    setRemovingItems(prev => new Set([...prev, id]));
    try {
      await removeFromCart(id);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Convert total amount from cents to dollars
  const subtotal = totalAmount / 100;
  const savings = 0; // Calculate based on original prices if available
  const promoDiscount = promoApplied ? subtotal * 0.1 : 0; // 10% discount
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal - promoDiscount + shipping + tax;

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "student10") {
      setPromoApplied(true);
    }
  };

  const handleCheckout = () => {
    window.location.href = '/checkout';
  };

  const handleAddSuggestedProduct = async (product: any) => {
    setAddingItems(prev => new Set([...prev, product.id]));
    try {
      await addToCart({
        id: product.id.toString(),
        name: product.name,
        price: (product.price * 100).toString(), // Convert to cents
        image: [product.image],
        stock: 10, // Assuming stock, in real app this would come from product data
        categoryName: product.category
      }, 1);
    } finally {
      setAddingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }
  };

  // Show loading state while cart is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Loading your cart...</h1>
            <p className="text-muted-foreground">
              Please wait while we load your items.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center max-w-md mx-auto">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link href="/shop">
              <Button size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <Link href="/shop" className="hover:text-primary">Shop</Link>
          <span>/</span>
          <span className="text-foreground">Shopping Cart</span>
        </div>

        {/* Back Button */}
        <Link href="/shop">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continue Shopping
          </Button>
        </Link>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          {savings > 0 && (
            <Badge variant="secondary" className="mt-4 sm:mt-0">
              You're saving ${savings.toFixed(2)}!
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const isUpdating = updatingItems.has(item.id);
              const isRemoving = removingItems.has(item.id);
              const isLoading = isUpdating || isRemoving;
              
              return (
              <Card key={item.id} className={`overflow-hidden transition-opacity ${isRemoving ? 'opacity-50' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0 relative">
                      <img
                        src={item.image?.[0] || "/assets/placeholder.jpg"}
                        alt={item.name}
                        className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
                      />
                      {isRemoving && (
                        <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {item.categoryName}
                          </Badge>
                          {item.stock === 0 && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Out of Stock
                            </Badge>
                          )}
                        </div>

                        {/* Price and Controls */}
                        <div className="flex flex-col items-end gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {isUpdating ? (
                                <div className="flex items-center gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-lg font-bold opacity-50">
                                    ${((parseFloat(item.price) / 100) * item.quantity).toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-bold">
                                  ${((parseFloat(item.price) / 100) * item.quantity).toFixed(2)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              ${(parseFloat(item.price) / 100).toFixed(2)} each
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1 || item.stock === 0 || isLoading}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Minus className="h-3 w-3" />
                              )}
                            </Button>
                            <div className="w-8 text-center font-medium relative">
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                              ) : (
                                <span>{item.quantity}</span>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={item.stock === 0 || item.quantity >= item.stock || isLoading}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Plus className="h-3 w-3" />
                              )}
                            </Button>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" disabled={isLoading}>
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              disabled={isLoading}
                            >
                              {isRemoving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Savings</span>
                    <span>-${savings.toFixed(2)}</span>
                  </div>
                )}

                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo Discount (STUDENT10)</span>
                    <span>-${promoDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {shipping > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Add ${(50 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Promo Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                  />
                  <Button
                    variant="outline"
                    onClick={applyPromoCode}
                    disabled={promoApplied || !promoCode}
                  >
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-green-600 mt-2">
                    Promo code applied successfully!
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Try "STUDENT10" for 10% off
                </p>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button
              size="lg"
              className="w-full"
              onClick={handleCheckout}
              disabled={cartItems.some(item => item.stock === 0)}
            >
              Proceed to Checkout
            </Button>

            {/* Trust Indicators */}
            <div className="text-center space-y-2 text-sm text-muted-foreground">
              <p>🔒 Secure checkout with SSL encryption</p>
              <p>📦 Free returns within 30 days</p>
              <p>🚚 Fast delivery to your hostel</p>
            </div>
          </div>
        </div>

        {/* Suggested Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">You might also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedProducts.map((product) => {
              const isAdding = addingItems.has(product.id);
              
              return (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${product.price}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddSuggestedProduct(product)}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          Adding...
                        </>
                      ) : (
                        'Add to Cart'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
