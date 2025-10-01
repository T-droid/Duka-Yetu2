import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { cart, products, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// GET - Fetch user's cart
export async function GET() {
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

    // Get cart items with current product data
    const cartItems = await db
      .select({
        cart: cart,
        product: products
      })
      .from(cart)
      .innerJoin(products, eq(cart.productId, products.id))
      .where(eq(cart.userId, user[0].id));

    // Format cart items
    const formattedItems = cartItems.map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image || [],
      quantity: item.cart.quantity,
      stock: item.product.stock,
      categoryName: '', // We'll need to join categories if needed
      cartId: item.cart.id,
      updatedAt: item.cart.updatedAt
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// POST - Add item to cart
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await req.json();

    // Get user
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get product details
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if item already exists in cart
    const existingCartItem = await db
      .select()
      .from(cart)
      .where(and(eq(cart.userId, user[0].id), eq(cart.productId, productId)))
      .limit(1);

    if (existingCartItem[0]) {
      // Update quantity
      const newQuantity = existingCartItem[0].quantity + quantity;
      
      // Check stock availability
      if (newQuantity > product[0].stock) {
        return NextResponse.json(
          { error: 'Insufficient stock', availableStock: product[0].stock },
          { status: 400 }
        );
      }

      const updatedCartItem = await db
        .update(cart)
        .set({ 
          quantity: newQuantity,
          updatedAt: new Date()
        })
        .where(eq(cart.id, existingCartItem[0].id))
        .returning();

      return NextResponse.json({ 
        message: 'Cart updated successfully',
        cartItem: updatedCartItem[0]
      });
    } else {
      // Check stock availability
      if (quantity > product[0].stock) {
        return NextResponse.json(
          { error: 'Insufficient stock', availableStock: product[0].stock },
          { status: 400 }
        );
      }

      // Add new item to cart
      const newCartItem = await db
        .insert(cart)
        .values({
          userId: user[0].id,
          productId: productId,
          productName: product[0].name,
          productPrice: product[0].price,
          productImage: product[0].image?.[0] || null,
          quantity: quantity
        })
        .returning();

      return NextResponse.json({ 
        message: 'Item added to cart successfully',
        cartItem: newCartItem[0]
      });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

// PUT - Update cart item quantity
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity } = await req.json();

    // Get user
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get product for stock check
    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product[0]) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check stock availability
    if (quantity > product[0].stock) {
      return NextResponse.json(
        { error: 'Insufficient stock', availableStock: product[0].stock },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      // Remove item from cart
      await db
        .delete(cart)
        .where(and(eq(cart.userId, user[0].id), eq(cart.productId, productId)));

      return NextResponse.json({ message: 'Item removed from cart' });
    } else {
      // Update quantity
      const updatedCartItem = await db
        .update(cart)
        .set({ 
          quantity: quantity,
          updatedAt: new Date()
        })
        .where(and(eq(cart.userId, user[0].id), eq(cart.productId, productId)))
        .returning();

      return NextResponse.json({ 
        message: 'Cart updated successfully',
        cartItem: updatedCartItem[0]
      });
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

// DELETE - Remove item from cart or clear cart
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    // Get user
    const user = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (productId) {
      // Remove specific item
      await db
        .delete(cart)
        .where(and(eq(cart.userId, user[0].id), eq(cart.productId, productId)));

      return NextResponse.json({ message: 'Item removed from cart' });
    } else {
      // Clear entire cart
      await db
        .delete(cart)
        .where(eq(cart.userId, user[0].id));

      return NextResponse.json({ message: 'Cart cleared successfully' });
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}
