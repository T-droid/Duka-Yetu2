import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, categories } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const categoryFilter = searchParams.get('category')
    const search = searchParams.get('search')
    
    // Get products with category information
    let query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        specifications: products.specifications,
        inStock: products.inStock,
        stock: products.stock,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        categoryId: products.categoryId,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
    
    let allProducts = await query
    
    // Filter by category if provided
    if (categoryFilter && categoryFilter !== "all") {
      allProducts = allProducts.filter(product => product.categoryName === categoryFilter)
    }
    
    // Filter by search term if provided
    if (search) {
      const searchLower = search.toLowerCase()
      allProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.categoryName?.toLowerCase().includes(searchLower)
      )
    }

    // Add computed status field
    const productsWithStatus = allProducts.map(product => ({
      ...product,
      status: product.stock === 0 ? "Out of Stock" : 
              product.stock < 10 ? "Low Stock" : 
              "In Stock"
    }))

    return NextResponse.json({ 
      success: true,
      products: productsWithStatus,
      total: productsWithStatus.length
    })
  } catch (error) {
    console.error("Admin inventory fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch inventory" },
      { status: 500 }
    )
  }
}
