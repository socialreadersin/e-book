/**
 * Cloudflare Pages Function: /api/create-order
 * 100% Serverless Endpoint for Cashfree Order Creation with Server-Side Firestore Price Verification
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

// Cached access token in worker memory to minimize auth roundtrips
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

async function fetchBookFromFirestore(bookId, env) {
  const sa = parseServiceAccount(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const projectId = (sa && sa.project_id) || env.FIREBASE_PROJECT_ID || 'e-book-7c31a';

  const headers = { 'Content-Type': 'application/json' };
  let authQuery = '';

  if (sa) {
    const token = await getGoogleAccessToken(sa);
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Fallback to API key if service account is not yet configured
    const apiKey = env.FIREBASE_API_KEY || '';
    if (apiKey) {
      authQuery = `?key=${encodeURIComponent(apiKey)}`;
    }
  }

  // 1. Query books collection
  let res = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/books/${encodeURIComponent(bookId)}${authQuery}`,
    { headers }
  );

  // 2. Query content collection fallback
  if (res.status === 404) {
    res = await fetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/content/${encodeURIComponent(bookId)}${authQuery}`,
      { headers }
    );
  }

  if (!res.ok) {
    if (res.status === 404) return null;
    const errBody = await res.text();
    console.error(`Firestore fetch error for bookId ${bookId}: ${res.status} - ${errBody}`);
    return null;
  }

  const doc = await res.json();
  return parseFirestoreDoc(doc);
}

// ─── Cloudflare Pages Function Entrypoint ────────────────────────────────────

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { bookId, format, buyerName, buyerEmail, userId } = body || {};

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

    // 1. Fetch real book document from Firestore server-side
    const book = await fetchBookFromFirestore(bookId, env);

    // 2. If book does not exist or status !== 'published', return 404 error
    if (!book || book.status !== 'published') {
      return new Response(JSON.stringify({
        error: 'Book not found in catalog or is not currently available for purchase.'
      }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // 3. Server-side price calculation based on requested format (never trust client amount)
    let amount = 0;
    const priceEbook = Number(book.priceEbook) || Number(book.price) || 0;
    const priceAudio = Number(book.priceAudiobook) || 0;

    if (format === 'audiobook') {
      if (!priceAudio) {
        return new Response(JSON.stringify({ error: 'Audiobook format is not available for this title.' }), {
          status: 400,
          headers: corsHeaders()
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
          headers: corsHeaders()
        });
      }
      amount = priceEbook;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Valid price for this title was not found in catalog.' }), {
        status: 400,
        headers: corsHeaders()
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
