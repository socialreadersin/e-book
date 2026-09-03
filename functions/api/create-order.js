/**
 * Cloudflare Pages Function: /api/create-order
 * 100% FREE Serverless Endpoint for Cashfree Order Creation
 */

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { bookId, format, buyerName, buyerEmail, userId, amount: clientAmount } = body || {};

    if (!bookId) {
      return new Response(JSON.stringify({ error: 'bookId is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Resolve environment & credentials from Cloudflare Pages Environment Variables
    const cfEnv = (env.CASHFREE_ENVIRONMENT || 'sandbox').toLowerCase();
    const appId = env.CASHFREE_APP_ID || '';
    const secretKey = env.CASHFREE_SECRET_KEY || '';

    if (!appId || !secretKey) {
      return new Response(JSON.stringify({
        error: 'Cashfree credentials are not configured in Cloudflare Environment Variables.'
      }), {
        status: 500,
        headers: corsHeaders()
      });
    }

    const baseUrl = cfEnv === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    // Base book prices lookup table (server-verified fallback)
    const bookPrices = {
      b1: { ebook: 149, audiobook: 199, title: 'Atomic Habits' },
      b2: { ebook: 139, audiobook: null, title: 'Ikigai' },
      b3: { ebook: 149, audiobook: null, title: 'Wings of Fire' },
      b4: { ebook: 199, audiobook: 249, title: 'Rich Dad Poor Dad' },
      b5: { ebook: 129, audiobook: 179, title: 'You Can Win' },
      b6: { ebook: 169, audiobook: 229, title: 'Ikigai (Audio)' },
      b7: { ebook: 189, audiobook: null, title: 'Deep Work' },
      b8: { ebook: 199, audiobook: 249, title: 'The Psychology of Money' }
    };

    let amount = 149;
    const bInfo = bookPrices[bookId];
    if (bInfo) {
      if (format === 'audiobook' && bInfo.audiobook) {
        amount = bInfo.audiobook;
      } else if (format === 'both' && bInfo.audiobook && bInfo.ebook) {
        amount = Math.round((bInfo.ebook + bInfo.audiobook) * 0.85); // 15% discount
      } else {
        amount = bInfo.ebook || 149;
      }
    } else if (clientAmount && Number(clientAmount) > 0) {
      amount = Number(clientAmount);
    }

    const orderId = `sr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanEmail = (buyerEmail || 'customer@socialreaders.in').trim().toLowerCase();
    const cleanName = (buyerName || 'Customer').trim();

    const orderPayload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId || `cust_${Date.now()}`,
        customer_email: cleanEmail,
        customer_name: cleanName,
        customer_phone: '9999999999'
      },
      order_meta: {
        return_url: `https://socialreaders.in/account.html?order_id={order_id}&payment=success`
      },
      order_tags: {
        book_id: bookId,
        format: format || 'ebook',
        buyer_email: cleanEmail
      }
    };

    const cfRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      },
      body: JSON.stringify(orderPayload)
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok || !cfData.payment_session_id) {
      const msg = cfData.message || cfData.error || 'Failed to create Cashfree order session';
      return new Response(JSON.stringify({ error: msg, details: cfData }), {
        status: cfRes.status || 500,
        headers: corsHeaders()
      });
    }

    return new Response(JSON.stringify({
      orderId: cfData.order_id || orderId,
      paymentSessionId: cfData.payment_session_id,
      amount: amount,
      currency: 'INR'
    }), {
      status: 200,
      headers: corsHeaders()
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}
