import { NextRequest, NextResponse } from 'next/server';
import { initiateSTKPush } from '@/utils/mpesa';

export async function POST(request: NextRequest) {
  try {
    const { phone, amount, orderDetails } = await request.json();

    // Validate request data
    if (!phone || !amount || !orderDetails) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate phone number format
    const cleanPhone = phone.replace(/\s/g, '');
    if (!/^254\d{9}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, message: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    console.log('Initiating M-Pesa STK Push:', {
      phone: cleanPhone,
      amount: numAmount,
      orderDetails
    });

    // Generate account reference from order details
    const accountReference = `ORDER-${Date.now()}`;
    const transactionDesc = `Payment for Duka Yetu Order`;

    // Initiate real STK Push using your mpesa utility
    const mpesaResponse = await initiateSTKPush(
      numAmount,
      cleanPhone,
      accountReference,
      transactionDesc
    );

    console.log('M-Pesa Response:', mpesaResponse);

    // Check if the STK Push was successful
    if (mpesaResponse.ResponseCode === "0") {
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      // Log order details for debugging
      console.log('Order Details:', {
        transactionId,
        phone: cleanPhone,
        amount: numAmount,
        orderDetails,
        mpesaRequestId: mpesaResponse.MerchantRequestID,
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        status: 'pending',
        createdAt: new Date()
      });
      
      return NextResponse.json({
        success: true,
        message: mpesaResponse.CustomerMessage || 'STK Push sent successfully. Please check your phone to complete the payment.',
        transactionId,
        checkoutRequestId: mpesaResponse.CheckoutRequestID,
        merchantRequestId: mpesaResponse.MerchantRequestID
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: mpesaResponse.ResponseDescription || 'Failed to send STK Push. Please try again.',
          code: mpesaResponse.ResponseCode
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('M-Pesa STK Push Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Example of what a real M-Pesa integration would look like:
/*
async function initiateSTKPush(phone: string, amount: number, accountReference: string) {
  // 1. Get OAuth token from Safaricom
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
  
  const tokenResponse = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': `Basic ${auth}`
    }
  });
  
  const { access_token } = await tokenResponse.json();
  
  // 2. Generate timestamp and password
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
  const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString('base64');
  
  // 3. Send STK Push request
  const stkResponse = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      BusinessShortCode: process.env.MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: process.env.MPESA_SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback`,
      AccountReference: accountReference,
      TransactionDesc: "Payment for HostelCart Order"
    })
  });
  
  return await stkResponse.json();
}
*/
