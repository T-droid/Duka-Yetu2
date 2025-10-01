import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { cart, products, users, categories } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// POST - Sync cart with current product data and stock levels
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get cart items with current product data and category info
    const cartItems = await db
      .select({
        cart: cart,
        product: products,
        category: categories
      })
      .from(cart)
      .innerJoin(products, eq(cart.productId, products.id))
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(cart.userId, user[0].id));

    const syncedItems = [];
    const removedItems = [];
    const updatedItems = [];

    for (const item of cartItems) {
      // Check if product is still available and in stock
      if (!item.product.inStock || item.product.stock === 0) {
        // Remove out-of-stock items
        await db.delete(cart).where(eq(cart.id, item.cart.id));
        removedItems.push({
          id: item.product.id,
          name: item.product.name,
          reason: 'Out of stock'
        });
        continue;
      }

      // Check if cart quantity exceeds available stock
      if (item.cart.quantity > item.product.stock) {
        // Update quantity to maximum available
        const updatedCart = await db
          .update(cart)
          .set({ 
            quantity: item.product.stock,
            updatedAt: new Date()
          })
          .where(eq(cart.id, item.cart.id))
          .returning();

        updatedItems.push({
          id: item.product.id,
          name: item.product.name,
          oldQuantity: item.cart.quantity,
          newQuantity: item.product.stock,
          reason: 'Quantity reduced due to limited stock'
        });

        syncedItems.push({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || [],
          quantity: item.product.stock,
          stock: item.product.stock,
          categoryName: item.category?.name || '',
          cartId: item.cart.id,
          updatedAt: updatedCart[0].updatedAt
        });
      } else {
        // Item is valid, add to synced items
        syncedItems.push({
          id: item.product.id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.image || [],
          quantity: item.cart.quantity,
          stock: item.product.stock,
          categoryName: item.category?.name || '',
          cartId: item.cart.id,
          updatedAt: item.cart.updatedAt
        });
      }
    }

    return NextResponse.json({ 
      items: syncedItems,
      changes: {
        removed: removedItems,
        updated: updatedItems
      }
    });
  } catch (error) {
    console.error('Error syncing cart:', error);
    return NextResponse.json({ error: 'Failed to sync cart' }, { status: 500 });
  }
}
