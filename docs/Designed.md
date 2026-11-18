# Maqam Brand Identity & Design System Specification

> **Document Name:** `Designed.md` (See also `Desgined.md`)  
> **Brand:** GoMaqam / Maqam Travels  
> **Status:** Single Source of Truth for Brand Assets, Colors, Typography, and UI Components.  
> **Applicable Areas:** Public Booking Platform (`src/`), Admin CRM Console (`src/admin/`), and Hotelier Dashboard (`src/hotalier/`).

---

## 1. Brand Identity & Creative Direction

**GoMaqam (Maqam Travels)** is a premier Islamic travel and pilgrimage platform specializing in verified Umrah and Hajj packages, direct flight allotments to Jeddah & Madinah, and luxury 4★/5★ hotels near Masjid al-Haram and the Prophet’s Mosque.

### Core Aesthetic Pillars
- **Spiritual Reverence:** Calming, sacred deep Islamic greens (`#045C45`, `#059669`) evoking the Green Dome of Madinah and sacred oasis traditions.
- **Modern Simplicity:** Clean, uncluttered layouts with generous white space, rounded corners (16px–24px), and subtle micro-interactions.
- **Trust & Transparency:** Crystal-clear pricing, guaranteed allotments, itemized fees, and verified real-time availability badges.
- **Desert & Coastal Harmony:** Warm Kaaba marble/desert sand neutrals (`#F6F4EF`) paired with vibrant Persian teal & Red Sea aqua wave gradients (`#00987A`, `#00BAA7`).

---

## 2. Brand Logo Specification

### 2.1 Logo Assets & Locations

| Asset Role | File Path | Format | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Primary Master Logo** | `src/assets/logo.png` | PNG (Transparent) | Header, Footer, Admin, Auth Screens |
| **Browser Favicon** | `public/favicon.png` | PNG | Browser Tab Icon, Bookmarks |
| **Vector Reference** | Embedded SVG below | SVG | Scalable Vector Contexts |

### 2.2 Scalable Vector Reference (SVG Markup)
```html
<svg width="220" height="56" viewBox="0 0 220 56" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Brand Icon: Spiritual Crescent & Arch Motif -->
  <g id="brand-icon">
    <rect x="4" y="6" width="44" height="44" rx="14" fill="url(#brand-green-gradient)" />
    <!-- Kaaba / Mihrab Arch Silhouette -->
    <path d="M26 15C20.5 15 17 19.5 17 25V39H35V25C35 19.5 31.5 15 26 15Z" fill="#F8FAFC" fill-opacity="0.95"/>
    <path d="M26 20C23 20 21 22.8 21 26.5V39H31V26.5C31 22.8 29 20 26 20Z" fill="url(#brand-gold-gradient)"/>
    <circle cx="26" cy="18" r="2.5" fill="#FBBF24" />
  </g>
  <!-- Wordmark: MAQAM -->
  <text x="58" y="32" font-family="'Poppins', sans-serif" font-size="22" font-weight="800" letter-spacing="-0.5" fill="#045C45">
    MAQAM
  </text>
  <!-- Tagline: HOLIDAYS & PILGRIMAGES -->
  <text x="59" y="44" font-family="'Poppins', sans-serif" font-size="8.5" font-weight="600" letter-spacing="1.8" fill="#00987A">
    TRAVELS &amp; PILGRIMAGE
  </text>
  <!-- Gradients -->
  <defs>
    <linearGradient id="brand-green-gradient" x1="4" y1="6" x2="48" y2="50" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#045C45" />
      <stop offset="50%" stop-color="#00987A" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
    <linearGradient id="brand-gold-gradient" x1="21" y1="20" x2="31" y2="39" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
</svg>
```

### 2.3 Logo Implementation Across Touchpoints

1. **Main Navigation Header (`src/components/CommonHeader.jsx`)**
   - **Height:** `h-10` (unscrolled), dynamically transitions to `h-9` on page scroll.
   - **Styling:** `object-contain transition-all duration-300 py-1`.
   - **Mobile Drawer:** `h-8 sm:h-9 object-contain drop-shadow-md`.
2. **Main Footer (`src/components/Footer.jsx`)**
   - **Container:** Wrapped inside `bg-white/95 dark:bg-slate-900/90 p-2.5 rounded-2xl shadow-lg border border-white/40`.
   - **Size:** `h-10 sm:h-12 w-auto object-contain`.
3. **Admin CRM Sidebar (`src/admin/components/layout/Sidebar.jsx`)**
   - **Container:** Dedicated `.logo-tile` class (`h-13 w-13 rounded-xl object-contain p-0.5 shadow-sm ring-1 ring-slate-100`).
   - **Critical Rule:** In `src/index.css`, the `.logo-tile` rule is protected with `background-color: #ffffff !important;` so that dark mode class inversion never darkens or washes out the logo badge.
4. **User Hub Dashboard (`src/components/user/UserLayout.jsx`)**
   - **Wordmark:** Bold `"Maqam"` accompanied by `"Traveler Hub"` subtitle with aviation icon.

### 2.4 Logo Clear-Space & Don'ts
- **Clear Space:** Maintain minimum padding around the logo equal to at least 50% of the mark's height (`X/2`).
- **Do Not Stretch:** Always enforce `object-contain` with proportional width/height.
- **Do Not Invert on Dark Backgrounds:** Keep the logo on an isolated light pill or high-contrast surface (`.logo-tile` or `bg-white/95`).

---

## 3. Color Palette & Design Tokens

### 3.1 Primary Spiritual Brand Colors

| Color Token | Swatch | Hex Code | RGB | Tailwind Class | Semantic Purpose |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Islamic Forest Green** | ![#045C45](https://via.placeholder.com/16/045C45/045C45.png) | `#045C45` | `rgb(4, 92, 69)` | `text-[#045C45]` / `bg-[#045C45]` | Primary brand anchor, hero badges, icon accents |
| **Deep Emerald 800** | ![#065F46](https://via.placeholder.com/16/065F46/065F46.png) | `#065F46` | `rgb(6, 95, 70)` | `bg-emerald-800` / `text-emerald-800` | Hotelier sidebar gradient start, deep headers |
| **Emerald 600** | ![#059669](https://via.placeholder.com/16/059669/059669.png) | `#059669` | `rgb(5, 150, 105)` | `bg-emerald-600` / `text-emerald-600` | Primary action buttons, active tab indicators |
| **Emerald 500** | ![#10B981](https://via.placeholder.com/16/10B981/10B981.png) | `#10B981` | `rgb(16, 185, 129)` | `bg-emerald-500` / `text-emerald-500` | Hover states, success checkmarks, brand gradients |
| **Emerald 400** | ![#34D399](https://via.placeholder.com/16/34D399/34D399.png) | `#34D399` | `rgb(52, 211, 153)` | `dark:text-emerald-400` | Dark mode primary brand text and highlighted labels |
| **Emerald 300** | ![#6EE7B7](https://via.placeholder.com/16/6EE7B7/6EE7B7.png) | `#6EE7B7` | `rgb(110, 231, 183)` | `dark:text-emerald-300` | Active indicator bars, dark-mode secondary text |
| **Emerald 50** | ![#ECFDF5](https://via.placeholder.com/16/ECFDF5/ECFDF5.png) | `#ECFDF5` | `rgb(236, 253, 245)` | `bg-emerald-50` / `dark:bg-emerald-950/60` | Soft badge tint, pill container background |

### 3.2 Coastal Teal & Water Palette

| Color Token | Swatch | Hex Code | RGB | Tailwind Class | Semantic Purpose |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Persian Teal** | ![#00987A](https://via.placeholder.com/16/00987A/00987A.png) | `#00987A` | `rgb(0, 152, 122)` | `text-[#00987A]` | Header brand gradient stop, active indicators |
| **Lagoon Aqua** | ![#00BAA7](https://via.placeholder.com/16/00BAA7/00BAA7.png) | `#00BAA7` | `rgb(0, 186, 167)` | Fill `#00BAA7` in SVG | Animated water waves in `Footer.jsx` |
| **Dark Teal** | ![#0F766E](https://via.placeholder.com/16/0F766E/0F766E.png) | `#0F766E` | `rgb(15, 118, 110)` | `text-teal-700` | Subdued aquatic borders and icons |

### 3.3 Sacred Accents & Warm Neutrals

| Color Token | Swatch | Hex Code | RGB | Tailwind Class | Semantic Purpose |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Sacred Gold / Amber** | ![#FBBF24](https://via.placeholder.com/16/FBBF24/FBBF24.png) | `#FBBF24` | `rgb(251, 191, 36)` | `text-amber-400` / `fill-amber-400` | 5-star customer ratings, VIP badges, golden accents |
| **Deep Amber** | ![#D97706](https://via.placeholder.com/16/D97706/D97706.png) | `#D97706` | `rgb(217, 119, 6)` | `text-amber-600` / `dark:text-amber-400` | Q&A question prefixes (`Q:`), warning states |
| **Desert Kaaba Sand** | ![#F6F4EF](https://via.placeholder.com/16/F6F4EF/F6F4EF.png) | `#F6F4EF` | `rgb(246, 244, 239)` | `bg-[#F6F4EF]` | Pilgrimage warm marble cards & backgrounds |

### 3.4 Aviation & Functional Accents

| Color Token | Swatch | Hex Code | RGB | Tailwind Class | Semantic Purpose |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **Aviation Blue** | ![#2563EB](https://via.placeholder.com/16/2563EB/2563EB.png) | `#2563EB` | `rgb(37, 99, 235)` | `bg-blue-600` / `text-blue-600` | Direct flight card pills, flight itinerary details |
| **Sky Plane Blue** | ![#38BDF8](https://via.placeholder.com/16/38BDF8/38BDF8.png) | `#38BDF8` | `rgb(56, 189, 248)` | `text-sky-400` | Airplane path indicators, cabin class tags |
| **Danger / Logout Rose**| ![#EF4444](https://via.placeholder.com/16/EF4444/EF4444.png) | `#EF4444` | `rgb(239, 68, 68)` | `text-rose-500` / `bg-rose-500` | Destructive action triggers, cancellation dialogs |
| **Light Rose** | ![#F87171](https://via.placeholder.com/16/F87171/F87171.png) | `#F87171` | `rgb(248, 113, 113)` | `text-rose-400` / `dark:text-rose-400` | Logout button text in dark navigation menus |

### 3.5 Surface & Dark Mode Hierarchy

| Surface Token | Hex Code | Tailwind Equivalent | Role in Application |
| :--- | :--- | :--- | :--- |
| **Dark Theme Canvas** | `#070C18` | `dark:bg-[#070c18]` | Root background for Home, Packages, Offers sections |
| **Dark Theme Body** | `#0B1120` | `html.dark body` | Deep navy base background for authenticated portals |
| **Card Surface (Dark)**| `#0F172A` | `dark:bg-slate-900` | Main card background for flights, packages, hotels |
| **Card Surface (Alt)** | `#0C1527` | `dark:bg-[#0c1527]` | Testimonial & review cards |
| **Elevated Surface** | `#1E293B` | `dark:bg-slate-800` | Popover menus, dropdowns, modal card bodies |
| **Hover Surface (Dark)**| `#334155` | `dark:bg-slate-700` | Hover states on table rows and icon buttons |
| **Border Dark** | `#334155` | `dark:border-slate-800` | Card borders, dividers, subtle outlines |
| **Light Canvas** | `#F8FAFC` | `bg-slate-50` | Primary light background |
| **Card Surface (Light)**| `#FFFFFF` | `bg-white` | Light mode card containers and popovers |

---

## 4. Gradients & Ambient Effects

### 4.1 Signature Brand Header Gradient
```css
/* Used for brand underlines, active nav items, and glowing borders */
background: linear-gradient(to right, #00987A, #10B981);
```

### 4.2 Hotelier Dashboard Sidebar Gradient
```css
/* Deep, calming green gradient for the Hotelier CRM Sidebar */
background: linear-gradient(180deg, #064E3B 0%, #065F46 46%, #04372A 100%);
```

### 4.3 Hotelier Dashboard Hero Welcome Banner
```css
/* Dynamic green gradient for executive welcome header */
background: linear-gradient(120deg, #065F46 0%, #047857 55%, #059669 100%);
```

### 4.4 Multi-Layer Footer Wave Simulation
- **Wave Layer 1 (Slow Deep Swell):** `#00BAA7` with `fillOpacity="0.4"`
- **Wave Layer 2 (Mid Rolling Swell):** `#00BAA7` with `fillOpacity="0.55"`
- **Wave Layer 3 (Foreground Crest):** `#00BAA7` with `fillOpacity="0.8"`
- **Wave Layer 4 (Base Ocean Floor):** `#00BAA7` solid fill

---

## 5. Typography System

The project utilizes Tailwind v4 `@theme` mappings loaded in `src/index.css`.

### 5.1 Font Families

| Font Token | Family Name | CSS Variable | Recommended Usage |
| :--- | :--- | :--- | :--- |
| `font-poppins` | **Poppins** | `--font-poppins` | **Primary Brand Font**: Headings, buttons, labels, and all Hotelier UI |
| `font-inter` | **Inter** | `--font-inter` | **Dense Data**: Flight timings, price tables, booking numbers, PNRs |
| `font-jakarta` | **Plus Jakarta Sans** | `--font-jakarta` | **Cards & Packages**: PackageCard titles, luxury hotel descriptions |
| `font-mirza` | **Mirza** | `--font-mirza` | Islamic quotes, Quranic verses, spiritual calligraphy accents |
| `font-dancing` | **Dancing Script** | `--font-dancing` | Playful script highlights in holiday badges |

### 5.2 Type Scale & Weight Ladder

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `36px - 48px` (`text-3xl lg:text-5xl`) | 800 (`font-extrabold`) | `leading-tight` | Landing page hero titles |
| **Section H2** | `24px - 30px` (`text-2xl sm:text-3xl`) | 700 (`font-bold`) | `leading-snug` | Section titles (`Featured Flight Offers`) |
| **Card Title H3** | `16px - 18px` (`text-base sm:text-lg`) | 700 (`font-bold`) | `leading-snug` | Package titles, hotel names |
| **Subheadings** | `13px - 14px` (`text-xs sm:text-sm`) | 500 (`font-medium`) | `leading-relaxed` | Descriptions, helper text |
| **Labels & Badges** | `10px - 11px` (`text-[10px]` / `text-[11px]`) | 600 (`font-semibold`) | `tracking-wide` | Status pills, cabin class chips |
| **Numbers & Prices**| `18px - 28px` (`text-lg` to `text-3xl`) | 800 (`font-extrabold`) | `tabular-nums` | Flight prices, booking totals |

---

## 6. UI Component Standards

### 6.1 Action Buttons

```jsx
// 1. Primary Action Button (Emerald CTA)
<button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-900/20 active:scale-95 transition-all">
  Book Package
</button>

// 2. Secondary Button (Subtle Bordered)
<button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
  View Details
</button>

// 3. Danger / Logout Button
<button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition">
  <LogOut size={14} /> Log Out
</button>
```

### 6.2 Cards & Media Containers
- **Border Radius:** `rounded-2xl` (16px) or `rounded-3xl` (24px) for major card sections.
- **Borders:** 1px hairline border: `border border-slate-200/80 dark:border-slate-800`.
- **Card Hover Motion:** `whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300, damping: 25 }}`.
- **Image Overlays:** Gradient shadow fade: `bg-gradient-to-t from-black/35 to-transparent`.

### 6.3 Input Fields & Form Controls
- **Default State:** `rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 px-3 text-sm`.
- **Focus State:** `focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-950/60 outline-none transition`.

---

## 7. Developer Quick Reference

```
/* Primary Brand Color */
--brand-primary: #045C45;
--brand-teal:    #00987A;
--brand-emerald: #10B981;
--brand-gold:    #FBBF24;

/* Dark Theme Root */
--dark-bg:       #070C18;
--dark-surface:  #0F172A;
--dark-border:   #334155;

/* Common Utility Classes */
text-brand-green:  text-[#045C45] dark:text-emerald-400
bg-brand-green:    bg-[#045C45]
border-brand:      border-emerald-500/40
```
