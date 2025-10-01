import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { products, categories } from "@/lib/db/schema"
import { eq, ne, and } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryName = searchParams.get("category")
    const excludeId = searchParams.get("exclude")
    const limit = parseInt(searchParams.get("limit") || "4")

    if (!categoryName) {
      return NextResponse.json(
        { success: false, error: "Category is required" },
        { status: 400 }
      )
    }

    // First get the category ID
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.name, categoryName))
      .limit(1)

    if (category.length === 0) {
      return NextResponse.json({
        success: true,
        products: []
      })
    }

    // Build where condition
    const whereCondition = excludeId 
      ? and(eq(products.categoryId, category[0].id), ne(products.id, excludeId))
      : eq(products.categoryId, category[0].id)

    // Get products in the same category
    const relatedProducts = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        image: products.image,
        specifications: products.specifications,
        inStock: products.inStock,
        stock: products.stock,
        badge: products.badge,
        rating: products.rating,
        reviews: products.reviews,
        originalPrice: products.originalPrice,
        categoryName: categories.name,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(whereCondition)
      .limit(limit)

    return NextResponse.json({
      success: true,
      products: relatedProducts
    })

  } catch (error) {
    console.error("Related products fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch related products" },
      { status: 500 }
    )
  }
}
