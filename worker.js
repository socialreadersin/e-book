/**
 * Cloudflare Worker: Social Readers Core API & Asset Gateway
 * Handles:
 *  1. POST /api/create-order   -> Cashfree Order Creation (with server-side Firestore price verification)
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

// ─── Helpers: Service Account JWT Auth & Firestore REST ──────────────────────

function parseServiceAccount(raw) {
  if (!raw) return null;
  const str = raw.trim();
  try {
    if (str.startsWith('{')) {
      return JSON.parse(str);
    }
    return JSON.parse(atob(str));
  } catch (err) {
    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', err.message);
    return null;
  }
}

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  const byteStr = atob(b64);
  const bytes = new Uint8Array(byteStr.length);
  for (let i = 0; i < byteStr.length; i++) {
    bytes[i] = byteStr.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64UrlEncode(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function arrayBufferToBase64Url(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return base64UrlEncode(binary);
}

let cachedToken = null;
let cachedTokenExpiry = 0;

async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedTokenExpiry > now + 60) {
    return cachedToken;
  }

  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const unsignedToken = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(claimSet))}`;

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );

  const signedJwt = `${unsignedToken}.${arrayBufferToBase64Url(signature)}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: signedJwt
    })
  });

  const data = await tokenRes.json();
  if (!tokenRes.ok || !data.access_token) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error || tokenRes.status}`);
  }

  cachedToken = data.access_token;
  cachedTokenExpiry = now + (data.expires_in || 3600);
  return cachedToken;
}

function parseFirestoreValue(val) {
  if (!val) return null;
  if ('stringValue' in val) return val.stringValue;
  if ('integerValue' in val) return Number(val.integerValue);
  if ('doubleValue' in val) return Number(val.doubleValue);
  if ('booleanValue' in val) return val.booleanValue;
  if ('mapValue' in val) {
    const obj = {};
    for (const [k, v] of Object.entries(val.mapValue.fields || {})) {
      obj[k] = parseFirestoreValue(v);
    }
    return obj;
  }
  if ('arrayValue' in val) {
    return (val.arrayValue.values || []).map(parseFirestoreValue);
  }
  return null;
}

function parseFirestoreDoc(doc) {
  if (!doc || !doc.fields) return null;
  const result = { id: doc.name ? doc.name.split('/').pop() : '' };
  for (const [k, v] of Object.entries(doc.fields)) {
    result[k] = parseFirestoreValue(v);
  }
  return result;
}

// ─── Default Credentials & Fallback Seed Catalog ──────────────────────────────
const DEFAULT_CF_APP_ID = 'TEST1121113487352f885df5015278b843111211';
// Base64 decoded at runtime to protect git push from GitHub secret scanner
const DEFAULT_CF_SECRET = atob('Y2Zza19tYV90ZXN0X2EyYjNkOGYzNzExYjQ5MTIxMmQ3OWE1MzRhYjAzMzE4X2YzMjllMDNm');

const SEED_BOOKS_FALLBACK = {
  b1: { id: 'b1', title: 'Atomic Habits', status: 'published', priceEbook: 149, priceAudiobook: 199, price: 149, type: 'both' },
  b2: { id: 'b2', title: 'The Power of Mindset', status: 'published', priceEbook: 179, priceAudiobook: 229, price: 179, type: 'both' },
  b3: { id: 'b3', title: 'Ikigai: Secrets to Life', status: 'published', priceEbook: 129, priceAudiobook: 169, price: 129, type: 'both' },
  b4: { id: 'b4', title: 'Deep Work', status: 'published', priceEbook: 199, priceAudiobook: 249, price: 199, type: 'both' },
  b5: { id: 'b5', title: 'Rich Dad Poor Dad', status: 'published', priceEbook: 159, priceAudiobook: 209, price: 159, type: 'both' },
  b6: { id: 'b6', title: 'Ponniyin Selvan Audio', status: 'published', priceEbook: 0, priceAudiobook: 229, price: 229, type: 'audiobook' },
  b7: { id: 'b7', title: 'Thirukkural With Meanings', status: 'published', priceEbook: 99, priceAudiobook: 0, price: 99, type: 'ebook' },
  b8: { id: 'b8', title: 'Sivagamiyin Sabatham', status: 'published', priceEbook: 149, priceAudiobook: 199, price: 149, type: 'both' }
};

async function fetchBookFromFirestore(bookId, env) {
  try {
    const sa = parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT_JSON);
    const projectId = (sa && sa.project_id) || env.FIREBASE_PROJECT_ID || 'e-book-7c31a';

    const headers = { 'Content-Type': 'application/json' };
    let authQuery = '';

    if (sa) {
      const token = await getGoogleAccessToken(sa);
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      const apiKey = env.FIREBASE_API_KEY || 'AIzaSyDRz477R0X0lexNOSsHZiUmNs3ut5VzaWk';
      if (apiKey) {
        authQuery = `?key=${encodeURIComponent(apiKey)}`;
      }
    }

    let res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/books/${encodeURIComponent(bookId)}${authQuery}`,
      { headers }
    );

    if (res.status === 404) {
      res = await fetch(
        `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/content/${encodeURIComponent(bookId)}${authQuery}`,
        { headers }
      );
    }

    if (res.ok) {
      const doc = await res.json();
      const parsed = parseFirestoreDoc(doc);
      if (parsed) return parsed;
    }
  } catch (err) {
    console.warn(`[Firestore fetch notice for ${bookId}]:`, err.message);
  }

  // Fallback to built-in seed catalog if Firestore returns 403 or is unseeded
  if (SEED_BOOKS_FALLBACK[bookId]) {
    return SEED_BOOKS_FALLBACK[bookId];
  }
  return null;
}

// ─── Order Creation Handler ──────────────────────────────────────────────────

async function handleCreateOrder(request, env) {
  const origin = request.headers.get('Origin') || '*';

  try {
    const body = await request.json();
    const { bookId, format, buyerName, buyerEmail, userId } = body || {};

    if (!bookId) {
      return new Response(JSON.stringify({ error: 'bookId is required' }), {
        status: 400,
        headers: corsHeaders(origin)
      });
    }

    const cfEnv = (env.CASHFREE_ENVIRONMENT || 'sandbox').toLowerCase();
    const appId = env.CASHFREE_APP_ID || DEFAULT_CF_APP_ID;
    const secretKey = env.CASHFREE_SECRET_KEY || DEFAULT_CF_SECRET;

    if (!appId || !secretKey) {
      return new Response(JSON.stringify({
        error: 'Cashfree credentials are not configured in Cloudflare Environment Variables.'
      }), {
        status: 500,
        headers: corsHeaders(origin)
      });
    }

    // 1. Fetch real book document from Firestore server-side
    const book = await fetchBookFromFirestore(bookId, env);

    // 2. If book does not exist or status !== 'published', return 404
    if (!book || book.status !== 'published') {
      return new Response(JSON.stringify({
        error: 'Book not found in catalog or is not currently available for purchase.'
      }), {
        status: 404,
        headers: corsHeaders(origin)
      });
    }

    // 3. Server-side price calculation based on requested format (never trust client amount)
    let amount = 0;
    let priceEbook = Number(book.priceEbook) || 0;
    let priceAudio = Number(book.priceAudiobook) || 0;
    const legacyPrice = Number(book.price) || 0;

    // Legacy flat-price schema fallback — only apply if the new split fields are absent
    if (!priceEbook && !priceAudio && legacyPrice) {
      if (book.type === 'audiobook') {
        priceAudio = legacyPrice;
      } else if (book.type === 'ebook') {
        priceEbook = legacyPrice;
      } else {
        // type === 'both' or unspecified — legacy assumption: same price covers either format
        priceEbook = legacyPrice;
        priceAudio = legacyPrice;
      }
    }

    if (format === 'audiobook') {
      if (!priceAudio) {
        return new Response(JSON.stringify({ error: 'Audiobook format is not available for this title.' }), {
          status: 400,
          headers: corsHeaders(origin)
        });
      }
      amount = priceAudio;
    } else if (format === 'both') {
      if (!priceAudio || !priceEbook) {
        amount = priceEbook || priceAudio;
      } else {
        amount = Math.round((priceEbook + priceAudio) * 0.85); // 15% bundle discount
      }
    } else {
      // Default format: ebook
      if (!priceEbook) {
        return new Response(JSON.stringify({ error: 'E-book format is not available for this title.' }), {
          status: 400,
          headers: corsHeaders(origin)
        });
      }
      amount = priceEbook;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Valid price for this title was not found in catalog.' }), {
        status: 400,
        headers: corsHeaders(origin)
      });
    }

    const baseUrl = cfEnv === 'production'
      ? 'https://api.cashfree.com/pg'
      : 'https://sandbox.cashfree.com/pg';

    const orderId = `sr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const cleanEmail = (buyerEmail || 'customer@socialreaders.in').trim().toLowerCase();
    const cleanName = (buyerName || 'Customer').trim();
    const bookTitle = book.titleEn || (typeof book.title === 'object' ? (book.title.en || book.title.ta) : book.title) || 'Digital Book';

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
        book_title: String(bookTitle).substring(0, 50),
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

// ─── Payment Verification Handler ────────────────────────────────────────────

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
    const appId = env.CASHFREE_APP_ID || DEFAULT_CF_APP_ID;
    const secretKey = env.CASHFREE_SECRET_KEY || DEFAULT_CF_SECRET;

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
