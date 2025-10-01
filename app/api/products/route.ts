import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products, categories } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')
    
    let query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        inStock: products.inStock,
        stock: products.stock,
        createdAt: products.createdAt,
        categoryId: products.categoryId,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
    
    let allProducts = await query
    
    // Filter by category if provided
    if (categoryId) {
      allProducts = allProducts.filter(product => product.categoryId === categoryId)
    }
    
    // If search is provided, filter by name or description
    if (search) {
      const searchLower = search.toLowerCase()
      allProducts = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.categoryName?.toLowerCase().includes(searchLower)
      )
    }

    return NextResponse.json({ 
      success: true,
      products: allProducts 
    })
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, image, stock } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { success: false, error: "Name, price, and category are required" },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)

    if (!category.length) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 400 }
      )
    }

    const newProduct = await db
      .insert(products)
      .values({
        name,
        description,
        price,
        categoryId,
        image,
        stock: stock || 0,
        inStock: (stock || 0) > 0
      })
      .returning()

    return NextResponse.json(
      { 
        success: true,
        message: "Product created successfully", 
        product: newProduct[0] 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    )
  }
}
