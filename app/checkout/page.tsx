"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, User, Phone, CheckCircle, Smartphone, Lock } from "lucide-react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/hooks/useAuthNext";

export default function CheckoutPage() {
  const { items: cartItems, totalAmount, isLoading: isCartLoading, clearCart } = useCart();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirmation
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    
    // Shipping Address
    addressType: "hostel", // "hostel" or "apartment"
    hostelName: "",
    blockName: "",
    roomNumber: "",
    apartmentName: "",
    houseNumber: "",
    
    // Payment (M-Pesa only)
    mpesaNumber: "",
    
    // Additional
    deliveryInstructions: "",
    agreeToTerms: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Handle client-side mounting
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-fill user information when user data is available
  useEffect(() => {
    if (user && isAuthenticated && hasCheckedAuth) {
      // Split name if it's a single field
      const nameParts = user.name ? user.name.split(' ') : [];
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(' ') || "";
      
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: user.email || "",
        phone: "", // Phone is not available in the default user object
      }));
    }
  }, [user, isAuthenticated, hasCheckedAuth]);

  // Handle authentication check after loading is complete
  useEffect(() => {
    if (!isAuthLoading && !hasCheckedAuth && isMounted) {
      setHasCheckedAuth(true);
      if (!isAuthenticated) {
        window.location.href = '/login?redirect=/checkout';
      }
    }
  }, [isAuthLoading, isAuthenticated, hasCheckedAuth, isMounted]);

  // Show loading state while authentication or cart is being loaded
  if (!isMounted || isAuthLoading || isCartLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
            <p className="text-muted-foreground">
              Please wait while we prepare your checkout.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show empty cart message only after both auth and cart are loaded
  if (isAuthenticated && !isCartLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Add some items to your cart before proceeding to checkout.
            </p>
            <Link href="/shop">
              <Button>Continue Shopping</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Calculate totals from cart
  const subtotal = totalAmount / 100; // Convert from cents
  const shipping = 50; // KSh 50 flat rate
  const total = subtotal + shipping;

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const validateStep1 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    
    if (formData.addressType === "hostel") {
      if (!formData.hostelName.trim()) newErrors.hostelName = "Hostel name is required";
      if (!formData.blockName.trim()) newErrors.blockName = "Block name is required";
      if (!formData.roomNumber.trim()) newErrors.roomNumber = "Room number is required";
    } else {
      if (!formData.apartmentName.trim()) newErrors.apartmentName = "Apartment/Estate name is required";
      if (!formData.houseNumber.trim()) newErrors.houseNumber = "House number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.mpesaNumber.trim()) {
      newErrors.mpesaNumber = "M-Pesa number is required";
    } else if (!/^254\d{9}$/.test(formData.mpesaNumber.replace(/\s/g, ''))) {
      newErrors.mpesaNumber = "Please enter a valid M-Pesa number (e.g., 254712345678)";
    }
    
    if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processMpesaPayment = async () => {
    setIsProcessingPayment(true);
    
    try {
      // First, initiate M-Pesa STK Push
      const mpesaResponse = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: formData.mpesaNumber,
          amount: total,
          orderDetails: {
            items: cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: parseFloat(item.price) / 100
            })),
            shipping: {
              type: formData.addressType,
              ...(formData.addressType === 'hostel' ? {
                hostelName: formData.hostelName,
                blockName: formData.blockName,
                roomNumber: formData.roomNumber,
              } : {
                apartmentName: formData.apartmentName,
                houseNumber: formData.houseNumber,
              }),
              deliveryInstructions: formData.deliveryInstructions
            }
          }
        })
      });

      const mpesaResult = await mpesaResponse.json();
      
      if (mpesaResult.success) {
        // Create order in database
        const orderResponse = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customerInfo: {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              phone: formData.mpesaNumber, // Use M-Pesa number as phone
            },
            addressInfo: {
              type: formData.addressType,
              hostelName: formData.hostelName,
              blockName: formData.blockName,
              roomNumber: formData.roomNumber,
              apartmentName: formData.apartmentName,
              houseNumber: formData.houseNumber,
              deliveryInstructions: formData.deliveryInstructions,
            },
            paymentInfo: {
              mpesaNumber: formData.mpesaNumber,
            },
            cartItems,
            totals: {
              subtotal: subtotal * 100, // Convert to cents
              shipping: shipping * 100, // Convert to cents
              total: total * 100, // Convert to cents
            },
            transactionId: mpesaResult.transactionId,
            checkoutRequestId: mpesaResult.checkoutRequestId,
          })
        });

        const orderResult = await orderResponse.json();
        
        if (orderResult.success) {
          setOrderData(orderResult.order);
          // Clear cart after successful order creation (without toast)
          try {
            await clearCart(false);
          } catch (error) {
            console.error('Error clearing cart after order:', error);
            // Even if cart clearing fails, proceed to confirmation
          }
          setStep(3);
        } else {
          setErrors({ payment: orderResult.message || "Failed to create order. Please try again." });
        }
      } else {
        setErrors({ payment: mpesaResult.message || "Payment failed. Please try again." });
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setErrors({ payment: "Payment processing failed. Please try again." });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      processMpesaPayment();
    }
  };

  const handlePrevStep = () => {
    setStep(Math.max(1, step - 1));
  };

  // Step 3: Order Confirmation
  if (step === 3) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <CheckCircle className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Thank you for your order. We'll send you a confirmation email shortly.
            </p>
            
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Order Number:</span>
                    <span>#{orderData?.orderNumber || 'Processing...'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">KSh {orderData ? (orderData.totalAmount / 100).toLocaleString() : total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Payment Status:</span>
                    <span className={`font-medium ${orderData?.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      {orderData?.paymentStatus === 'pending' ? 'Awaiting Payment' : 
                       orderData?.paymentStatus === 'completed' ? 'Payment Confirmed' : 'Processing'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Delivery Address:</span>
                    <span className="text-right">
                      {formData.addressType === 'hostel' ? (
                        <>
                          {formData.hostelName}<br />
                          Block {formData.blockName}, Room {formData.roomNumber}<br />
                        </>
                      ) : (
                        <>
                          {formData.apartmentName}<br />
                          {formData.houseNumber && `House ${formData.houseNumber}, `}<br />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex flex-col gap-3 mt-6 max-w-md mx-auto">
              <Button 
                onClick={() => router.push('/orders')} 
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!orderData}
              >
                {orderData ? 'View Your Orders' : 'Processing Order...'}
              </Button>
              <Button 
                onClick={() => router.push('/shop')} 
                variant="outline" 
                className="w-full"
              >
                Continue Shopping
              </Button>
              <Button 
                onClick={() => router.push('/')} 
                variant="ghost" 
                className="w-full text-sm"
              >
                Back to Home
              </Button>
            </div>
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
          <Link href="/cart" className="hover:text-primary">Cart</Link>
          <span>/</span>
          <span className="text-foreground">Checkout</span>
        </div>

        {/* Back Button */}
        <Link href="/cart">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cart
          </Button>
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 1 ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Shipping Details</span>
          </div>
          <div className={`h-0.5 w-16 mx-4 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 2 ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium">Payment</span>
          </div>
          <div className={`h-0.5 w-16 mx-4 ${step >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
              step >= 3 ? 'bg-primary text-primary-foreground border-primary' : 'border-muted-foreground'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium">Confirmation</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="space-y-8">
                {/* Personal Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className={errors.firstName ? "border-red-500" : ""}
                        />
                        {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className={errors.lastName ? "border-red-500" : ""}
                        />
                        {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Address */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Delivery Address
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address Type Selection */}
                    <div>
                      <Label>Address Type *</Label>
                      <RadioGroup
                        value={formData.addressType}
                        onValueChange={(value) => handleInputChange("addressType", value)}
                        className="flex gap-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="hostel" id="hostel" />
                          <Label htmlFor="hostel">Hostel</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="apartment" id="apartment" />
                          <Label htmlFor="apartment">Apartment/House</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Hostel Address Fields */}
                    {formData.addressType === "hostel" && (
                      <>
                        <div>
                          <Label htmlFor="hostelName">Hostel Name *</Label>
                          <Input
                            id="hostelName"
                            placeholder="e.g., University Hostel"
                            value={formData.hostelName}
                            onChange={(e) => handleInputChange("hostelName", e.target.value)}
                            className={errors.hostelName ? "border-red-500" : ""}
                          />
                          {errors.hostelName && <p className="text-sm text-red-500 mt-1">{errors.hostelName}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="blockName">Block Name *</Label>
                            <Input
                              id="blockName"
                              placeholder="e.g., Block A"
                              value={formData.blockName}
                              onChange={(e) => handleInputChange("blockName", e.target.value)}
                              className={errors.blockName ? "border-red-500" : ""}
                            />
                            {errors.blockName && <p className="text-sm text-red-500 mt-1">{errors.blockName}</p>}
                          </div>
                          <div>
                            <Label htmlFor="roomNumber">Room Number *</Label>
                            <Input
                              id="roomNumber"
                              placeholder="e.g., 205"
                              value={formData.roomNumber}
                              onChange={(e) => handleInputChange("roomNumber", e.target.value)}
                              className={errors.roomNumber ? "border-red-500" : ""}
                            />
                            {errors.roomNumber && <p className="text-sm text-red-500 mt-1">{errors.roomNumber}</p>}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Apartment/House Address Fields */}
                    {formData.addressType === "apartment" && (
                      <>
                        <div>
                          <Label htmlFor="apartmentName">Apartment/Estate Name *</Label>
                          <Input
                            id="apartmentName"
                            placeholder="e.g., Greenview Apartments"
                            value={formData.apartmentName}
                            onChange={(e) => handleInputChange("apartmentName", e.target.value)}
                            className={errors.apartmentName ? "border-red-500" : ""}
                          />
                          {errors.apartmentName && <p className="text-sm text-red-500 mt-1">{errors.apartmentName}</p>}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="houseNumber">House Number *</Label>
                            <Input
                              id="houseNumber"
                              placeholder="e.g., 12B"
                              value={formData.houseNumber}
                              onChange={(e) => handleInputChange("houseNumber", e.target.value)}
                              className={errors.houseNumber ? "border-red-500" : ""}
                            />
                            {errors.houseNumber && <p className="text-sm text-red-500 mt-1">{errors.houseNumber}</p>}
                          </div>                         
                        </div>
                      </>
                    )}

                    {/* Delivery Instructions */}
                    <div>
                      <Label htmlFor="deliveryInstructions">Delivery Instructions (optional)</Label>
                      <Input
                        id="deliveryInstructions"
                        placeholder="e.g., Call when you arrive, Ask for security"
                        value={formData.deliveryInstructions}
                        onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                {/* M-Pesa Payment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="h-5 w-5" />
                      M-Pesa Payment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-800">Pay with M-Pesa</span>
                      </div>
                      <p className="text-sm text-green-700">
                        Enter your M-Pesa number below. You will receive an STK push to complete the payment.
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="mpesaNumber">M-Pesa Number *</Label>
                      <Input
                        id="mpesaNumber"
                        type="tel"
                        placeholder="254712345678"
                        value={formData.mpesaNumber}
                        onChange={(e) => handleInputChange("mpesaNumber", e.target.value)}
                        className={errors.mpesaNumber ? "border-red-500" : ""}
                      />
                      {errors.mpesaNumber && <p className="text-sm text-red-500 mt-1">{errors.mpesaNumber}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Format: 254XXXXXXXXX (include country code)
                      </p>
                    </div>

                    {errors.payment && (
                      <div className="p-3 border border-red-200 rounded-lg bg-red-50">
                        <p className="text-sm text-red-700">{errors.payment}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Terms Agreement */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="agreeToTerms"
                          checked={formData.agreeToTerms}
                          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                        />
                        <Label htmlFor="agreeToTerms" className="text-sm">
                          I agree to the <Link href="/terms" className="text-primary underline">Terms of Service</Link> and{" "}
                          <Link href="/privacy" className="text-primary underline">Privacy Policy</Link> *
                        </Label>
                      </div>
                      {errors.agreeToTerms && <p className="text-sm text-red-500">{errors.agreeToTerms}</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={step === 1 || isProcessingPayment}
              >
                Previous
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={isProcessingPayment}
              >
                {isProcessingPayment ? (
                  <>Processing...</>
                ) : (
                  step === 1 ? "Continue to Payment" : "Pay with M-Pesa"
                )}
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.image?.[0] || "/assets/placeholder.jpg"}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium">KSh {((parseFloat(item.price) / 100) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>KSh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>KSh {shipping}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>KSh {total.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
