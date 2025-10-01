"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Package, Truck, CheckCircle, Clock, Search, Filter, Eye, Download, Star, Loader2 } from "lucide-react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuthNext";

// Types for our order data
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
  image: string | null;
}

interface DeliveryAddress {
  type: string;
  hostelName: string | null;
  blockName: string | null;
  roomNumber: string | null;
  apartmentName: string | null;
  houseNumber: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  deliveryAddress: DeliveryAddress;
  deliveryInstructions: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "processing":
      return <Clock className="h-4 w-4" />;
    case "shipped":
      return <Truck className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Package className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "processing":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "shipped":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default function OrdersPage() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated || isAuthLoading) return;
      
      try {
        setIsLoading(true);
        const response = await fetch('/api/orders/user');
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        setOrders(data.orders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, isAuthLoading]);

  // Helper function to get estimated delivery date
  const getEstimatedDelivery = (createdAt: string) => {
    const orderDate = new Date(createdAt);
    const deliveryDate = new Date(orderDate);
    // Add 1 day for estimated delivery
    deliveryDate.setDate(orderDate.getDate() + 1);
    return deliveryDate;
  };

  // Helper function to format price from cents
  const formatPrice = (priceInCents: number | string) => {
    const price = typeof priceInCents === 'string' ? parseInt(priceInCents) : priceInCents;
    return (price / 100).toFixed(2);
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const OrderDetailsModal = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
    if (!order) return null;

    const estimatedDelivery = getEstimatedDelivery(order.createdAt);
    const timeline = [
      { 
        status: "Order Placed", 
        date: order.createdAt, 
        time: new Date(order.createdAt).toLocaleTimeString('en-US', { hour12: false }), 
        completed: true 
      },
      { 
        status: "Payment Confirmed", 
        date: order.paymentStatus === 'completed' ? order.createdAt : '', 
        time: order.paymentStatus === 'completed' ? new Date(order.createdAt).toLocaleTimeString('en-US', { hour12: false }) : '', 
        completed: order.paymentStatus === 'completed' 
      },
      { 
        status: "Processing", 
        date: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? order.updatedAt : '', 
        time: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) ? new Date(order.updatedAt).toLocaleTimeString('en-US', { hour12: false }) : '', 
        completed: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) 
      },
      { 
        status: "Shipped", 
        date: ['shipped', 'delivered'].includes(order.status) ? order.updatedAt : '', 
        time: ['shipped', 'delivered'].includes(order.status) ? new Date(order.updatedAt).toLocaleTimeString('en-US', { hour12: false }) : '', 
        completed: ['shipped', 'delivered'].includes(order.status) 
      },
      { 
        status: "Delivered", 
        date: order.status === 'delivered' ? order.updatedAt : '', 
        time: order.status === 'delivered' ? new Date(order.updatedAt).toLocaleTimeString('en-US', { hour12: false }) : '', 
        completed: order.status === 'delivered' 
      }
    ];

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
          <DialogDescription>
            Placed on {formatDate(order.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Timeline */}
          <div>
            <h3 className="font-semibold mb-4">Order Status</h3>
            <div className="space-y-4">
              {timeline.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step.completed 
                      ? 'bg-green-100 border-green-500 text-green-600' 
                      : 'bg-gray-100 border-gray-300 text-gray-400'
                  }`}>
                    {step.completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.status}
                    </p>
                    {step.date && (
                      <p className="text-sm text-muted-foreground">
                        {formatDate(step.date)} at {step.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Information */}
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Delivery Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Payment Method:</span>
                  <span className="capitalize">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Status:</span>
                  <span className={`capitalize ${order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>{formatDate(estimatedDelivery.toISOString())}</span>
                </div>
                {order.status === 'delivered' && (
                  <div className="flex justify-between">
                    <span>Delivered:</span>
                    <span className="text-green-600 font-medium">
                      {formatDate(order.updatedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Items & Details */}
          <div>
            <h3 className="font-semibold mb-4">Items Ordered</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <img
                    src={item.image || '/assets/product-placeholder.jpg'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    <p className="font-medium">KSh {formatPrice(item.price)}</p>
                  </div>
                  {order.status === "delivered" && (
                    <Button variant="outline" size="sm">
                      <Star className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Delivery Address */}
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Delivery Address</h4>
              <div className="text-sm space-y-1">
                <p className="font-medium">{order.customerName}</p>
                {order.deliveryAddress.type === 'hostel' ? (
                  <>
                    <p>{order.deliveryAddress.hostelName}</p>
                    <p>Block {order.deliveryAddress.blockName}, Room {order.deliveryAddress.roomNumber}</p>
                  </>
                ) : (
                  <>
                    <p>{order.deliveryAddress.apartmentName}</p>
                    {order.deliveryAddress.houseNumber && <p>House {order.deliveryAddress.houseNumber}</p>}
                  </>
                )}
                {order.deliveryInstructions && (
                  <p className="text-muted-foreground italic">
                    Instructions: {order.deliveryInstructions}
                  </p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mt-6 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Items Total:</span>
                  <span>KSh {order.items.reduce((sum, item) => sum + (parseInt(item.price) * item.quantity), 0) / 100}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>KSh 0.00</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-medium">
                  <span>Total Paid:</span>
                  <span>KSh {formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-2">
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              {order.status !== "delivered" && (
                <Button variant="outline" className="w-full">
                  Cancel Order
                </Button>
              )}
              {order.status === "delivered" && (
                <Button variant="outline" className="w-full">
                  Return Items
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">
            Track and manage your orders
          </p>
        </div>

        {/* Loading State */}
        {(isAuthLoading || isLoading) && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading your orders...</span>
          </div>
        )}

        {/* Authentication Required */}
        {!isAuthLoading && !isAuthenticated && (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Sign in Required</h3>
              <p className="text-muted-foreground mb-6">
                Please sign in to view your orders.
              </p>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="text-center py-16">
              <Package className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Error Loading Orders</h3>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Content - Only show when authenticated and loaded */}
        {!isAuthLoading && !isLoading && isAuthenticated && !error && (
          <>
            {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="text-center py-16">
                <Package className="h-24 w-24 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || statusFilter !== "all" 
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't placed any orders yet."
                  }
                </p>
                <Link href="/shop">
                  <Button>Start Shopping</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card key={order.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed on {formatDate(order.createdAt)}
                          </p>
                        </div>
                        
                        <Badge 
                          variant="outline" 
                          className={`w-fit ${getStatusColor(order.status)} border`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <img
                              src={item.image || '/assets/product-placeholder.jpg'}
                              alt={item.name}
                              className="w-8 h-8 object-cover rounded"
                            />
                            <span className="text-sm truncate max-w-32">
                              {item.name}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-sm text-muted-foreground">
                            +{order.items.length - 3} more items
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <span>Total: <span className="font-semibold text-foreground">KSh {formatPrice(order.totalAmount)}</span></span>
                        {order.status !== "delivered" && (
                          <>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              Expected: {formatDate(getEstimatedDelivery(order.createdAt).toISOString())}
                            </span>
                          </>
                        )}
                        <span className="hidden sm:inline">•</span>
                        <span>
                          Payment: <span className="capitalize">{order.paymentStatus}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <OrderDetailsModal order={order} onClose={() => setSelectedOrder(null)} />
                      </Dialog>
                      
                      {order.status === "shipped" && (
                        <Button variant="outline" size="sm">
                          <Truck className="h-4 w-4 mr-1" />
                          Track Order
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        </>
        )}

        {/* Help Section */}
        <Card className="mt-12">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Package className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Order Issues</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Problems with your order?
                </p>
                <Button variant="outline" size="sm">Contact Support</Button>
              </div>
              <div className="text-center">
                <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Shipping Info</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Learn about delivery options
                </p>
                <Button variant="outline" size="sm">Shipping Guide</Button>
              </div>
              <div className="text-center">
                <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-medium mb-1">Returns</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Need to return an item?
                </p>
                <Button variant="outline" size="sm">Return Policy</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
