import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products, categories } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params

    // Verify category exists
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.id, categoryId))
      .limit(1)

    if (!category.length) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      )
    }

    // Get products in this category
    const categoryProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        inStock: products.inStock,
        stock: products.stock,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(eq(products.categoryId, categoryId))

    return NextResponse.json({ 
      success: true,
      category: category[0],
      products: categoryProducts 
    })
  } catch (error) {
    console.error("Category products fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch category products" },
      { status: 500 }
    )
  }
}
