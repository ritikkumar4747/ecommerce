# 🎨 Luxury E-Commerce Frontend

This directory contains the user interface for the Luxury E-Commerce platform, built with **React 19**, **Vite 8**, **Tailwind CSS v4**, and **React Router v7**.

---

## ⚡ Tech Stack & Libraries

- **Framework**: React 19 (`react`, `react-dom`)
- **Build Tool**: Vite 8 with `@vitejs/plugin-react`
- **Styling**: Tailwind CSS v4 (`tailwindcss`, `@tailwindcss/vite`)
- **Routing**: React Router v7 (`react-router-dom`)
- **HTTP Client**: Axios with `withCredentials: true` for cookie session management
- **Linting**: ESLint with flat config (`eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`)

---

## 📁 Directory Structure

```text
frontend/
├── public/                # Static assets, SVG icons, Netlify _redirects
├── src/
│   ├── assets/            # Images, logos, SVG illustrations
│   ├── components/        # Reusable UI components
│   │   ├── AdminRoute.jsx     # Route protector for admin accounts
│   │   ├── Footer.jsx         # Footer navigation and brand info
│   │   ├── Logo.jsx           # SVG luxury brand emblem
│   │   ├── Navbar.jsx         # Navigation bar with auth status and cart link
│   │   ├── ProductCard.jsx    # Product display card with hover animation
│   │   ├── ProtectedRoute.jsx # Route protector for logged-in users
│   │   ├── QuickView.jsx      # Modal for instant product preview and quick add-to-cart
│   │   └── SellerRoute.jsx    # Route protector for seller accounts
│   ├── context/
│   │   └── Authcontext.jsx    # Global authentication state and session restore
│   ├── pages/
│   │   ├── AdminProducts.jsx  # Admin product moderation
│   │   ├── Cart.jsx           # Shopping cart and multi-address checkout
│   │   ├── Home.jsx           # Landing page with hero banner
│   │   ├── Login.jsx          # User authentication sign-in
│   │   ├── Orders.jsx         # Order history & invoice preview
│   │   ├── ProductDetail.jsx  # Full product view with reviews
│   │   ├── Products.jsx       # Searchable, filterable catalog
│   │   ├── Profile.jsx        # Account details and saved shipping addresses
│   │   ├── Register.jsx       # New user account registration
│   │   └── SellerDashboard.jsx# Seller inventory, product creation, and order tracking
│   ├── services/
│   │   └── Api.js             # Axios instance pre-configured with base URL and credentials
│   ├── App.jsx                # Application routes and layouts
│   ├── index.css              # Global styles & Tailwind theme directives
│   └── main.jsx               # React DOM root entrypoint
├── vercel.json            # Vercel SPA rewrites configuration
└── package.json
```

---

## 🔧 Environment Configuration

Create a `.env` file in `frontend/` for local development:

```env
VITE_API_BASE=http://localhost:5000/api
```

For production deployment (e.g., on Vercel or Netlify), set:
```env
VITE_API_BASE=https://<your-backend-domain>/api
```

---

## 🚀 Available Scripts

In the `frontend` directory, you can run:

### `npm run dev`
Starts the Vite development server at `http://localhost:5173` with Hot Module Replacement (HMR).

### `npm run build`
Compiles and bundles the application for production into the `dist/` directory.

### `npm run lint`
Runs ESLint across all `.js` and `.jsx` files to ensure code quality and React hook safety.

### `npm run preview`
Locally previews the production build output from `dist/`.

---

## 🌐 SPA Routing & Production Hosting

When deploying a Single Page Application (SPA) using React Router:
- **Vercel**: The included `vercel.json` ensures direct URL visits (e.g. `/cart` or `/orders`) rewrite to `/index.html`.
- **Netlify**: The included `public/_redirects` provides fallback routing.
