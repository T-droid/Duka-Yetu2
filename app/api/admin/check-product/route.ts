import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, categories } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

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
    const productName = searchParams.get('name')
    const categoryId = searchParams.get('categoryId')
    const categoryName = searchParams.get('categoryName')
    
    if (!productName) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      )
    }

    if (!categoryId && !categoryName) {
      return NextResponse.json(
        { success: false, error: "Category ID or name is required" },
        { status: 400 }
      )
    }

    let targetCategoryId = categoryId

    // If categoryName is provided but not categoryId, find the category
    if (!categoryId && categoryName) {
      const category = await db
        .select({ id: categories.id })
        .from(categories)
        .where(eq(categories.name, categoryName))
        .limit(1)

      if (!category.length) {
        // Category doesn't exist, so product doesn't exist
        return NextResponse.json({
          success: true,
          exists: false,
          message: "Category does not exist"
        })
      }

      targetCategoryId = category[0].id
    }

    // Check if product exists in the category
    const existingProduct = await db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(
        and(
          eq(products.name, productName),
          eq(products.categoryId, targetCategoryId!)
        )
      )
      .limit(1)

    const exists = existingProduct.length > 0

    return NextResponse.json({
      success: true,
      exists,
      message: exists 
        ? `Product "${productName}" already exists in this category`
        : `Product "${productName}" is available in this category`,
      product: exists ? existingProduct[0] : null
    })

  } catch (error) {
    console.error("Product existence check error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to check product existence" },
      { status: 500 }
    )
  }
}
