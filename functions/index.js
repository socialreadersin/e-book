/**
 * Social Readers — Firebase Cloud Functions
 * Payment Gateway: Cashfree Payments PG
 *
 * Functions exposed:
 *   1. createCashfreeOrder   — Creates a Cashfree order, returns paymentSessionId
 *   2. verifyCashfreePayment — Verifies payment status and creates confirmed Firestore order
 *
 * ⚠️  SETUP REQUIRED:
 *     Run these commands to set your Cashfree credentials as Firebase secrets:
 *
 *     firebase functions:secrets:set CASHFREE_APP_ID
 *     firebase functions:secrets:set CASHFREE_SECRET_KEY
 *
 *     Set CASHFREE_ENVIRONMENT to "production" for live payments (default: sandbox)
 *
 * Deploy:
 *     cd functions && npm install
 *     cd .. && firebase deploy --only functions
 */

const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');
const cors = require('cors');

// ─── Firebase Admin Init ───────────────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

// ─── Secrets (stored in Google Cloud Secret Manager — never in code) ──────────
const CASHFREE_APP_ID = defineSecret('CASHFREE_APP_ID');
const CASHFREE_SECRET_KEY = defineSecret('CASHFREE_SECRET_KEY');

// ─── CORS Configuration ────────────────────────────────────────────────────────
// Restrict to your actual domain in production:
const corsHandler = cors({
  origin: [
    'http://localhost:5500',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'https://socialreadersin.pages.dev',
    'https://socialreaders.in',
    'https://www.socialreaders.in',
  ],
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// ─── HELPER: Cashfree API base URL ────────────────────────────────────────────
function getCashfreeBaseUrl(environment) {
  return environment === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

// ─── HELPER: Validate email ───────────────────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── HELPER: Generate unique order ID ─────────────────────────────────────────
function generateOrderId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SR-${ts}-${rand}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 1: Create Cashfree Order
// POST body: { bookId, format, buyerName, buyerEmail, userId?, environment? }
// Returns: { orderId, paymentSessionId, amount, currency }
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
        const { bookId, format, buyerName, buyerEmail, userId, environment } = req.body;

        // ── Input Validation ────────────────────────────────────────────────
        if (!bookId || typeof bookId !== 'string') {
          return res.status(400).json({ error: 'bookId is required.' });
        }
        if (!buyerEmail || !isValidEmail(buyerEmail)) {
          return res.status(400).json({ error: 'A valid buyer email is required.' });
        }
        if (!buyerName || buyerName.trim().length < 2) {
          return res.status(400).json({ error: 'Buyer name must be at least 2 characters.' });
        }

        // ── Fetch Book from Firestore (Server-side price verification) ──────
        const bookDoc = await db.collection('books').doc(bookId).get();
        if (!bookDoc.exists) {
          return res.status(404).json({ error: 'Book not found. It may have been removed from the catalog.' });
        }

        const book = bookDoc.data();
        if (book.status === 'draft') {
          return res.status(403).json({ error: 'This book is not available for purchase.' });
        }

        // ── Server-side Price Calculation (never trust client price) ────────
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

        if (!amount || amount <= 0) {
          return res.status(400).json({ error: 'Invalid book price configuration.' });
        }

        // ── Create Cashfree Order ───────────────────────────────────────────
        const orderId = generateOrderId();
        const env = environment === 'production' ? 'production' : 'sandbox';
        const baseUrl = getCashfreeBaseUrl(env);

        const appId = CASHFREE_APP_ID.value();
        const secretKey = CASHFREE_SECRET_KEY.value();

        const orderPayload = {
          order_id: orderId,
          order_amount: amount,
          order_currency: 'INR',
          customer_details: {
            customer_id: userId || `guest_${Date.now()}`,
            customer_email: buyerEmail.trim().toLowerCase(),
            customer_name: buyerName.trim(),
            customer_phone: '9999999999', // Required by Cashfree; update if collecting phone
          },
          order_meta: {
            return_url: `https://socialreaders.in/payment-return?order_id={order_id}`,
            notify_url: `https://us-central1-e-book-7c31a.cloudfunctions.net/cashfreeWebhook`,
          },
          order_tags: {
            book_id: bookId,
            format: format || 'ebook',
            buyer_email: buyerEmail,
            social_cause: 'youth_education_sports',
          }
        };

        const cfRes = await fetch(`${baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-version': '2023-08-01',
            'x-client-id': appId,
            'x-client-secret': secretKey,
          },
          body: JSON.stringify(orderPayload)
        });

        const cfData = await cfRes.json();

        if (!cfRes.ok) {
          console.error('[createCashfreeOrder] Cashfree error:', cfData);
          return res.status(502).json({
            error: cfData.message || cfData.type || 'Failed to create payment order. Please try again.'
          });
        }

        // ── Save Pending Order in Firestore ─────────────────────────────────
        await db.collection('orders').doc(orderId).set({
          orderId: orderId,
          cashfreeOrderId: cfData.order_id,
          paymentSessionId: cfData.payment_session_id,
          bookId: bookId,
          bookTitle: typeof book.title === 'object' ? (book.title.en || 'Book') : book.title,
          format: format || 'ebook',
          amount: amount,
          causeShare: parseFloat((amount * 0.25).toFixed(2)),
          customerName: buyerName.trim(),
          customerEmail: buyerEmail.trim().toLowerCase(),
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim().toLowerCase(),
          userId: userId || null,
          status: 'pending',
          gateway: 'cashfree',
          environment: env,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // ── Return session ID to frontend ───────────────────────────────────
        return res.status(200).json({
          orderId: orderId,
          paymentSessionId: cfData.payment_session_id,
          amount: amount,
          currency: 'INR',
          environment: env
        });

      } catch (err) {
        console.error('[createCashfreeOrder] Unexpected error:', err);
        return res.status(500).json({
          error: 'An unexpected error occurred. Please try again in a moment.'
        });
      }
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 2: Verify Cashfree Payment
// POST body: { orderId, environment? }
// Returns: { success, status, order? }
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyCashfreePayment = onRequest(
  { secrets: [CASHFREE_APP_ID, CASHFREE_SECRET_KEY], cors: false, region: 'us-central1' },
  async (req, res) => {
    corsHandler(req, res, async () => {
      if (req.method === 'OPTIONS') return res.status(204).send('');
      if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

      try {
        const { orderId, environment } = req.body;

        if (!orderId || typeof orderId !== 'string') {
          return res.status(400).json({ error: 'orderId is required.' });
        }

        const env = environment === 'production' ? 'production' : 'sandbox';
        const baseUrl = getCashfreeBaseUrl(env);
        const appId = CASHFREE_APP_ID.value();
        const secretKey = CASHFREE_SECRET_KEY.value();

        // ── Fetch order status from Cashfree ────────────────────────────────
        const cfRes = await fetch(`${baseUrl}/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'x-api-version': '2023-08-01',
            'x-client-id': appId,
            'x-client-secret': secretKey,
          }
        });

        const cfData = await cfRes.json();

        if (!cfRes.ok) {
          return res.status(502).json({ success: false, error: cfData.message || 'Failed to verify payment.' });
        }

        const orderStatus = cfData.order_status; // PAID, ACTIVE, EXPIRED, CANCELLED

        if (orderStatus === 'PAID') {
          // ── Mark Firestore order as completed ──────────────────────────────
          const orderRef = db.collection('orders').doc(orderId);
          await orderRef.update({
            status: 'completed',
            cashfreeStatus: orderStatus,
            paymentId: cfData.cf_order_id || orderId,
            paidAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });

          // ── Grant user entitlement in Firestore ───────────────────────────
          const orderSnap = await orderRef.get();
          const orderData = orderSnap.data();
          if (orderData && orderData.userId && orderData.bookId) {
            await db.collection('userEntitlements').doc(orderData.userId).set({
              [`books.${orderData.bookId}`]: {
                purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
                format: orderData.format || 'ebook',
                orderId: orderId
              }
            }, { merge: true });
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
        return res.status(500).json({ success: false, error: 'Verification failed.' });
      }
    });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// FUNCTION 3: Cashfree Webhook (Server-to-Server event notification)
// POST body: Cashfree webhook payload (signed)
// ─────────────────────────────────────────────────────────────────────────────
exports.cashfreeWebhook = onRequest(
  { secrets: [CASHFREE_SECRET_KEY], cors: false, region: 'us-central1' },
  async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method not allowed');

    try {
      const payload = req.body;
      const event = payload.data;
      const eventType = payload.type; // PAYMENT_SUCCESS_WEBHOOK, PAYMENT_FAILED_WEBHOOK, etc.

      if (!event || !event.order) {
        return res.status(400).send('Invalid webhook payload');
      }

      const orderId = event.order.order_id;
      const orderStatus = event.order.order_status;

      console.log(`[cashfreeWebhook] Event: ${eventType}, Order: ${orderId}, Status: ${orderStatus}`);

      const orderRef = db.collection('orders').doc(orderId);
      const orderSnap = await orderRef.get();

      if (!orderSnap.exists) {
        console.warn(`[cashfreeWebhook] Order ${orderId} not found in Firestore`);
        return res.status(200).send('OK'); // Acknowledge to avoid Cashfree retries
      }

      if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || orderStatus === 'PAID') {
        const orderData = orderSnap.data();

        await orderRef.update({
          status: 'completed',
          cashfreeStatus: 'PAID',
          webhookReceivedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentId: event.payment ? event.payment.cf_payment_id : null
        });

        // Grant entitlement
        if (orderData && orderData.userId && orderData.bookId) {
          await db.collection('userEntitlements').doc(orderData.userId).set({
            [`books.${orderData.bookId}`]: {
              purchasedAt: admin.firestore.FieldValue.serverTimestamp(),
              format: orderData.format || 'ebook',
              orderId: orderId
            }
          }, { merge: true });
        }

        console.log(`[cashfreeWebhook] Order ${orderId} confirmed as PAID.`);
      } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || orderStatus === 'EXPIRED') {
        await orderRef.update({
          status: 'failed',
          cashfreeStatus: orderStatus,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      return res.status(200).send('OK');
    } catch (err) {
      console.error('[cashfreeWebhook] Error:', err);
      return res.status(500).send('Internal Error');
    }
  }
);
