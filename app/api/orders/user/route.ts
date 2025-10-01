import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { orders, orderItems, products } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user orders with order items and product details
    const userOrders = await db
      .select({
        order: orders,
        orderItem: orderItems,
        product: products
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orders.customerEmail, session.user.email))
      .orderBy(desc(orders.createdAt));

    // Group orders by order ID
    const groupedOrders = userOrders.reduce((acc: any[], row) => {
      const orderId = row.order.id;
      const existingOrder = acc.find(o => o.id === orderId);

      if (existingOrder) {
        if (row.orderItem && row.product) {
          existingOrder.items.push({
            id: row.orderItem.id,
            productId: row.product.id,
            name: row.orderItem.productName,
            price: row.orderItem.productPrice,
            quantity: row.orderItem.quantity,
            image: row.orderItem.productImage
          });
        }
      } else {
        const newOrder = {
          id: row.order.id,
          orderNumber: row.order.orderNumber,
          totalAmount: row.order.totalAmount,
          status: row.order.status,
          paymentStatus: row.order.paymentStatus,
          paymentMethod: row.order.paymentMethod,
          customerName: row.order.customerName,
          customerEmail: row.order.customerEmail,
          customerPhone: row.order.customerPhone,
          deliveryAddress: {
            type: row.order.addressType,
            hostelName: row.order.hostelName,
            blockName: row.order.blockName,
            roomNumber: row.order.roomNumber,
            apartmentName: row.order.apartmentName,
            houseNumber: row.order.houseNumber,
          },
          deliveryInstructions: row.order.deliveryInstructions,
          createdAt: row.order.createdAt,
          updatedAt: row.order.updatedAt,
          items: []
        };

        if (row.orderItem && row.product) {
          newOrder.items.push({
            id: row.orderItem.id,
            productId: row.product.id,
            name: row.orderItem.productName,
            price: row.orderItem.productPrice,
            quantity: row.orderItem.quantity,
            image: row.orderItem.productImage
          });
        }

        acc.push(newOrder);
      }

      return acc;
    }, []);

    return NextResponse.json({ orders: groupedOrders });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
