import 'dotenv/config';
import { db } from './index';
import { categories } from './schema';

export async function seedCategories() {
  console.log('Seeding categories...');

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

  try {
    for (const category of categoryData) {
      await db.insert(categories).values(category).onConflictDoNothing({ target: categories.name });
    }
    console.log('Categories seeded successfully');
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
}

// Run this function if the file is executed directly
if (require.main === module) {
  seedCategories()
    .then(() => {
      console.log('Category seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Category seeding failed:', error);
      process.exit(1);
    });
}
