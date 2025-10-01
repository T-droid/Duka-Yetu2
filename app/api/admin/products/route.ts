import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { products, categories } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    
    console.log("Product creation - Session:", session)
    console.log("Product creation - User:", session?.user)
    console.log("Product creation - User role:", session?.user?.role)
    
    if (!session?.user) {
      console.log("Product creation - No session or user found")
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

    const body = await request.json()
    const { name, description, price, category, categoryId, image, stock, specifications } = body

    if (!name || !price || (!category && !categoryId)) {
      return NextResponse.json(
        { success: false, error: "Name, price, and category are required" },
        { status: 400 }
      )
    }

    let targetCategoryId = categoryId

    // If category name is provided but not categoryId, find or create the category
    if (category && !categoryId) {
      // First check if category exists
      const existingCategory = await db
        .select()
        .from(categories)
        .where(eq(categories.name, category))
        .limit(1)

      if (existingCategory.length > 0) {
        targetCategoryId = existingCategory[0].id
      } else {
        // Create new category
        const newCategory = await db
          .insert(categories)
          .values({
            name: category
          })
          .returning()
        
        targetCategoryId = newCategory[0].id
      }
    } else if (categoryId) {
      // Verify category exists
      const categoryExists = await db
        .select()
        .from(categories)
        .where(eq(categories.id, categoryId))
        .limit(1)

      if (!categoryExists.length) {
        return NextResponse.json(
          { success: false, error: "Category not found" },
          { status: 400 }
        )
      }
    }

    // Check if product with same name already exists in this category
    const existingProduct = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.name, name),
          eq(products.categoryId, targetCategoryId!)
        )
      )
      .limit(1)

    if (existingProduct.length > 0) {
      return NextResponse.json(
        { success: false, error: `Product "${name}" already exists in this category` },
        { status: 400 }
      )
    }

    // Create the product
    const stockNumber = parseInt(stock) || 0
    const newProduct = await db
      .insert(products)
      .values({
        name,
        description,
        price: price.toString(),
        categoryId: targetCategoryId!,
        image: Array.isArray(image) ? image : (image ? [image] : null),
        specifications: specifications || null,
        stock: stockNumber,
        inStock: stockNumber > 0
      })
      .returning()

    // Get the product with category information for response
    const productWithCategory = await db
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
      .where(eq(products.id, newProduct[0].id))
      .limit(1)

    return NextResponse.json(
      { 
        success: true,
        message: "Product created successfully", 
        product: productWithCategory[0]
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
