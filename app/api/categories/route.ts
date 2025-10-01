import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET() {
  try {
    const allCategories = await db.select().from(categories)
    
    return NextResponse.json({ 
      success: true,
      categories: allCategories 
    })
  } catch (error) {
    console.error("Categories fetch error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      )
    }

    // Check if category already exists
    const existingCategory = await db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .limit(1)

    if (existingCategory.length > 0) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
        { status: 400 }
      )
    }

    const newCategory = await db
      .insert(categories)
      .values({
        name,
      })
      .returning()

    return NextResponse.json(
      { 
        success: true, 
        message: "Category created successfully", 
        category: newCategory[0] 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Category creation error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    )
  }
}
