import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, categories } from '@/lib/db/schema';

// POST - Seed sample products
export async function POST() {
  try {
    // First, get all categories from the database
    const allCategories = await db.select().from(categories);
    
    if (allCategories.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No categories found. Please seed categories first.'
      }, { status: 400 });
    }

    const categoryMap = Object.fromEntries(
      allCategories.map(cat => [cat.name, cat.id])
    );

    const productData = [
      // Food & Snacks
      {
        name: "Instant Noodles Pack",
        description: "Quick and delicious instant noodles perfect for late-night study sessions",
        price: "15000", // 150 KSh in cents
        categoryId: categoryMap["Food & Snacks"],
        image: ["/assets/product-noodles.jpg"],
        specifications: { "Weight": "70g", "Flavor": "Chicken", "Cooking Time": "3 minutes" },
        inStock: true,
        stock: 50,
        badge: "Popular",
        rating: 4,
        reviews: 25
      },
      {
        name: "Energy Bars Box",
        description: "Nutritious energy bars to fuel your study sessions",
        price: "45000", // 450 KSh in cents
        categoryId: categoryMap["Food & Snacks"],
        image: ["/assets/product-noodles.jpg"],
        specifications: { "Count": "12 bars", "Flavor": "Mixed", "Protein": "10g per bar" },
        inStock: true,
        stock: 30,
        rating: 5,
        reviews: 18
      },
      {
        name: "Campus Coffee Blend",
        description: "Premium coffee blend to keep you alert during exams",
        price: "35000", // 350 KSh in cents
        categoryId: categoryMap["Food & Snacks"],
        image: ["/assets/product-noodles.jpg"],
        specifications: { "Weight": "250g", "Type": "Ground Coffee", "Roast": "Medium" },
        inStock: true,
        stock: 25,
        badge: "Best Seller",
        rating: 4,
        reviews: 32
      },

      // Groceries
      {
        name: "Fresh Bread Loaf",
        description: "Freshly baked bread delivered daily to your hostel",
        price: "12000", // 120 KSh in cents
        categoryId: categoryMap["Groceries"],
        image: ["/assets/category-groceries.jpg"],
        specifications: { "Weight": "400g", "Type": "Whole Wheat", "Shelf Life": "3 days" },
        inStock: true,
        stock: 20,
        rating: 4,
        reviews: 15
      },
      {
        name: "Milk 1 Liter",
        description: "Fresh milk for your daily nutrition needs",
        price: "18000", // 180 KSh in cents
        categoryId: categoryMap["Groceries"],
        image: ["/assets/category-groceries.jpg"],
        specifications: { "Volume": "1L", "Type": "Fresh Milk", "Fat Content": "3.5%" },
        inStock: true,
        stock: 40,
        rating: 5,
        reviews: 28
      },

      // Personal Care
      {
        name: "Premium Shampoo",
        description: "Gentle shampoo for healthy hair care",
        price: "55000", // 550 KSh in cents
        categoryId: categoryMap["Personal Care"],
        image: ["/assets/product-shampoo.jpg"],
        specifications: { "Volume": "400ml", "Type": "For All Hair Types", "pH": "5.5" },
        inStock: true,
        stock: 35,
        badge: "New",
        rating: 4,
        reviews: 12
      },
      {
        name: "Body Soap Set",
        description: "Moisturizing body soap for daily hygiene",
        price: "25000", // 250 KSh in cents
        categoryId: categoryMap["Personal Care"],
        image: ["/assets/product-shampoo.jpg"],
        specifications: { "Count": "3 bars", "Weight": "125g each", "Fragrance": "Fresh" },
        inStock: true,
        stock: 45,
        rating: 4,
        reviews: 22
      },

      // Stationery
      {
        name: "Notebook Set A4",
        description: "High-quality notebooks for taking notes and assignments",
        price: "32000", // 320 KSh in cents
        categoryId: categoryMap["Stationery"],
        image: ["/assets/product-notebooks.jpg"],
        specifications: { "Count": "5 notebooks", "Pages": "200 each", "Size": "A4" },
        inStock: true,
        stock: 60,
        badge: "Student Choice",
        rating: 5,
        reviews: 45
      },
      {
        name: "Pen Pack Blue",
        description: "Smooth-writing pens for all your writing needs",
        price: "18000", // 180 KSh in cents
        categoryId: categoryMap["Stationery"],
        image: ["/assets/product-notebooks.jpg"],
        specifications: { "Count": "10 pens", "Ink Color": "Blue", "Tip Size": "1.0mm" },
        inStock: true,
        stock: 80,
        rating: 4,
        reviews: 35
      },

      // Electronics
      {
        name: "Student Laptop",
        description: "Affordable laptop perfect for students",
        price: "4500000", // 45,000 KSh in cents
        categoryId: categoryMap["Electronics"],
        image: ["/assets/product-laptop.jpg"],
        specifications: { "RAM": "8GB", "Storage": "256GB SSD", "Screen": "14 inch", "OS": "Windows 11" },
        inStock: true,
        stock: 10,
        badge: "Hot Deal",
        rating: 5,
        reviews: 8,
        originalPrice: 5000000 // 50,000 KSh original price
      },
      {
        name: "USB Flash Drive 32GB",
        description: "Reliable storage for your files and projects",
        price: "12000", // 120 KSh in cents
        categoryId: categoryMap["Electronics"],
        image: ["/assets/product-laptop.jpg"],
        specifications: { "Capacity": "32GB", "USB": "3.0", "Speed": "High Speed" },
        inStock: true,
        stock: 50,
        rating: 4,
        reviews: 18
      },

      // Books
      {
        name: "Mathematics Textbook",
        description: "Comprehensive mathematics guide for students",
        price: "85000", // 850 KSh in cents
        categoryId: categoryMap["Books"],
        image: ["/assets/product-notebooks.jpg"],
        specifications: { "Pages": "500", "Edition": "Latest", "Subject": "Mathematics" },
        inStock: true,
        stock: 15,
        rating: 5,
        reviews: 12
      },
      {
        name: "English Grammar Guide",
        description: "Essential grammar reference book",
        price: "65000", // 650 KSh in cents
        categoryId: categoryMap["Books"],
        image: ["/assets/product-notebooks.jpg"],
        specifications: { "Pages": "350", "Level": "Intermediate", "Subject": "English" },
        inStock: true,
        stock: 20,
        rating: 4,
        reviews: 9
      },

      // Health & Wellness
      {
        name: "Multivitamin Tablets",
        description: "Daily multivitamin supplement for students",
        price: "75000", // 750 KSh in cents
        categoryId: categoryMap["Health & Wellness"],
        image: ["/assets/product-shampoo.jpg"],
        specifications: { "Count": "30 tablets", "Duration": "1 month", "Type": "Daily Supplement" },
        inStock: true,
        stock: 25,
        rating: 4,
        reviews: 14
      },

      // Kitchen & Dining
      {
        name: "Student Cooking Set",
        description: "Basic cooking utensils for hostel cooking",
        price: "125000", // 1,250 KSh in cents
        categoryId: categoryMap["Kitchen & Dining"],
        image: ["/assets/category-groceries.jpg"],
        specifications: { "Items": "5 pieces", "Material": "Stainless Steel", "Set": "Complete" },
        inStock: true,
        stock: 18,
        badge: "Essential",
        rating: 5,
        reviews: 7
      },

      // Sports & Recreation
      {
        name: "Football Size 5",
        description: "Official size football for recreational games",
        price: "95000", // 950 KSh in cents
        categoryId: categoryMap["Sports & Recreation"],
        image: ["/assets/category-food.jpg"],
        specifications: { "Size": "5", "Material": "Synthetic Leather", "Type": "Match Ball" },
        inStock: true,
        stock: 12,
        rating: 4,
        reviews: 6
      }
    ];

    const insertedProducts = [];
    let successCount = 0;
    let failureCount = 0;

    for (const product of productData) {
      try {
        const result = await db.insert(products).values(product).returning();
        if (result.length > 0) {
          insertedProducts.push(result[0]);
          successCount++;
        }
      } catch (error) {
        failureCount++;
        console.log(`Failed to insert product: ${product.name}`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Products seeded successfully',
      summary: {
        total: productData.length,
        successful: successCount,
        failed: failureCount
      },
      insertedProducts: insertedProducts.map(p => ({ id: p.id, name: p.name }))
    });
  } catch (error) {
    console.error('Error seeding products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed products' },
      { status: 500 }
    );
  }
}
