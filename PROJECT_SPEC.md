# Social Readers — Master Project Spec
**Last verified:** Phase 1 (Frontend, static, no backend yet)
**Purpose:** Single source of truth for the project. Use this to brief Antigravity on any new feature or bug fix, and paste back to Claude for audit before marking anything "done."

---

## 1. Project Overview

**What it is:** A bilingual (English/Tamil) e-book store. 25% of every purchase funds education for underprivileged students and sports talent for rural athletes.

**Model confirmed:** Fixed-price ebook sale (NOT donation-based). Every book has a price; 25% of that price is earmarked for the cause.

**Tagline:** "Read for Change." / "மாற்றத்திற்காக வாசிப்போம்."

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Markup/Style | Plain HTML + Tailwind CSS (CDN, no build step) |
| Logic | Vanilla JS (no framework) |
| Backend (Phase 2+) | Firebase (Auth + Firestore) |
| Media hosting | Cloudinary — images via standard upload; **PDFs via `resource_type: raw`** (not the image endpoint) |
| Payments (Phase 3) | Cashfree Payments (PG Web SDK + Cloudflare Pages Functions) |
| Deployment | GitHub → Cloudflare Pages (auto-deploy on push to `main`) |

No React, no npm build pipeline. Everything must run as static files.

---

## 3. Brand Reference

**Colors** (Tailwind config keys):
- `navy` = `#0B2C5D` — headings, primary text, active nav state
- `forest` = `#2E7D32` — primary buttons, "Learn"/positive accents
- `brandOrange` = `#E8720C` — CTA highlights, "For Change" badges, wishlist heart
- `cream` = `#FAF7F2` — page background

**Fonts:** Poppins (headings), Inter (body), Noto Sans Tamil (Tamil script support).
**Required in every page `<head>`:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600;700&family=Noto+Sans+Tamil:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

**Logo:** "SOCIAL" (navy) + "READERS" (forest green), two-tone wordmark. Tagline below in small caps with orange underline accents on both sides.

---

## 4. Bilingual System (i18n) — CRITICAL RULES

- File: `js/i18n.js`. All UI text lives in a `translations = { en: {...}, ta: {...} }` object.
- Elements use `data-i18n="key"` attribute; `setLanguage(lang)` walks the DOM and sets `.textContent` (or `.value`/`placeholder` for inputs) — **never `innerHTML`**.
- **Persistence:** `currentLanguage` MUST initialize from `localStorage.getItem('sr_lang') || 'en'`, and every `setLanguage()` call MUST `localStorage.setItem('sr_lang', lang)`. Without this, language resets to English on every page navigation — this is a real bug, already caught once.
- **No cross-language contamination:** every key inside the `en:` block must have an English value; every key inside `ta:` must have Tamil. (Bug already found once: `account.title` had Tamil text inside the `en` block — always grep-check both blocks for stray Devanagari/Tamil Unicode ranges after any i18n.js edit.)
- Language toggle buttons use class `.lang-toggle-btn`, text shows `EN | த` / `த | EN` depending on state.
- New pages/components MUST reuse existing translation keys where the same concept repeats (e.g. `nav.home`, `book.btn.buy`) — do not create duplicate keys for the same string.

---

## 5. Site Map — Public Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: hero, 3 value props, pull quote, popular categories, impact banner, featured books, how-it-works, footer |
| `categories.html` | All categories grid |
| `books.html` | Full catalog, filterable by category, search |
| `book-detail.html` | Single book: cover, price, description, impact box (₹ breakdown of the 25%), buy button, reviews |
| `impact.html` | Stats (students supported, funds contributed, athletes sponsored, schools reached), real stories, transparency statement |
| `account.html` | Profile shell, My Library, Order History, Wishlist, Personal Impact tally |

**Navigation split by breakpoint:**
- **Desktop (`md:` and up):** standard top navbar, full links + language toggle visible.
- **Mobile (below `md:`):** navbar collapses to logo + lang toggle only; a **fixed bottom tab bar** takes over navigation — 5 tabs: Home, Categories, My Library (points to `books.html` currently — pending decision, see §8), Our Impact (heart icon, orange highlight — treated as the "primary" tab), Account.

---

## 6. Site Map — Admin Panel

| Page | Purpose |
|---|---|
| `admin/login.html` | Email + password form (UI only in Phase 1 — Firebase Auth wiring is Phase 2) |
| `admin/dashboard.html` | Sidebar (Dashboard, Manage Books, Orders & Receipts, Categories, Settings) + 4 stat cards (Total Books, Total Orders, Total Revenue, 25% Social Fund Allocated) + Recent Orders table shell |

**Not yet built (Phase 2+):**
- Book CRUD forms (add/edit/delete, cover upload to Cloudinary, PDF upload as raw resource)
- Orders table wired to real Firestore data, CSV export
- Admin auth guard (must follow the "never invert the auth check" lesson from other projects — the guard should default to *denying* access, not allowing it, when auth state is unknown)

---

## 7. Data Model (Phase 2 target — not yet implemented)

```
books/{bookId}
  - title: { en, ta }
  - author: { en, ta }
  - description: { en, ta }
  - coverImageUrl        (Cloudinary)
  - pdfUrl                (Cloudinary raw resource)
  - price: number         (INR)
  - category: string
  - isBestseller: boolean
  - createdAt: timestamp

orders/{orderId}
  - bookId: string
  - buyerName: string
  - buyerEmail: string
  - amount: number
  - causeShare: number     (25% of amount, stored explicitly for reporting)
  - paymentId: string       (Cashfree payment/order session ID)
  - paymentStatus: string   (pending | success | failed)
  - downloadToken: string   (time-limited signed access)
  - createdAt: timestamp

admins/{uid}
  - email: string
```

Security rule principle to apply later: public read on `books`, no public write; `orders` writable only via a Cloudflare Function that verifies the Cashfree payment status server-side (never trust client-submitted payment status).

---

## 8. Open Decisions (client not yet confirmed)

- **Login/account system:** whether `account.html` / "My Library" needs real user auth (signup/login) to track individual purchases, or if downloads are handled purely via emailed link + order lookup by email. **Do not build auth logic until this is confirmed** — Phase 1 UI shells only.

## 8a. Scope Expansion (confirmed by client, added after initial Phase 1 build)

These were NOT in the original design screenshot but are confirmed real requirements — update all future prompts and audits to include them:

- **Audiobooks:** Books can have both an E-Book format (existing price) AND an Audiobook format (separate price, e.g. ₹199). `book-detail.html` needs a format selector toggle. Data model: `books/{bookId}` needs `formats: { ebook: { price, fileUrl }, audiobook: { price, fileUrl } }` instead of a single flat `price`/`pdfUrl`. Audio files — same Cloudinary `resource_type: raw` pattern as PDFs, or consider Cloudinary's native audio/video handling (`resource_type: video` covers audio too) — verify against actual file size/format before deciding in Phase 2.
- **Stories/Blog section:** A separate content type from books — "Manage Stories" / "Novel Series" in admin. Needs its own collection (`stories/{storyId}`) distinct from `books/{bookId}`. **Not yet spec'd in detail** — clarify with client: is this free serialized fiction, blog posts, or something else? Affects whether it needs its own purchase flow or is free-to-read content.
- **Hero slider:** Home page hero rotates between multiple promotional slides (not a single static hero).
- **Lightning Deals countdown timer:** A time-limited discount banner/section with a live countdown — implies a "deal end time" field somewhere (book-level or a separate `deals` collection) that admin can set.

⚠️ These additions increase Phase 2 Firestore schema complexity — the schema in §7 is now outdated and needs a revision pass before Phase 2 backend work starts.

## 8b. Critical Pre-Launch Blockers (found during Phase 1 audit)

These must be resolved before any real deployment or client demo with real users:

1. **Copyright risk in sample reader content** — `js/reader.js`'s `bookSamples` object currently contains verbatim excerpts from real published books (Atomic Habits, Wings of Fire, Rich Dad Poor Dad, The Psychology of Money, etc.) used as placeholder demo data. Client confirmed these are placeholder titles only — the real catalog will use different books. **This placeholder content must be fully replaced with original, non-copyrighted text before going live**, even in a demo/staging environment, since accidentally publishing real copyrighted excerpts is an infringement risk regardless of intent.
2. **Fake checkout button text is misleading** — `js/checkout.js`'s buy button currently reads "Pay ₹X (Cashfree / UPI / Card)" but performs a `setTimeout`-based simulation only; no real payment gateway is wired. Must be relabeled (e.g. "Simulate Payment — Demo Mode") until real Cashfree PG integration with server-side payment verification lands in Phase 3, to avoid misleading testers, stakeholders, or (worst case) real customers into believing a transaction occurred.
3. **Admin auth is not real security** — `js/auth.js` checks credentials client-side in plaintext JS (`email === 'admin@socialreaders.org' && (password === 'admin123' || password.length >= 6)`), visible to anyone via browser DevTools, and accepts *any* 6+ character password. This is placeholder UI only and must never be treated as real access control. Real Firebase Auth + server-verified admin role check is required before the admin dashboard is trusted with real order/revenue data.
4. **`js/firebase-config.js` doesn't actually use Firebase** — despite the name and despite `PROJECT_SPEC.md` claiming "Firebase Auth + Firestore," this file only wraps `localStorage` reads/writes (`window.SocialReadersDB`). No real Firebase SDK call exists yet. Keep this in mind when planning real Firebase integration — it may be cleaner to build the real integration in a new file rather than retrofitting this one, to avoid confusion between the simulated and real data layers.

---

## 9. Bug Log (fixed, for regression awareness)

| # | Bug | Fix |
|---|---|---|
| 1 | Language reset to English on page navigation | `localStorage` persistence added to `i18n.js` |
| 2 | Missing Google Fonts import — Tamil text rendered in fallback font | Added font `<link>` tags to all 8 HTML `<head>`s |
| 3 | `en` translations block contained a Tamil string (`account.title`) | Corrected to English; added a grep-based Unicode-range check as a standing verification step |

---

## 10. Verification Protocol (use for every future prompt)

Never accept "done"/"fixed" from Antigravity without raw proof. Standard closing ask on every fix prompt:

```
After making the fix(es), paste the full raw output of:
cat <changed file 1>
cat <changed file 2>
...
```

For i18n changes specifically, also run the Tamil-Unicode-in-English-block scan (see §4) to catch cross-language contamination before sign-off.

---

## 11. How to Use This Doc

- **New feature request →** paste relevant section(s) of this spec to Antigravity as context before the feature-specific prompt, so naming/colors/i18n keys stay consistent.
- **Bug report →** bring the bug + Antigravity's claimed fix + raw file output to Claude here; this doc is the baseline Claude will check against.
- **Update this doc** whenever a phase completes or a new decision is confirmed (e.g. once login is decided, §8 moves into §7/§5 as implemented).
