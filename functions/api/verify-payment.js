/**
 * Cloudflare Pages Function: /api/verify-payment
 * 100% FREE Serverless Endpoint for Cashfree Payment Verification
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
    const { orderId } = body || {};

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'orderId is required' }), {
        status: 400,
        headers: corsHeaders()
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
        headers: corsHeaders()
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
        headers: corsHeaders()
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
      headers: corsHeaders()
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}
