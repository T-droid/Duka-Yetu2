const BASE_URL = process.env.NEXT_PUBLIC_MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

const getToken = async () => {
  const consumerKey = process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  try {
    // const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    //   headers: {
    //     Authorization: `Basic ${auth}`,
    //   },
    // });

    const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error fetching token:', error);
    throw error;
  }
};
const initiateSTKPush = async (amount, phoneNumber, accountReference, transactionDesc) => {
  const token = await getToken();
  const shortcode = process.env.NEXT_PUBLIC_MPESA_SHORTCODE;
  const passkey = process.env.NEXT_PUBLIC_MPESA_PASSKEY;
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: amount,
    PartyA: phoneNumber,
    PartyB: shortcode,
    PhoneNumber: phoneNumber,
    CallBackURL: process.env.NEXT_PUBLIC_BASE_URL ? 
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/mpesa/callback` : 
      'https://your-app.vercel.app/api/mpesa/callback',
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };
  try {
    // const response = await axios.post(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, payload, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // });

    const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initiating STK Push:', error);
    throw error;
  }
};
export { initiateSTKPush };