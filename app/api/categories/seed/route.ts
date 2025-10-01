import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';

// POST - Seed basic categories
export async function POST() {
  try {
    const categoryData = [
      { name: 'Food & Snacks' },
      { name: 'Groceries' },
      { name: 'Personal Care' },
      { name: 'Stationery' },
      { name: 'Electronics' },
      { name: 'Clothing' },
      { name: 'Books' },
      { name: 'Health & Wellness' },
      { name: 'Kitchen & Dining' },
      { name: 'Sports & Recreation' },
    ];

    const insertedCategories = [];
    
    for (const category of categoryData) {
      try {
        const result = await db.insert(categories)
          .values(category)
          .onConflictDoNothing({ target: categories.name })
          .returning();
        
        if (result.length > 0) {
          insertedCategories.push(result[0]);
        }
      } catch (error) {
        console.log(`Category ${category.name} might already exist`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Categories seeded successfully',
      insertedCount: insertedCategories.length,
      categories: insertedCategories
    });
  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
}
