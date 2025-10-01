import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const callbackData = await request.json();
    
    console.log('M-Pesa Callback Received:', JSON.stringify(callbackData, null, 2));

    // Extract callback data from M-Pesa response
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    if (!stkCallback) {
      console.error('Invalid callback structure');
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    console.log('Processing callback:', {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc
    });

    // ResultCode 0 means successful payment
    if (ResultCode === 0) {
      // Extract payment details from CallbackMetadata
      const metadata = CallbackMetadata?.Item || [];
      const paymentDetails: any = {};
      
      metadata.forEach((item: any) => {
        switch (item.Name) {
          case 'Amount':
            paymentDetails.amount = item.Value;
            break;
          case 'MpesaReceiptNumber':
            paymentDetails.mpesaReceiptNumber = item.Value;
            break;
          case 'TransactionDate':
            paymentDetails.transactionDate = item.Value;
            break;
          case 'PhoneNumber':
            paymentDetails.phoneNumber = item.Value;
            break;
        }
      });

      console.log('Payment successful:', paymentDetails);

      // Update order status in database
      try {
        const updatedOrders = await db
          .update(orders)
          .set({
            paymentStatus: 'completed',
            transactionId: paymentDetails.mpesaReceiptNumber,
            updatedAt: new Date()
          })
          .where(eq(orders.checkoutRequestId, CheckoutRequestID))
          .returning();

        if (updatedOrders.length > 0) {
          console.log('Order updated successfully:', updatedOrders[0].orderNumber);
        } else {
          console.warn('No order found with CheckoutRequestID:', CheckoutRequestID);
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }

    } else {
      // Payment failed
      console.log('Payment failed:', ResultDesc);

      // Update order status to failed
      try {
        await db
          .update(orders)
          .set({
            paymentStatus: 'failed',
            updatedAt: new Date()
          })
          .where(eq(orders.checkoutRequestId, CheckoutRequestID));
      } catch (dbError) {
        console.error('Database update error for failed payment:', dbError);
      }
    }

    // Always respond with success to M-Pesa (important!)
    return NextResponse.json({ 
      ResultCode: 0,
      ResultDesc: "Callback processed successfully" 
    });

  } catch (error) {
    console.error('M-Pesa Callback Error:', error);
    
    // Still respond with success to avoid M-Pesa retries
    return NextResponse.json({ 
      ResultCode: 0,
      ResultDesc: "Callback processed" 
    });
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({ 
    message: 'M-Pesa callback endpoint is active',
    timestamp: new Date().toISOString()
  });
}
