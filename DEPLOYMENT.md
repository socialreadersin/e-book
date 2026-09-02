# 🚀 Social Readers — Production Deployment Guide

> Complete end-to-end guide: Cashfree → Firebase → Cloudflare Pages

---

## 1. Prerequisites

```bash
# Install Firebase CLI globally (if not already done)
npm install -g firebase-tools

# Log in to Firebase
firebase login

# Set the active project
firebase use e-book-7c31a
```

---

## 2. Set Cashfree Payment Credentials (One-Time, CRITICAL)

These are stored in **Google Cloud Secret Manager** — never in code.

```bash
# Navigate to your project root
cd /Users/admin/Documents/Flyggo/E-book

# Set App ID (get from Cashfree Dashboard → API Keys)
firebase functions:secrets:set CASHFREE_APP_ID
# [Paste your App ID and press Enter]

# Set Secret Key (get from Cashfree Dashboard → API Keys)
firebase functions:secrets:set CASHFREE_SECRET_KEY
# [Paste your Secret Key and press Enter]
```

**Sandbox (Test) Credentials:** Use these for testing from  
`https://merchant.cashfree.com/merchants/testpg` (Sandbox dashboard)

---

## 3. Update cashfree-config.js for Live Mode

When going LIVE, edit [`js/cashfree-config.js`](./js/cashfree-config.js):

```js
// Change this line:
environment: 'sandbox'
// To:
environment: 'production'
```

And update the Cloud Function URL to your production endpoint.

---

## 4. Deploy Firebase Cloud Functions

```bash
cd /Users/admin/Documents/Flyggo/E-book

# Install dependencies (if not done)
cd functions && npm install && cd ..

# Deploy ONLY functions first (test independently)
firebase deploy --only functions

# Expected output:
# ✔  functions[createCashfreeOrder]: Deployed
# ✔  functions[verifyCashfreePayment]: Deployed  
# ✔  functions[cashfreeWebhook]: Deployed
```

Note the function URLs from the output — you'll need to update  
`js/cashfree-config.js` with the actual `createOrderUrl`.

---

## 5. Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
```

---

## 6. Deploy to Cloudflare Pages (Static Frontend)

### Option A: GitHub Auto-Deploy (Recommended)

1. Push this repository to GitHub
2. In Cloudflare Dashboard → Pages → Connect to Git → select repo
3. Build settings:
   - **Build command:** (leave blank — this is a static site)
   - **Build output directory:** `.` (root)
4. Cloudflare Pages will auto-detect `_redirects` and handle SPA routing

### Option B: Manual Deploy via Wrangler CLI

```bash
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages deploy . --project-name=socialreadersin
```

---

## 7. Set Cashfree Webhook URL in Cashfree Dashboard

In [Cashfree Merchant Dashboard → Webhooks](https://merchant.cashfree.com/):
- Add webhook URL: `https://us-central1-e-book-7c31a.cloudfunctions.net/cashfreeWebhook`
- Select events: `PAYMENT_SUCCESS`, `PAYMENT_FAILED`

---

## 8. Update CORS Origins in functions/index.js

Edit the `corsHandler` in [`functions/index.js`](./functions/index.js):

```js
const corsHandler = cors({
  origin: [
    'https://socialreadersin.pages.dev',  // Cloudflare preview
    'https://socialreaders.in',            // Custom domain
    'https://www.socialreaders.in',
  ],
  // ...
});
```

---

## 9. Final Deployment (Everything Together)

```bash
# Deploy functions + firestore rules together
firebase deploy --only functions,firestore:rules

# Then push to GitHub for Cloudflare Pages to auto-build
git add -A
git commit -m "feat: Cashfree payment integration + admin panel + security hardening"
git push origin main
```

---

## 10. Verify Production Checklist

- [ ] Cashfree CASHFREE_APP_ID and CASHFREE_SECRET_KEY set as Firebase secrets
- [ ] `environment: 'production'` set in `js/cashfree-config.js`
- [ ] Cloud Function URLs updated in `cashfree-config.js`
- [ ] Firestore rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Cloudflare Pages `_redirects` catch-all `/* /index.html 200` in place
- [ ] Cashfree webhook pointing to Firebase Cloud Function URL
- [ ] Admin hardcoded credentials removed (✅ done in this commit)
- [ ] Razorpay removed completely (✅ done in this commit)

---

## Architecture Summary

```
[Browser]  →  [Cloudflare Pages] (static HTML/JS/CSS)
                      │
                      ▼
              [js/cashfree-config.js]  (loads Cashfree PG SDK)
                      │
          ┌───────────┴───────────┐
          │                       │
    [createOrder]          [payment UI opens]
          │                       │
          ▼                       ▼
   [Firebase Cloud Fn]    [Cashfree Drop-in]
   createCashfreeOrder()         │
          │              [User pays → success]
   [Cashfree API →               │
    returns sessionId]           ▼
          │              [verifyCashfreePayment]
          │                      │
          └───────────┬──────────┘
                      │
               [Firestore DB]
               orders collection
               userEntitlements
```

---

## Support & Secrets Rotation

To rotate the Cashfree Secret Key:

```bash
firebase functions:secrets:set CASHFREE_SECRET_KEY
# Enter new key, then redeploy
firebase deploy --only functions
```
