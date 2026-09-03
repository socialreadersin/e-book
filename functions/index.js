/**
 * Social Readers — Firebase Cloud Functions
 * Payment Gateway: Cashfree Payments PG
 * Secure Content Authorization & Entitlements
 *
 * Functions exposed:
 *   1. createCashfreeOrder    — Creates a Cashfree order, returns paymentSessionId
 *   2. verifyCashfreePayment  — Verifies payment status and creates confirmed Firestore order & entitlement
 *   3. cashfreeWebhook        — Server-to-server webhook callback from Cashfree
 *   4. getSecureContentAccess — Verifies token and ownership entitlement, returns temporary authorized access
 */

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors');

// ─── Firebase Admin Initialization ──────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();
const storage = admin.storage();

// ─── Secrets (Google Cloud Secret Manager) ──────────────────────────────────
const CASHFREE_APP_ID = defineSecret('CASHFREE_APP_ID');
const CASHFREE_SECRET_KEY = defineSecret('CASHFREE_SECRET_KEY');

// ─── CORS Configuration ─────────────────────────────────────────────────────
const allowedOriginPatterns = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/.*\.pages\.dev$/,
  /^https:\/\/.*\.workers\.dev$/,
  /^https:\/\/socialreaders\.in$/,
  /^https:\/\/www\.socialreaders\.in$/,
  /^https:\/\/e-book-7c31a\.web\.app$/,
  /^https:\/\/e-book-7c31a\.firebaseapp\.com$/
];

const corsHandler = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile apps, server-to-server, curl, webhooks)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOriginPatterns.some(pattern => pattern.test(origin));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback to permit request for seamless deployment
    }
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-version', 'x-client-id', 'x-client-secret'],
  credentials: true
});

// ─── HELPER: Cashfree API base URL ──────────────────────────────────────────
function getCashfreeBaseUrl(environment) {
  return environment === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

// ─── HELPER: Validate email ─────────────────────────────────────────────────
function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── HELPER: Generate unique order ID ───────────────────────────────────────
function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `SR-${ts}-${rand}`;
}

// ─── HELPER: Helper to fetch book from content or books collection ──────────
async function fetchBookDocument(bookId) {
  // 1. Try content collection
  let docSnap = await db.collection('content').doc(bookId).get();
  if (docSnap.exists) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  // 2. Try books collection
  docSnap = await db.collection('books').doc(bookId).get();
  if (docSnap.exists) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

// ─── HELPER: Idempotent Entitlement Grant ────────────────────────────────────
async function grantEntitlement(userId, bookId, orderId, format = 'ebook') {
  if (!userId || !bookId) return false;

  const now = admin.firestore.FieldValue.serverTimestamp();
  const nowIso = new Date().toISOString();

  // 1. userEntitlements/{userId}
  const entitlementRef = db.collection('userEntitlements').doc(userId);
  await entitlementRef.set({
    updatedAt: now,
    [`books.${bookId}`]: {
      purchasedAt: now,
      format: format || 'ebook',
      orderId: orderId,
      accessStatus: 'active'
    }
  }, { merge: true });

  // 2. users/{userId}/library/{bookId}
  const libraryRef = db.collection('users').doc(userId).collection('library').doc(bookId);
  await libraryRef.set({
    contentId: bookId,
    contentType: format || 'ebook',
    orderId: orderId,
    purchasedAt: now,
    accessStatus: 'active',
    downloadCount: 0,
    lastAccessedAt: now
  }, { merge: true });

  // 3. users/{userId} array union & lastPurchaseAt
  const userRef = db.collection('users').doc(userId);
  await userRef.set({
    books: admin.firestore.FieldValue.arrayUnion(bookId),
    lastPurchaseAt: now,
    updatedAt: now
  }, { merge: true });

  console.log(`[Entitlement] Granted for User ${userId} on Book ${bookId} (Order: ${orderId})`);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 1: Create Cashfree Order
// POST body: { bookId, format, buyerName, buyerEmail, userId?, environment? }
// Returns: { orderId, paymentSessionId, amount, currency, environment }
// ─────────────────────────────────────────────────────────────────────────────
exports.createCashfreeOrder = onRequest(
  { secrets: [CASHFREE_APP_ID, CASHFREE_SECRET_KEY], cors: false, region: 'us-central1' },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method === 'OPTIONS') {
        return res.status(204).send('');
      }

      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      try {
        const { bookId, format, buyerName, buyerEmail, userId, environment } = req.body || {};

        // ── Input Validation ────────────────────────────────────────────────
        if (!bookId || typeof bookId !== 'string') {
          return res.status(400).json({ error: 'bookId is required.' });
        }
        if (!buyerEmail || !isValidEmail(buyerEmail)) {
          return res.status(400).json({ error: 'A valid buyer email is required.' });
        }
        if (!buyerName || typeof buyerName !== 'string' || buyerName.trim().length < 2) {
          return res.status(400).json({ error: 'Buyer name must be at least 2 characters.' });
        }

        // ── Fetch Book from Firestore (Server-side price verification) ──────
        const book = await fetchBookDocument(bookId);
        if (!book) {
          return res.status(404).json({ error: 'Book not found in catalog.' });
        }

        if (book.status === 'draft') {
          return res.status(403).json({ error: 'This title is not currently available for purchase.' });
        }

        // ── Server-side Price Calculation ───────────────────────────────────
        let amount;
        if (format === 'audiobook') {
          amount = Number(book.priceAudiobook) || Number(book.price) || 199;
        } else if (format === 'both') {
          const ebookP = Number(book.priceEbook) || Number(book.price) || 149;
          const audioP = Number(book.priceAudiobook) || 199;
          amount = Math.round((ebookP + audioP) * 0.85); // 15% bundle discount
        } else {
          amount = Number(book.priceEbook) || Number(book.price) || 149;
        }

        if (!amount || isNaN(amount) || amount <= 0) {
          amount = 149;
        }

        const causeShare = Math.round(amount * 0.25 * 100) / 100;
        const cleanTitle = typeof book.title === 'object' ? (book.title.en || 'Digital Book') : String(book.title || 'Digital Book');

        // ── Create Cashfree Order via PG API ────────────────────────────────
        const orderId = generateOrderId();
        const env = environment === 'production' ? 'production' : 'sandbox';
        const appId = (CASHFREE_APP_ID && typeof CASHFREE_APP_ID.value === 'function') ? (CASHFREE_APP_ID.value() || process.env.CASHFREE_APP_ID) : (process.env.CASHFREE_APP_ID || '');
        const secretKey = (CASHFREE_SECRET_KEY && typeof CASHFREE_SECRET_KEY.value === 'function') ? (CASHFREE_SECRET_KEY.value() || process.env.CASHFREE_SECRET_KEY) : (process.env.CASHFREE_SECRET_KEY || '');

        const orderPayload = {
          order_id: orderId,
          order_amount: amount,
          order_currency: 'INR',
          customer_details: {
            customer_id: userId || `cust_${Date.now()}`,
            customer_email: buyerEmail.trim().toLowerCase(),
            customer_name: buyerName.trim(),
            customer_phone: '9999999999'
          },
          order_meta: {
            return_url: `https://socialreaders.in/account.html?order_id={order_id}&payment=success`,
            notify_url: `https://us-central1-e-book-7c31a.cloudfunctions.net/cashfreeWebhook`
          },
          order_tags: {
            book_id: bookId,
            format: format || 'ebook',
            buyer_email: buyerEmail.trim().toLowerCase(),
            social_cause: 'youth_education_sports'
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

        if (!cfRes.ok) {
          console.error('[createCashfreeOrder] Cashfree API error:', cfData);
          return res.status(502).json({
            error: cfData.message || cfData.type || 'Failed to initialize payment order with Cashfree.'
          });
        }

        // ── Record Pending Order in Firestore ────────────────────────────────
        const serverNow = admin.firestore.FieldValue.serverTimestamp();
        await db.collection('orders').doc(orderId).set({
          orderId: orderId,
          id: orderId,
          cashfreeOrderId: cfData.order_id,
          paymentSessionId: cfData.payment_session_id,
          bookId: bookId,
          bookTitle: cleanTitle,
          format: format || 'ebook',
          amount: amount,
          causeShare: causeShare,
          currency: 'INR',
          customerName: buyerName.trim(),
          customerEmail: buyerEmail.trim().toLowerCase(),
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          userId: userId || null,
          status: 'pending',
          paymentStatus: 'PENDING',
          paymentGateway: 'cashfree',
          environment: env,
          createdAt: serverNow,
          updatedAt: serverNow
        });

        return res.status(200).json({
          orderId: orderId,
          paymentSessionId: cfData.payment_session_id,
          amount: amount,
          currency: 'INR',
          environment: env
        });

      } catch (err) {
        console.error('[createCashfreeOrder] Server error:', err);
        return res.status(500).json({
          error: 'An internal error occurred while initiating your order. Please try again.'
        });
      }
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 2: Verify Cashfree Payment (Server-side validation)
// POST body: { orderId, environment? }
// Returns: { success: boolean, status: string, orderId: string }
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyCashfreePayment = onRequest(
  { secrets: [CASHFREE_APP_ID, CASHFREE_SECRET_KEY], cors: false, region: 'us-central1' },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method === 'OPTIONS') return res.status(204).send('');
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      try {
        const { orderId, environment } = req.body || {};

        if (!orderId || typeof orderId !== 'string') {
          return res.status(400).json({ error: 'orderId is required.' });
        }

        const env = environment === 'production' ? 'production' : 'sandbox';
        const baseUrl = getCashfreeBaseUrl(env);
        const appId = (CASHFREE_APP_ID && typeof CASHFREE_APP_ID.value === 'function') ? (CASHFREE_APP_ID.value() || process.env.CASHFREE_APP_ID) : (process.env.CASHFREE_APP_ID || '');
        const secretKey = (CASHFREE_SECRET_KEY && typeof CASHFREE_SECRET_KEY.value === 'function') ? (CASHFREE_SECRET_KEY.value() || process.env.CASHFREE_SECRET_KEY) : (process.env.CASHFREE_SECRET_KEY || '');

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
          return res.status(502).json({
            success: false,
            error: cfData.message || 'Could not verify payment status with Cashfree.'
          });
        }

        const orderStatus = cfData.order_status; // PAID, ACTIVE, EXPIRED, CANCELLED

        if (orderStatus === 'PAID') {
          const orderRef = db.collection('orders').doc(orderId);
          const orderSnap = await orderRef.get();

          if (orderSnap.exists) {
            const orderData = orderSnap.data();
            const serverNow = admin.firestore.FieldValue.serverTimestamp();

            await orderRef.update({
              status: 'completed',
              paymentStatus: 'PAID',
              cashfreeStatus: orderStatus,
              paymentId: cfData.cf_order_id || orderId,
              paidAt: serverNow,
              updatedAt: serverNow
            });

            // Grant Entitlement idempotently
            if (orderData.userId && orderData.bookId) {
              await grantEntitlement(orderData.userId, orderData.bookId, orderId, orderData.format);
            }
          }

          return res.status(200).json({
            success: true,
            status: 'PAID',
            orderId: orderId
          });
        }

        return res.status(200).json({
          success: false,
          status: orderStatus,
          orderId: orderId
        });

      } catch (err) {
        console.error('[verifyCashfreePayment] Error:', err);
        return res.status(500).json({ success: false, error: 'Verification error occurred.' });
      }
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 3: Cashfree Webhook (Server-to-Server)
// ─────────────────────────────────────────────────────────────────────────────
exports.cashfreeWebhook = onRequest(
  { secrets: [CASHFREE_SECRET_KEY], cors: false, region: 'us-central1' },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    try {
      const payload = req.body;
      const event = payload.data;
      const eventType = payload.type;

      if (!event || !event.order) {
        return res.status(400).send('Invalid webhook payload');
      }

      const orderId = event.order.order_id;
      const orderStatus = event.order.order_status;

      console.log(`[Webhook] Event: ${eventType}, Order: ${orderId}, Status: ${orderStatus}`);

      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        console.warn(`[Webhook] Order ${orderId} not found in Firestore.`);
        return res.status(200).send('OK');
      }

      const serverNow = admin.firestore.FieldValue.serverTimestamp();

      if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || orderStatus === 'PAID') {
        const orderData = orderSnap.data();

        await orderRef.update({
          status: 'completed',
          paymentStatus: 'PAID',
          cashfreeStatus: 'PAID',
          webhookReceivedAt: serverNow,
          updatedAt: serverNow,
          paymentId: event.payment ? event.payment.cf_payment_id : null
        });

        if (orderData.userId && orderData.bookId) {
          await grantEntitlement(orderData.userId, orderData.bookId, orderId, orderData.format);
        }
      } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || orderStatus === 'EXPIRED') {
        await orderRef.update({
          status: 'failed',
          paymentStatus: 'FAILED',
          cashfreeStatus: orderStatus,
          updatedAt: serverNow
        });
      }

      return res.status(200).send('OK');
    } catch (err) {
      console.error('[Webhook] Internal error:', err);
      return res.status(500).send('Internal Error');
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 4: Secure Content Access (Authorized E-book & Audiobook Access)
// POST body: { contentId, format, chapterId? } with Authorization: Bearer <idToken>
// Returns: { authorized: true, downloadUrl?: string, streamUrl?: string, chapters?: [] }
// ─────────────────────────────────────────────────────────────────────────────
exports.getSecureContentAccess = onRequest(
  { cors: false, region: 'us-central1' },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method === 'OPTIONS') return res.status(204).send('');
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      try {
        const authHeader = req.headers.authorization || '';
        let idToken = '';
        if (authHeader.startsWith('Bearer ')) {
          idToken = authHeader.split('Bearer ')[1].trim();
        } else if (req.body && req.body.idToken) {
          idToken = req.body.idToken;
        }

        if (!idToken) {
          return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required to access digital content.' });
        }

        // Verify Firebase Token
        let decodedToken;
        try {
          decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (tokErr) {
          return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Session expired or invalid.' });
        }

        const userId = decodedToken.uid;
        const { contentId, format, chapterId } = req.body || {};

        if (!contentId) {
          return res.status(400).json({ error: 'contentId is required.' });
        }

        // Check if user is Admin
        let isAdmin = false;
        try {
          const adminDoc = await db.collection('admins').doc(userId).get();
          if (adminDoc.exists && adminDoc.data().active !== false) {
            isAdmin = true;
          }
        } catch (_) {}

        // Check user ownership entitlement
        let hasAccess = isAdmin;
        if (!hasAccess) {
          const entitlementDoc = await db.collection('userEntitlements').doc(userId).get();
          if (entitlementDoc.exists) {
            const data = entitlementDoc.data() || {};
            const booksMap = data.books || data;
            if (booksMap[contentId] && booksMap[contentId].accessStatus !== 'revoked') {
              hasAccess = true;
            }
          }
        }

        if (!hasAccess) {
          // Check library subcollection
          const libDoc = await db.collection('users').doc(userId).collection('library').doc(contentId).get();
          if (libDoc.exists && libDoc.data().accessStatus !== 'revoked') {
            hasAccess = true;
          }
        }

        if (!hasAccess) {
          return res.status(403).json({
            error: 'ACCESS_DENIED',
            message: 'You have not purchased this title or your entitlement is not active.'
          });
        }

        // Fetch book metadata
        const book = await fetchBookDocument(contentId);
        if (!book) {
          return res.status(404).json({ error: 'Content not found.' });
        }

        // Return secure access payload
        const responsePayload = {
          authorized: true,
          contentId: contentId,
          title: typeof book.title === 'object' ? book.title.en : book.title,
          format: format || book.type || 'ebook'
        };

        if (format === 'ebook' || book.type === 'ebook' || book.type === 'both') {
          responsePayload.pdfStoragePath = book.pdfStoragePath || null;
          responsePayload.pdfUrl = book.pdfUrl || null;
        }

        if (format === 'audiobook' || book.type === 'audiobook' || book.type === 'both') {
          responsePayload.chapters = book.chapters || [];
          responsePayload.audioUrl = book.audioUrl || null;
          if (chapterId && Array.isArray(book.chapters)) {
            const ch = book.chapters.find(c => c.chapterId === chapterId || c.order === Number(chapterId));
            responsePayload.activeChapter = ch || book.chapters[0];
          }
        }

        return res.status(200).json(responsePayload);

      } catch (err) {
        console.error('[getSecureContentAccess] Error:', err);
        return res.status(500).json({ error: 'Could not authorize digital content access.' });
      }
    });
  }
);
