# 🛒 Luxury E-Commerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-v8-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

A modern, production-ready, full-stack luxury e-commerce platform engineered with a **React 19 / Vite** frontend and an **Express / MongoDB** backend. Includes role-based access control (User, Seller, Admin), secure HTTP-Only JWT authentication, Razorpay payment processing, Cloudinary media storage, address management, and seamless Vercel & Render deployment.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Repository Structure](#-repository-structure)
- [Environment Variables](#-environment-variables)
- [Quick Start (Local Development)](#-quick-start-local-development)
- [API Reference](#-api-reference)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [Production Deployment Guide](#-production-deployment-guide)
  - [Option A: Vercel (Frontend) + Render (Backend)](#option-a-vercel-frontend--render-backend)
  - [Option B: Automated Blueprint Deployment (Render)](#option-b-automated-blueprint-deployment-render)
- [Administrative & Utility Scripts](#-administrative--utility-scripts)
- [Security & Production Hardening](#-security--production-hardening)

---

## ✨ Features

- **🔐 Robust Authentication & Security**:
  - Dual-token architecture (short-lived `accessToken` + long-lived `refreshToken`).
  - Stored in secure, HTTP-only, `SameSite` cookies with HTTPS enforcement in production.
  - Optional Redis token blacklisting for instant token revocation on logout.
  - Security headers enforced via `helmet`.
- **👥 Role-Based Access Control (RBAC)**:
  - **User**: Browse products, manage cart, save shipping addresses, checkout, order tracking, product reviews.
  - **Seller**: Manage inventory, view seller orders, upload product imagery via Cloudinary, update order fulfillment status.
  - **Admin**: Full store oversight, product catalog moderation, and user management.
- **💳 Payments & Checkout**:
  - Seamless Razorpay order creation and cryptographic HMAC SHA256 payment signature verification.
  - Address book selection or quick-save of new shipping addresses during checkout.
- **🖼️ Media Handling**:
  - Multi-image file uploads powered by Multer and Cloudinary CDN storage.
- **⚡ Frontend Experience**:
  - High-performance UI built with React 19, Tailwind CSS v4, and React Router v7.
  - Interactive product quick-view modal, responsive navigation, and error-handling toast feedback.
  - Fully configured SPA routing with Vercel and Netlify rewrites.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7, Tailwind CSS 4, Axios |
| **Backend** | Node.js (v18+ / v20 LTS), Express 5 |
| **Database** | MongoDB with Mongoose ODM |
| **Caching** | Redis (optional; graceful fallback when disabled) |
| **Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `cookie-parser` |
| **Payments** | Razorpay SDK |
| **Media** | Cloudinary & Multer |
| **Deployment / Hosting** | Vercel (Frontend), Render (Backend), Render Blueprint |
| **Testing** | Mocha, Chai, Supertest, MongoMemoryServer |

---

## 🏛 Project Architecture

```
                      ┌────────────────────────────┐
                      │    Client (Web Browser)    │
                      └──────────────┬─────────────┘
                                     │ HTTPS / Cookies (SameSite=None, Secure)
                      ┌──────────────▼─────────────┐
                      │   Reverse Proxy / Gateway  │ (Render / Vercel Edge)
                      └──────────────┬─────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            ▼                                                 ▼
┌────────────────────────┐                       ┌─────────────────────────┐
│   Frontend (SPA)       │                       │   Backend API (Express) │
│   Vercel / Static Site │                       │   Port: 5000            │
└────────────────────────┘                       └────────────┬────────────┘
                                                              │
                     ┌───────────────────────┬────────────────┴───────────────────────┐
                     ▼                       ▼                                        ▼
          ┌─────────────────────┐ ┌──────────────────────┐               ┌───────────────────────┐
          │   MongoDB Database  │ │ Redis (Token Store)  │               │ Third-Party Services  │
          │   (Atlas / Local)   │ │ (Optional Caching)   │               │ Razorpay & Cloudinary │
          └─────────────────────┘ └──────────────────────┘               └───────────────────────┘
```

---

## 📁 Repository Structure

```text
├── backend/
│   ├── config/             # Database, Redis, Cloudinary & Razorpay configs
│   ├── controllers/        # Route controllers (Auth, Products, Cart, Orders, Address)
│   ├── middleware/         # Auth guard, RBAC, Multer file upload
│   ├── models/             # Mongoose schemas (User, Product, Cart, Order, Review)
│   ├── routes/             # Express API routes
│   ├── scripts/            # Database seed and maintenance scripts
│   ├── test/               # Mocha/Chai automated test suite
│   ├── utils/              # Token refreshes, cookie options, validators
│   ├── app.js              # Express app factory & middleware setup
│   ├── index.js            # Server entrypoint and DB connection lifecycle
│   └── package.json
│
├── frontend/
│   ├── public/             # Static assets, favicon, Netlify _redirects
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Footer, ProductCard, QuickView, etc.)
│   │   ├── context/        # React Context (AuthContext)
│   │   ├── pages/          # Application views (Home, Products, Cart, Orders, Profile, etc.)
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         # Router & route definitions
│   │   └── main.jsx        # React entrypoint
│   ├── vercel.json         # SPA rewrite rules for Vercel
│   └── package.json
│
├── render.yaml             # Render infrastructure as code blueprint
└── README.md
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `NODE_ENV` | Yes | Application environment (`development` or `production`) | `production` |
| `PORT` | No | Port on which the API listens (defaults to `5000`) | `5000` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/shop` |
| `JWT_SECRET` | Yes | Secret string for signing access tokens | `your_super_secret_jwt_key` |
| `JWT_REFRESH_SECRET` | Yes | Secret string for signing refresh tokens | `your_super_secret_refresh_key` |
| `FRONTEND_ORIGIN` | Yes | Allowed frontend origin(s) for CORS & Cookies (comma-separated) | `https://myapp.vercel.app` |
| `REDIS_HOST` | No | Redis hostname / URL (optional) | `127.0.0.1` |
| `REDIS_PORT` | No | Redis port (optional) | `6379` |
| `REDIS_PASSWORD` | No | Redis authentication password | `your_redis_password` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for product images | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | No | Cloudinary API Key | `your_api_key` |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API Secret | `your_api_secret` |
| `RAZORPAY_KEY_ID` | No | Razorpay merchant key ID | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | No | Razorpay merchant key secret | `your_razorpay_secret` |

### Frontend (`frontend/.env`)

| Variable | Required | Description | Example |
|---|:---:|---|---|
| `VITE_API_BASE` | Yes | Backend base API endpoint | `https://api.yourdomain.com/api` |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** (v18.0 or v20+ recommended)
- **npm** (v9+)
- **MongoDB** running locally or a [MongoDB Atlas](https://www.mongodb.com/atlas) URI

### 2. Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/ecommerce.git
cd ecommerce

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Local Environment
Create `backend/.env` (you can copy from `backend/.env.example`):
```bash
cp backend/.env.example backend/.env
```

Ensure `MONGO_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` are populated.

### 4. Run Locally
Open two terminal windows:

**Terminal 1 (Backend API):**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## 📡 API Reference

All backend API routes are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user account & set cookies |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue cookies |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate tokens and clear cookies |
| `POST` | `/api/auth/refresh` | Public | Refresh expired access token using refresh cookie |
| `GET` | `/api/auth/me` | Authenticated | Retrieve authenticated user profile |
| `POST` | `/api/auth/make-admin`| Authenticated | Self-promote account to admin role (demo/seed) |

### Products (`/api/products`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | List products (supports search, sort, filter) |
| `GET` | `/api/products/:id` | Public | Retrieve product details |
| `POST` | `/api/products` | Seller/Admin | Create product with up to 5 image uploads |
| `PUT` | `/api/products/:id` | Seller/Admin | Update product details |
| `DELETE`| `/api/products/:id` | Seller/Admin | Remove product |
| `GET` | `/api/products/seller/me` | Seller/Admin | Get products listed by the current seller |
| `GET` | `/api/products/:id/reviews` | Public | Fetch product reviews |
| `POST` | `/api/products/:id/reviews` | Authenticated | Submit a review for a product |

### Cart (`/api/cart`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Authenticated | Retrieve active user's shopping cart |
| `POST` | `/api/cart/add` | Authenticated | Add product item to cart |
| `PUT` | `/api/cart/update` | Authenticated | Update item quantity in cart |
| `DELETE`| `/api/cart/remove` | Authenticated | Remove item from cart |

### Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders/checkout` | Authenticated | Initialize checkout & generate Razorpay order |
| `POST` | `/api/orders/verify` | Authenticated | Verify HMAC signature of Razorpay payment |
| `GET` | `/api/orders` | Authenticated | List all orders placed by the user |
| `GET` | `/api/orders/:id` | Authenticated | Get details of a single order |
| `GET` | `/api/orders/seller/me`| Seller/Admin | List incoming orders for seller's items |
| `PUT` | `/api/orders/:id/status`| Seller/Admin | Update order processing status |

### Addresses (`/api/addresses`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/addresses` | Authenticated | List all saved shipping addresses |
| `POST` | `/api/addresses` | Authenticated | Add a new shipping address |
| `GET` | `/api/addresses/:id` | Authenticated | Get specific address |
| `PUT` | `/api/addresses/:id` | Authenticated | Update address details |
| `DELETE`| `/api/addresses/:id` | Authenticated | Delete saved address |

---

## 🧪 Testing & Quality Assurance

### Run Backend Automated Tests
Backend tests run using Mocha, Chai, and Supertest with an in-memory MongoDB server (`mongodb-memory-server`):
```bash
cd backend
npm test
```

### Run Frontend Linting & Build Verification
```bash
cd frontend

# Verify linting (0 errors, 0 warnings required)
npm run lint

# Verify production bundle build
npm run build
```

---

## 🌐 Production Deployment Guide

### Option A: Vercel (Frontend) + Render / Railway (Backend)
This is the recommended serverless/PaaS configuration.

#### 1. Deploy Frontend on Vercel
1. Import your GitHub repository on [Vercel](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. Set the **Build Command** to `npm run build` and **Output Directory** to `dist`.
4. Under **Environment Variables**, add:
   - `VITE_API_BASE=https://<your-backend-service>.onrender.com/api`
5. The included [frontend/vercel.json](file:///c:/Users/ritik/OneDrive/Desktop/summer/ecommerce/frontend/vercel.json) automatically handles SPA route fallbacks.

#### 2. Deploy Backend on Render or Railway
1. Create a **Web Service** pointing to the repository.
2. Set the **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Under **Environment Variables**, configure:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `MONGO_URI=<your-mongodb-atlas-connection-string>`
   - `JWT_SECRET=<strong-random-string>`
   - `JWT_REFRESH_SECRET=<strong-random-string>`
   - `FRONTEND_ORIGIN=https://<your-vercel-app>.vercel.app`
   - `CLOUDINARY_*` and `RAZORPAY_*` credentials

---

### Option B: Automated Blueprint Deployment (Render)
The repository includes a ready-to-use [render.yaml](file:///c:/Users/ritik/OneDrive/Desktop/summer/ecommerce/render.yaml):
1. Connect your repository on [Render Blueprints](https://dashboard.render.com/blueprints).
2. Render automatically detects `render.yaml` and sets up:
   - The Node.js Express backend web service.
   - The React static site with SPA rewrites.
3. Fill in secret environment variables when prompted (`MONGO_URI`, `FRONTEND_ORIGIN`, etc.).

---

## 🛡 Security & Production Hardening

- **Secure HTTP-Only Cookies**: In production (`NODE_ENV=production`), cookies are set with `SameSite=None` and `Secure=true`, enabling cross-origin authentication over HTTPS while preventing XSS token theft.
- **Reverse Proxy Trust**: `app.set("trust proxy", 1)` is enabled in Express to ensure proper protocol forwarding and cookie delivery behind load balancers and CDNs.
- **Dynamic CORS**: Express strictly restricts origins to matching `FRONTEND_ORIGIN` entries with `credentials: true`.
- **HMAC Payment Signature Verification**: All Razorpay webhooks/callbacks verify cryptographic signatures before orders are marked as paid.
- **Sanitized Inputs & Schema Validation**: Mongoose validation and custom data validators prevent invalid inputs and injection vectors.

---

## ⚡ Administrative & Utility Scripts

Several convenience scripts are located in `backend/scripts/`:

```bash
# Seed an initial admin user
node backend/scripts/seedAdmin.js admin@example.com

# Seed sample product catalog
node backend/scripts/seedProducts.js

# Query registered users
node backend/scripts/queryUsers.js

# Query existing products
node backend/scripts/queryProducts.js
```

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
