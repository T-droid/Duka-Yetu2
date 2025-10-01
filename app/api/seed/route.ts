import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { categories, products } from "@/lib/db/schema"

export async function POST() {
  try {
    // Check if data already exists
    const existingCategories = await db.select().from(categories).limit(1)
    if (existingCategories.length > 0) {
      return NextResponse.json({
        success: true,
        message: "Database already seeded"
      })
    }

    // Sample categories
    const sampleCategories = [
      {
        name: "Electronics",
        description: "Laptops, phones, and electronic accessories",
        image: "/assets/category-electronics.jpg"
      },
      {
        name: "Stationery", 
        description: "Notebooks, pens, and school supplies",
        image: "/assets/category-stationery.jpg"
      },
      {
        name: "Food & Snacks",
        description: "Instant noodles, snacks, and beverages", 
        image: "/assets/category-food.jpg"
      },
      {
        name: "Personal Care",
        description: "Shampoo, soap, and hygiene products",
        image: "/assets/category-personal-care.jpg"
      }
    ]

    // Insert categories
    const insertedCategories = await db
      .insert(categories)
      .values(sampleCategories)
      .returning()

    // Sample products - matching all schema columns with specifications
    const sampleProducts = [
      {
        name: "Student Laptop Pro",
        description: "Perfect for studies and entertainment. This high-performance laptop features the latest processor, ample storage, and a crystal-clear display that makes it ideal for students.",
        price: "89999",
        categoryId: insertedCategories.find(c => c.name === "Electronics")!.id,
        image: ["/assets/product-laptop.jpg"],
        specifications: {
          "Processor": "Intel Core i5 11th Gen",
          "RAM": "8GB DDR4",
          "Storage": "512GB SSD", 
          "Display": "15.6\" Full HD",
          "Graphics": "Intel Iris Xe",
          "Battery": "Up to 8 hours",
          "Weight": "1.8 kg"
        },
        inStock: true,
        stock: 15,
        badge: "Best Seller",
        rating: 5,
        reviews: 124,
        originalPrice: 99999
      },
      {
        name: "Study Notebook Set",
        description: "Complete stationery bundle for all your academic needs. This comprehensive set includes high-quality notebooks, pens, pencils, and other essential stationery items.",
        price: "2499",
        categoryId: insertedCategories.find(c => c.name === "Stationery")!.id,
        image: ["/assets/product-notebooks.jpg"], 
        specifications: {
          "Notebooks": "5 x A4 Ruled Notebooks",
          "Pens": "3 x Blue Ballpoint Pens",
          "Pencils": "5 x HB Pencils",
          "Accessories": "Eraser, Sharpener, Ruler",
          "Paper Quality": "80 GSM"
        },
        inStock: true,
        stock: 30,
        badge: "Student Favorite",
        rating: 4,
        reviews: 67,
        originalPrice: 2999
      },
      {
        name: "Instant Noodles Pack",
        description: "Quick and delicious meal solution for busy students. Each pack contains premium quality noodles with authentic seasoning that delivers restaurant-quality taste in just 3 minutes.",
        price: "1299",
        categoryId: insertedCategories.find(c => c.name === "Food & Snacks")!.id,
        image: ["/assets/product-noodles.jpg"],
        specifications: {
          "Pack Size": "12 packets",
          "Flavor": "Chicken & Vegetable",
          "Cooking Time": "3 minutes",
          "Weight": "85g per packet",
          "Shelf Life": "18 months"
        },
        inStock: true,
        stock: 50,
        badge: "Popular",
        rating: 4,
        reviews: 89,
        originalPrice: null
      },
      {
        name: "Premium Shampoo",
        description: "Gentle care for your hair with natural ingredients. This premium shampoo is specially formulated for daily use, providing deep cleansing while maintaining your hair's natural oils.",
        price: "899",
        categoryId: insertedCategories.find(c => c.name === "Personal Care")!.id,
        image: ["/assets/product-shampoo.jpg"],
        specifications: {
          "Volume": "500ml",
          "Hair Type": "All Hair Types",
          "Key Ingredients": "Argan Oil, Vitamin E",
          "Sulfate Free": "Yes",
          "Paraben Free": "Yes"
        },
        inStock: true,
        stock: 25,
        badge: "New",
        rating: 5,
        reviews: 203,
        originalPrice: null
      }
    ]

    // Insert products
    const insertedProducts = await db
      .insert(products)
      .values(sampleProducts)
      .returning()

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully",
      data: {
        categories: insertedCategories.length,
        products: insertedProducts.length
      }
    })

  } catch (error) {
    console.error("Seeding error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to seed database" },
      { status: 500 }
    )
  }
}
