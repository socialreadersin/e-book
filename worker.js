/**
 * Cloudflare Worker: Social Readers Core API & Asset Gateway
 * Handles:
 *  1. POST /api/create-order   -> Cashfree Order Creation (returns paymentSessionId)
 *  2. POST /api/verify-payment -> Cashfree Payment Status Verification
 *  3. Static Assets            -> env.ASSETS.fetch(request)
 */

function corsHeaders(origin = '*') {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-version, x-client-id, x-client-secret',
    'Content-Type': 'application/json'
  };
}

// Fallback pricing table
const BOOK_PRICES = {
  b1: { ebook: 149, audiobook: 199, title: 'Atomic Habits' },
  b2: { ebook: 139, audiobook: null, title: 'Ikigai' },
  b3: { ebook: 149, audiobook: null, title: 'Wings of Fire' },
  b4: { ebook: 199, audiobook: 249, title: 'Rich Dad Poor Dad' },
  b5: { ebook: 129, audiobook: 179, title: 'You Can Win' },
  b6: { ebook: 169, audiobook: 229, title: 'Ikigai (Audio)' },
  b7: { ebook: 189, audiobook: null, title: 'Deep Work' },
  b8: { ebook: 199, audiobook: 249, title: 'The Psychology of Money' }
};

async function handleCreateOrder(request, env) {
  const origin = request.headers.get('Origin') || '*';

  try {
    const body = await request.json();
    const { bookId, format, buyerName, buyerEmail, userId, amount: clientAmount } = body || {};

    if (!bookId) {
      return new Response(JSON.stringify({ error: 'bookId is required' }), {
        status: 400,
        headers: corsHeaders(origin)
      });
    }

    const cfEnv = (env.CASHFREE_ENVIRONMENT || 'sandbox').toLowerCase();
    const appId = env.CASHFREE_APP_ID || '';
    const secretKey = env.CASHFREE_SECRET_KEY || '';

    if (!appId || !secretKey) {
      return new Response(JSON.stringify({
        error: 'Cashfree credentials are not configured in Cloudflare Environment Variables.'
      }), {
        status: 500,
        headers: corsHeaders(origin)
      });
    }

    const baseUrl = cfEnv === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    let amount = 149;
    const bInfo = BOOK_PRICES[bookId];
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
        headers: corsHeaders(origin)
      });
    }

    return new Response(JSON.stringify({
      orderId: cfData.order_id || orderId,
      paymentSessionId: cfData.payment_session_id,
      amount: amount,
      currency: 'INR'
    }), {
      status: 200,
      headers: corsHeaders(origin)
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders(origin)
    });
  }
}

async function handleVerifyPayment(request, env) {
  const origin = request.headers.get('Origin') || '*';

  try {
    const body = await request.json();
    const { orderId } = body || {};

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400,
        headers: corsHeaders(origin)
      });
    }

    const cfEnv = (env.CASHFREE_ENVIRONMENT || 'sandbox').toLowerCase();
    const appId = env.CASHFREE_APP_ID || '';
    const secretKey = env.CASHFREE_SECRET_KEY || '';

    if (!appId || !secretKey) {
      return new Response(JSON.stringify({
        error: 'Cashfree credentials are not configured in Cloudflare Environment Variables.'
      }), {
        status: 500,
        headers: corsHeaders(origin)
      });
    }

    const baseUrl = cfEnv === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const cfRes = await fetch(`${baseUrl}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-api-version': '2023-08-01',
        'x-client-id': appId,
        'x-client-secret': secretKey
      }
    });

    const cfData = await cfRes.json();

    if (!cfRes.ok) {
      return new Response(JSON.stringify({
        error: cfData.message || 'Verification request to Cashfree failed',
        details: cfData
      }), {
        status: cfRes.status || 500,
        headers: corsHeaders(origin)
      });
    }

    const orderStatus = cfData.order_status;
    const isPaid = orderStatus === 'PAID';

    return new Response(JSON.stringify({
      success: isPaid,
      status: orderStatus,
      order: cfData
    }), {
      status: 200,
      headers: corsHeaders(origin)
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders(origin)
    });
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '*';

    // Handle CORS preflight for all /api/ endpoints
    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/')) {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin)
      });
    }

    // Cashfree Payment API Endpoints
    if (url.pathname === '/api/create-order' || url.pathname === '/api/create-order/') {
      if (request.method === 'POST') {
        return handleCreateOrder(request, env);
      }
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: corsHeaders(origin)
      });
    }

    if (url.pathname === '/api/verify-payment' || url.pathname === '/api/verify-payment/') {
      if (request.method === 'POST') {
        return handleVerifyPayment(request, env);
      }
      return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
        status: 405,
        headers: corsHeaders(origin)
      });
    }

    // Pass through to Static Assets
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response('Resource Not Found', { status: 404 });
  }
};
