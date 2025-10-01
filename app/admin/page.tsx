"use client";

import React, { useState, useMemo, useEffect } from "react";
import Header from "@/components/Header/Header";
import { ProtectedRoute } from "@/components/ProtectedRouteNext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Package, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  ShoppingCart,
  Clock,
  Truck,
  CheckCircle
} from "lucide-react";
import { useAdminInventory } from "@/hooks/useAdminInventory";
import { useCheckProductExists } from "@/hooks/useCheckProductExists";
import { useCreateAdminProduct } from "@/hooks/useCreateAdminProduct";
import { useCategories } from "@/hooks/useCategories";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function Admin() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [productExists, setProductExists] = useState(false);
  const [activeTab, setActiveTab] = useState("inventory");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  
  const { toast } = useToast();
  
  const [statusFilter, setStatusFilter] = useState("all");
  
  // API hooks
  const { products: inventory, isLoading: inventoryLoading, error: inventoryError, refetch: refetchProducts, total } = useAdminInventory(selectedCategory, searchTerm);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { checkProductExists, isChecking: checkingProduct } = useCheckProductExists();
  const { createProduct, isCreating } = useCreateAdminProduct();
  
  // Filter inventory based on search and status
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    
    return inventory.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [inventory, searchTerm, statusFilter]);

  // Calculate stats from inventory data
  const stats = useMemo(() => {
    if (!inventory) return { lowStock: 0, outOfStock: 0, totalValue: 0 };
    
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;
    
    inventory.forEach((product) => {
      if (product.status === 'low-stock') lowStock++;
      if (product.status === 'out-of-stock') outOfStock++;
      totalValue += parseFloat(product.price.toString()) * product.stock;
    });
    
    return { lowStock, outOfStock, totalValue };
  }, [inventory]);
  
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    image: [""],
    specifications: {} as Record<string, string>
  });
  
  const [isExistingCategory, setIsExistingCategory] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Check product existence when name or category changes
  const handleProductExistenceCheck = async (name: string, categoryName?: string, categoryId?: string) => {
    if (!name.trim() || (!categoryName && !categoryId)) {
      setProductExists(false);
      return;
    }
    
    try {
      const exists = await checkProductExists(name, categoryId, categoryName);
      setProductExists(exists);
    } catch (error) {
      console.error("Error checking product existence:", error);
      setProductExists(false);
    }
  };

  const handleAddProduct = async () => {
    // Basic validation
    if (!newProduct.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a product name",
        variant: "destructive",
      });
      return;
    }
    if (!newProduct.category.trim()) {
      toast({
        title: "Validation Error",
        description: "Please select or enter a category",
        variant: "destructive",
      });
      return;
    }
    
    // Check if product already exists (only for existing categories)
    // if (isExistingCategory && productExists) {
    //   toast({
    //     title: "Product Already Exists",
    //     description: `A product with the name "${newProduct.name}" already exists in the "${newProduct.category}" category`,
    //     variant: "destructive",
    //   });
    //   return;
    // }
    
    if (!newProduct.price || parseFloat(newProduct.price) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid price",
        variant: "destructive",
      });
      return;
    }
    if (!newProduct.stock || parseInt(newProduct.stock) < 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid stock quantity",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        categoryId: selectedCategoryId || undefined,
        image: newProduct.image.filter(url => url.trim() !== ""),
        specifications: newProduct.specifications,
        stock: parseInt(newProduct.stock)
      };

      await createProduct(productData);

      // Reset form and close dialog
      setNewProduct({ 
        name: "", 
        category: "", 
        price: "", 
        stock: "", 
        description: "", 
        image: [""],
        specifications: {}
      });
      setIsAddDialogOpen(false);
      setProductExists(false);
      setSelectedCategoryId(null);
      setIsExistingCategory(false);
      
      // Refresh the products list
      refetchProducts();
      
      toast({
        title: "Success!",
        description: "Product created successfully",
      });
    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = (id: string) => {
    // TODO: Implement delete API
    toast({
      title: "Delete Product",
      description: "Product deletion functionality coming soon",
      variant: "default"
    });
  };

  // Fetch all orders for admin
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await fetch('/api/admin/orders');
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive"
      });
    } finally {
      setOrdersLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error", 
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  // Fetch orders when tab switches to orders
  React.useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    const variants = {
      "In Stock": "default",
      "Low Stock": "secondary",
      "Out of Stock": "destructive"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getOrderStatusBadge = (status: string) => {
    const variants = {
      "pending": "secondary",
      "confirmed": "default", 
      "processing": "secondary",
      "shipped": "default",
      "delivered": "default",
      "cancelled": "destructive"
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>;
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatPrice = (priceInCents: number | string) => {
    const price = typeof priceInCents === 'string' ? parseInt(priceInCents) : priceInCents;
    return (price / 100).toFixed(2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders based on search and status
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    return orders.filter((order) => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                           order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
                           order.customerEmail.toLowerCase().includes(orderSearchTerm.toLowerCase());
      const matchesStatus = orderStatusFilter === "all" || order.status === orderStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, orderSearchTerm, orderStatusFilter]);

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-background">
        <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage your products and inventory</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 sm:mt-0">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your inventory.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input  
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewProduct({...newProduct, name});
                      
                      // Check product existence in real-time
                      if (isExistingCategory && newProduct.category) {
                        handleProductExistenceCheck(name, newProduct.category, selectedCategoryId || undefined);
                      }
                    }}
                    placeholder="Enter product name"
                    className={isExistingCategory && productExists ? "border-red-500" : ""}
                  />
                  {isExistingCategory && productExists && newProduct.name.trim() && newProduct.category.trim() && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      ⚠️ A product with this name already exists in the "{newProduct.category}" category
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newProduct.category}
                    onValueChange={(value) => {
                      setNewProduct({...newProduct, category: value});
                      
                      // Find the category and set as existing
                      const category = categories?.find(cat => cat.name === value);
                      if (category) {
                        setSelectedCategoryId(category.id);
                        setIsExistingCategory(true);
                        
                        // Check product existence if name is filled
                        if (newProduct.name.trim()) {
                          handleProductExistenceCheck(newProduct.name, value, category.id);
                        }
                      } else {
                        setSelectedCategoryId(null);
                        setIsExistingCategory(false);
                        setProductExists(false);
                      }
                    }}
                  >
                    <SelectTrigger className={isExistingCategory && productExists ? "border-red-500" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoriesLoading ? (
                        <SelectItem value="loading" disabled>Loading categories...</SelectItem>
                      ) : (
                        categories?.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {!productExists && newProduct.name.trim() && newProduct.category.trim() && !checkingProduct && isExistingCategory && (
                    <p className="text-xs text-green-600 flex items-center gap-1">
                      ✅ This product name is available in the "{newProduct.category}" category
                    </p>
                  )}
                  {checkingProduct && newProduct.name.trim() && newProduct.category.trim() && isExistingCategory && (
                    <p className="text-xs text-muted-foreground">
                      Checking availability...
                    </p>
                  )}
                  {!isExistingCategory && newProduct.category.trim() && (
                    <p className="text-xs text-blue-600 flex items-center gap-1">
                      ➕ Creating new category: "{newProduct.category}"
                    </p>
                  )}
                  {!newProduct.category.trim() && (
                    <p className="text-xs text-muted-foreground">
                      You can select from existing categories or type a new one to create it
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label>Product Images</Label>
                  {newProduct.image.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={url}
                        onChange={(e) => {
                          const newImages = [...newProduct.image];
                          newImages[index] = e.target.value;
                          setNewProduct({...newProduct, image: newImages});
                        }}
                        placeholder={`Image URL ${index + 1}`}
                      />
                      {newProduct.image.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newImages = newProduct.image.filter((_, i) => i !== index);
                            setNewProduct({...newProduct, image: newImages});
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewProduct({...newProduct, image: [...newProduct.image, ""]});
                    }}
                  >
                    Add Image
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    placeholder="Enter product description"
                  />
                </div>
                
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label>Product Specifications</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSpecs = { ...newProduct.specifications };
                        const newKey = `Spec ${Object.keys(newSpecs).length + 1}`;
                        newSpecs[newKey] = "";
                        setNewProduct({...newProduct, specifications: newSpecs});
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Specification
                    </Button>
                  </div>
                  
                  {Object.keys(newProduct.specifications).length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground border-2 border-dashed rounded-lg">
                      <p className="text-sm">No specifications added yet</p>
                      <p className="text-xs">Click "Add Specification" to add product details</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Object.entries(newProduct.specifications).map(([key, value], index) => (
                        <div key={index} className="grid grid-cols-5 gap-2 items-center p-2 border rounded-lg">
                          <div className="col-span-2">
                            <Input
                              value={key}
                              onChange={(e) => {
                                const newKey = e.target.value;
                                const newSpecs = { ...newProduct.specifications };
                                
                                // If the key is changing, remove the old key and add the new one
                                if (newKey !== key) {
                                  delete newSpecs[key];
                                  newSpecs[newKey] = value;
                                  setNewProduct({...newProduct, specifications: newSpecs});
                                }
                              }}
                              placeholder="Specification name (e.g., Volume)"
                              className="text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              value={value}
                              onChange={(e) => {
                                const newSpecs = { ...newProduct.specifications };
                                newSpecs[key] = e.target.value;
                                setNewProduct({...newProduct, specifications: newSpecs});
                              }}
                              placeholder="Value (e.g., 500ml)"
                              className="text-sm"
                            />
                          </div>
                          <div className="col-span-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newSpecs = { ...newProduct.specifications };
                                delete newSpecs[key];
                                setNewProduct({...newProduct, specifications: newSpecs});
                              }}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {Object.keys(newProduct.specifications).length > 0 && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <p>💡 Tip: Common specifications include Volume, Weight, Dimensions, Material, etc.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddProduct} 
                  disabled={isCreating || (isExistingCategory && productExists) || (isExistingCategory && checkingProduct)}
                >
                  {isCreating ? "Creating..." : 
                   (isExistingCategory && checkingProduct) ? "Checking..." :
                   (isExistingCategory && productExists) ? "Product Already Exists" : 
                   "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Inventory Management
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Order Management  
            </TabsTrigger>
          </TabsList>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryLoading ? "..." : total || inventory?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {inventoryLoading ? "Loading..." : "Total products in inventory"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{inventoryLoading ? "..." : stats.lowStock}</div>
              <p className="text-xs text-muted-foreground">
                Products with low stock
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${inventoryLoading ? "..." : stats.totalValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total inventory value
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inventoryLoading ? "..." : stats.outOfStock}</div>
              <p className="text-xs text-muted-foreground">
                Products out of stock
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Products Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Product Inventory</CardTitle>
                <CardDescription>
                  Manage your product catalog and inventory levels
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-full sm:w-64"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categoriesLoading ? (
                      <SelectItem value="category" disabled>Loading categories...</SelectItem>
                    ) : (
                      categories?.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventoryLoading ? (
                  Array(5).fill(0).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : (
                  filteredInventory?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.categoryName}</TableCell>
                      <TableCell>${product.price}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            {/* Order Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{ordersLoading ? "..." : orders.length}</div>
                  <p className="text-xs text-muted-foreground">
                    All orders received
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {ordersLoading ? "..." : orders.filter(order => ['pending', 'confirmed'].includes(order.status)).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Orders awaiting processing
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shipped Orders</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {ordersLoading ? "..." : orders.filter(order => order.status === 'shipped').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Orders in transit
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {ordersLoading ? "..." : orders.filter(order => order.status === 'delivered').length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Successfully completed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Orders Table */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>Order Management</CardTitle>
                    <CardDescription>
                      View and manage customer orders
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search orders..."
                        value={orderSearchTerm}
                        onChange={(e) => setOrderSearchTerm(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    
                    <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordersLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                          <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                        </TableRow>
                      ))
                    ) : filteredOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center gap-2">
                            <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                            <p className="text-muted-foreground">
                              {orderSearchTerm || orderStatusFilter !== "all" 
                                ? "No orders match your search criteria"
                                : "No orders found"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{order.customerName}</div>
                              <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
                            </div>
                          </TableCell>
                          <TableCell>KSh {formatPrice(order.totalAmount)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getOrderStatusIcon(order.status)}
                              {getOrderStatusBadge(order.status)}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Order Details - {order.orderNumber}</DialogTitle>
                                    <DialogDescription>
                                      Order placed on {formatDate(order.createdAt)}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-medium">Customer Information</h4>
                                        <div className="text-sm space-y-1 mt-2">
                                          <p><strong>Name:</strong> {order.customerName}</p>
                                          <p><strong>Email:</strong> {order.customerEmail}</p>
                                          <p><strong>Phone:</strong> {order.customerPhone || 'N/A'}</p>
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-medium">Delivery Address</h4>
                                        <div className="text-sm space-y-1 mt-2">
                                          {order.deliveryAddress?.type === 'hostel' ? (
                                            <>
                                              <p>{order.deliveryAddress.hostelName}</p>
                                              <p>Block {order.deliveryAddress.blockName}, Room {order.deliveryAddress.roomNumber}</p>
                                            </>
                                          ) : (
                                            <>
                                              <p>{order.deliveryAddress?.apartmentName}</p>
                                              {order.deliveryAddress?.houseNumber && <p>House {order.deliveryAddress.houseNumber}</p>}
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {order.items && order.items.length > 0 && (
                                      <div>
                                        <h4 className="font-medium">Order Items</h4>
                                        <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                                          {order.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                                              <div className="flex items-center gap-3">
                                                {item.image && (
                                                  <img 
                                                    src={item.image} 
                                                    alt={item.name}
                                                    className="w-10 h-10 object-cover rounded"
                                                  />
                                                )}
                                                <div>
                                                  <p className="font-medium">{item.name}</p>
                                                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                                </div>
                                              </div>
                                              <p className="font-medium">KSh {formatPrice(item.price)}</p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="border-t pt-4">
                                      <div className="flex justify-between items-center">
                                        <span className="font-medium">Total Amount:</span>
                                        <span className="text-lg font-bold">KSh {formatPrice(order.totalAmount)}</span>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <Select
                                  value={order.status}
                                  onValueChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="shipped">Shipped</SelectItem>
                                    <SelectItem value="delivered">Delivered</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
    </ProtectedRoute>
  );
}