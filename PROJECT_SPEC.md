# Social Readers — Master Project Spec
**Last verified:** Phase 2 (E-Commerce Platform with E-Books, Audiobooks & Full Admin Panel)
**Purpose:** Single source of truth for the project.

---

## 1. Project Overview

**What it is:** A bilingual (English/Tamil) e-book & audiobook store. 25% of every purchase funds education for underprivileged students and sports talent for rural athletes.

**Model confirmed:** Fixed-price e-book and audiobook sales (NOT donation-based). Every book/audiobook has a price; 25% of that price is earmarked for the cause.

**Tagline:** "Read for Change." / "மாற்றத்திற்காக வாசிப்போம்."

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Markup/Style | Plain HTML + Tailwind CSS (CDN, no build step) |
| Logic | Vanilla JS (no framework, modular modules) |
| Backend | Firebase (Auth + Cloud Firestore in `js/firebase-config.js` & `js/auth.js`) |
| Media hosting | Cloudinary (`js/cloudinary.js`) — images via standard upload; **PDFs & MP3s via `resource_type: raw`** |
| Audio Player | Custom HTML5 floating & responsive sample audio player (`js/audio-player.js`) with speed & scrubber controls |
| Payments & Checkout | Checkout modal with 25% allocation calculation & Razorpay flow readiness (`js/checkout.js`) |
| Deployment | GitHub → Cloudflare Pages (`_headers`, `_redirects`, `wrangler.toml`) |

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

---

## 4. Bilingual System (i18n)

- File: `js/i18n.js`. All UI text lives in a `translations = { en: {...}, ta: {...} }` object.
- Elements use `data-i18n="key"` attribute; `setLanguage(lang)` walks the DOM and sets `.textContent` (or `.value`/`placeholder` for inputs) — **never `innerHTML`**.
- **Persistence:** `currentLanguage` initializes from `localStorage.getItem('sr_lang') || 'en'`, and every `setLanguage()` call saves to `localStorage.setItem('sr_lang', lang)`.
- **No cross-language contamination:** grep-checked Unicode range scan.

---

## 5. Site Map — Public Pages

| Page | Purpose |
|---|---|
| `index.html` | Home: hero, 3 value props, pull quote, popular categories, impact banner, featured books, how-it-works, footer |
| `categories.html` | All categories grid |
| `books.html` | Full E-book catalog, filterable by category, search |
| `audiobooks.html` | Full Audiobook catalog with interactive audio sample preview player |
| `book-detail.html` | Single title view: cover, price, description, format switcher (E-Book / Audiobook), impact box (₹ breakdown of the 25%), sample player, buy button |
| `impact.html` | Stats, real stories, transparency statement |
| `account.html` | Profile shell, My Library, Order History, Wishlist, Personal Impact tally |

---

## 6. Site Map — Admin Panel

| Page | Purpose |
|---|---|
| `admin/login.html` | Admin login form with secure auth guard (`SocialReadersAuth`) |
| `admin/dashboard.html` | Stat cards (Total Books, Total Orders, Total Revenue, 25% Social Fund Allocated) + live Recent Orders table |
| `admin/manage-books.html` | Complete CRUD for Books & Audiobooks, Cover upload via Cloudinary image endpoint, PDF/MP3 via `resource_type: raw` |
| `admin/orders.html` | Full customer orders table with 25% cause audit tally and CSV export |
| `admin/categories.html` | Store category taxonomy manager |
| `admin/settings.html` | Firebase & Cloudinary API key configuration, cause allocation policy |

---

## 7. Verification Protocol

Run the Tamil Unicode scan in English block:
```bash
node -e "
const fs = require('fs');
const content = fs.readFileSync('js/i18n.js', 'utf8');
const enMatch = content.match(/en:\s*\{[\s\S]*?\n\s*\},\s*\n\s*ta:/);
const enBlock = enMatch[0];
const tamilCharPattern = /[\u0B80-\u0BFF]/;
const lines = enBlock.split('\n');
lines.forEach((line, i) => {
  if (tamilCharPattern.test(line)) {
    console.log('TAMIL TEXT FOUND IN EN BLOCK, line ' + i + ': ' + line.trim());
  }
});
console.log('Scan complete.');
"
```
