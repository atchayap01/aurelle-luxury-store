# Aurelle — Curated for the Art of Living

Aurelle is a full-stack, quiet-luxury lifestyle e-commerce web application inspired by high-end design houses, architectural proportion, and master craftsmanship. Built with a unified design system, secure JWT authentication, and a persistent REST API backend.

---

## Brand Aesthetic & Direction

- **Brand Name**: Aurelle
- **Tagline**: *"Curated for the art of living."*
- **Design Ethos**: Quiet luxury, ample whitespace, fine typography (Cormorant Garamond + Plus Jakarta Sans), tactile material palettes, and zero-pill typographic discipline.
- **Palette**:
  - Ivory (`#F8F5EF`)
  - Warm Beige (`#E8DED0`)
  - Champagne (`#D6C2A5`)
  - Taupe (`#A99B8C`)
  - Espresso (`#2C2520`)
  - Pure White (`#FFFFFF`)

---

## Features

### 1. Storefront & Catalog
- **Editorial Hero**: Atmospheric campaign focal point with direct collection CTAs.
- **Shop Catalog**: Filter by category (Home, Fashion, Accessories, Beauty, Lifestyle), price sliders, and in-stock toggles.
- **Sorting Options**: Curator’s Choice (Featured), Price: Low to High, Price: High to Low, New Arrivals, Best Sellers.
- **Instant Search**: Live search modal with real-time suggestions and direct product navigation.
- **Quick View Modal**: Interactive inspection modal with image switcher, specifications, and fast add-to-bag.
- **Product Details (PDP)**: Contiguous purchase module, multi-image gallery, material specifications, white-glove shipping guidelines, and "Complete the Look" recommendations.

### 2. Shopping Bag & Checkout
- **Cart Drawer & Page**: Slide-over drawer and dedicated bag review with itemized controls, quantities, and complimentary shipping progress indicators (threshold ₹3,000).
- **Multi-Step Checkout**:
  - Step 1: Customer Contact (Name, Email, Phone)
  - Step 2: Delivery Destination (Address, City, State, Postal Code)
  - Step 3: Order Review & Settlement (Cash on Delivery + Online Sandbox Card)
- **Stock Protection**: Server-side price recalculation from the database with atomic stock deduction and rollback.

### 3. Order Tracking
- **Interactive Visual Timeline**: Order Placed $\to$ Processing $\to$ Shipped $\to$ Out for Delivery $\to$ Delivered.
- **Order Cancellation**: Eligible orders can be cancelled directly with automatic inventory restoration.

### 4. Client Circle & Authentication
- **Secure Authentication**: JWT token generation and bcrypt password hashing.
- **Client Dashboard**: Personal details, past order history, curated wishlist, and saved delivery destinations.
- **Curator Studio (Admin Dashboard)**:
  - Overview metrics: Total Revenue, Total Orders, Total Products, Client Accounts, and Low Inventory alerts.
  - Product Catalog CRUD: Add, edit, delete, stock adjustments, pricing, and curation tags.
  - Order Consignments: Status updates and cancellation management.
  - Client Management: Role elevation (User $\leftrightarrow$ Admin).

---

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, TypeScript (`tsx`).
- **Data Layer**: Persistent JSON database engine with Mongoose/MongoDB query conventions, disk serialization in `/data/database.json`.
- **Security**: bcrypt password hashing, JSON Web Tokens (JWT), role-based middleware.

---

## Demo Credentials

### Curator / Admin Account
- **Email**: `admin@aurelle.com`
- **Password**: `AdminAurelle123!`

### Collector / Customer Account
- **Email**: `customer@aurelle.com`
- **Password**: `Customer123!`

*(One-click demo buttons are provided on the Sign In page for immediate testing)*

---

## Folder Structure

```
aurelle/
├── data/
│   └── database.json          # Persistent file-backed database storage
├── server/
│   ├── db.ts                  # Database engine & Mongoose-like collection models
│   ├── seedData.ts            # Realistic luxury seed products across 5 categories
│   ├── middleware/
│   │   └── auth.ts            # JWT authentication & admin authorization middleware
│   └── routes/
│       ├── auth.ts            # /api/auth (register, login, me, addresses, wishlist)
│       ├── products.ts        # /api/products (filter, search, sort, pagination, CRUD)
│       ├── orders.ts          # /api/orders (recalculated checkout, tracking, cancel)
│       ├── users.ts           # /api/users (admin user management)
│       └── admin.ts           # /api/admin (business KPI metrics & alerts)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx         # 3-Zone Top Bar with Mobile Drawer
│   │   ├── Footer.tsx         # Quiet luxury footer with newsletter
│   │   ├── ProductCard.tsx    # Zero-pill luxury product card with micro-interactions
│   │   ├── CartDrawer.tsx     # Slide-over cart panel with free shipping progress
│   │   ├── SearchModal.tsx    # Live instant search modal
│   │   ├── QuickViewModal.tsx # Inspection pop-up
│   │   └── ImageWithFallback.tsx # Resilient zero-broken-image component
│   ├── context/
│   │   ├── AuthContext.tsx    # Session management & user profile
│   │   ├── CartContext.tsx    # Bag state & localStorage synchronization
│   │   └── ToastContext.tsx   # Minimalist notification system
│   ├── pages/
│   │   ├── HomePage.tsx       # Editorial hero, categories, featured, story
│   │   ├── ShopPage.tsx       # Filtering, price sliders, sorting, pagination
│   │   ├── ProductDetailsPage.tsx # PDP with specs and related items
│   │   ├── CartPage.tsx       # Full cart review
│   │   ├── CheckoutPage.tsx   # Multi-step checkout with COD
│   │   ├── OrderSuccessPage.tsx # Order confirmation with reference code
│   │   ├── OrderTrackingPage.tsx # 5-stage progress timeline
│   │   ├── AuthPage.tsx       # Split-screen sign-in and registration
│   │   ├── AccountPage.tsx    # Profile, orders, wishlist, addresses
│   │   ├── AdminDashboard.tsx # Comprehensive curator control room
│   │   ├── CategoriesPage.tsx # Taxonomy guide
│   │   └── AboutPage.tsx      # Atelier manifesto
│   ├── types/
│   │   └── index.ts           # Shared TypeScript models
│   ├── utils/
│   │   └── formatters.ts      # Currency (INR) and date formatting
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── server.ts                  # Express full-stack entry point with Vite middleware
├── package.json
└── README.md
```

---

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve current authenticated user profile.
- `PUT /api/auth/profile` — Update user profile details.
- `POST /api/auth/wishlist/toggle` — Add or remove product from wishlist.
- `POST /api/auth/addresses` — Add saved delivery address.
- `DELETE /api/auth/addresses/:id` — Remove saved delivery address.

### Products (`/api/products`)
- `GET /api/products` — Filter by category, search, price range, stock, sort, and pagination.
- `GET /api/products/:id` — Retrieve product details with related items.
- `POST /api/products` *(Admin)* — Enroll a new piece.
- `PUT /api/products/:id` *(Admin)* — Update existing product.
- `DELETE /api/products/:id` *(Admin)* — Remove product from catalog.

### Orders (`/api/orders`)
- `POST /api/orders` — Create new order with server recalculated prices and inventory deduction.
- `GET /api/orders` — Fetch user orders (or all orders for admin).
- `GET /api/orders/:id` — Fetch order details and timeline.
- `PUT /api/orders/:id/status` *(Admin)* — Update delivery status.
- `DELETE /api/orders/:id` — Cancel eligible order and restore inventory.

### Administration & Metrics (`/api/admin` & `/api/users`)
- `GET /api/admin/stats` *(Admin)* — Revenue, order counts, product counts, low stock alerts.
- `GET /api/users` *(Admin)* — List all client accounts.
- `PUT /api/users/:id` *(Admin)* — Elevate or demote user roles.
- `DELETE /api/users/:id` *(Admin)* — Remove user account.

---

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@aurelle.com
ADMIN_PASSWORD=AdminAurelle123!
```

---

## Installation & Local Development

```bash
# Install dependencies
npm install

# Start full-stack development server (Express + Vite on Port 3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start
```

---

## Deployment Guide

### 1. Pushing to GitHub

```bash
# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: complete Aurelle luxury e-commerce web app"

# Link to your remote GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/aurelle.git
git branch -M main
git push -u origin main
```

---

### 2. Deploying on Render (Full-Stack Web Service)

Aurelle is pre-configured for Render with an included `render.yaml` Blueprint or manual Web Service setup:

#### Option A: 1-Click Blueprint
1. Go to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** $\to$ **Blueprint**.
3. Connect your GitHub repository.
4. Render will automatically detect `render.yaml` and configure the service.
5. Click **Apply**.

#### Option B: Manual Web Service
1. Click **New +** $\to$ **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Auto-Deploy**: `Yes`
4. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: *(A secure random string)*
   - `ADMIN_EMAIL`: `admin@aurelle.com`
   - `ADMIN_PASSWORD`: `AdminAurelle123!`
5. Click **Deploy Web Service**.

---

### 3. Deploying on Vercel

Aurelle is pre-configured with `vercel.json` and a serverless API handler (`/api/index.ts`):

1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Click **Add New...** $\to$ **Project**, then import your GitHub repository.
3. **Framework Preset**: Vite (detected automatically).
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Add Environment Variables in Project Settings:
   - `JWT_SECRET`: *(A secure random string)*
   - `ADMIN_EMAIL`: `admin@aurelle.com`
   - `ADMIN_PASSWORD`: `AdminAurelle123!`
7. Click **Deploy**. Vercel will build the frontend assets to `dist` and route `/api/*` to the serverless function.

