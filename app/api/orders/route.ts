import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderItems, cart, users } from '@/lib/db/schema';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      customerInfo,
      addressInfo,
      paymentInfo,
      cartItems,
      totals,
      transactionId,
      checkoutRequestId
    } = await request.json();

    // Validate required data
    if (!customerInfo || !addressInfo || !paymentInfo || !cartItems || !totals) {
      return NextResponse.json(
        { success: false, message: 'Missing required order data' },
        { status: 400 }
      );
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;

    // Create order
    const [order] = await db.insert(orders).values({
      userId: session.user.id,
      orderNumber,
      
      // Customer Information
      customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      
      // Delivery Address
      addressType: addressInfo.type,
      hostelName: addressInfo.hostelName,
      blockName: addressInfo.blockName,
      roomNumber: addressInfo.roomNumber,
      apartmentName: addressInfo.apartmentName,
      houseNumber: addressInfo.houseNumber,
      deliveryInstructions: addressInfo.deliveryInstructions,
      
      // Order Details
      subtotal: totals.subtotal, // already in cents
      shippingCost: totals.shipping, // already in cents
      totalAmount: totals.total, // already in cents
      
      // Payment Information
      paymentMethod: 'mpesa',
      mpesaNumber: paymentInfo.mpesaNumber,
      paymentStatus: 'pending',
      transactionId,
      checkoutRequestId,
      
      // Order Status
      status: 'pending'
    }).returning();

    // Create order items
    const orderItemsData = cartItems.map((item: any) => ({
      orderId: order.id,
      productId: item.id,
      productName: item.name,
      productPrice: item.price, // price in cents as string
      productImage: item.image?.[0] || null,
      quantity: item.quantity,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Clear the user's cart after successful order creation
    try {
      const user = await db.select().from(users).where(eq(users.email, session.user.email!)).limit(1);
      if (user[0]) {
        await db.delete(cart).where(eq(cart.userId, user[0].id));
      }
    } catch (cartError) {
      console.error('Error clearing cart after order creation:', cartError);
      // Don't fail the order creation if cart clearing fails
    }

    return NextResponse.json({
      success: true,
      message: 'Order created successfully',
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
