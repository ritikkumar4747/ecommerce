# ⚙️ Luxury E-Commerce Backend API

The RESTful API backend for the Luxury E-Commerce application, built using **Node.js**, **Express 5**, and **MongoDB**.

---

## 🛠 Tech Stack

- **Runtime**: Node.js (v18+ / v20 LTS)
- **Framework**: Express 5
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (`accessToken` and `refreshToken`) stored in HTTP-Only cookies
- **Security**: `helmet`, `cors`, `cookie-parser`, `bcryptjs`, Express trust proxy
- **Payments**: Razorpay API with HMAC SHA256 signature verification
- **Media**: Multer & Cloudinary
- **Testing**: Mocha, Chai, Supertest, MongoDB Memory Server

---

## 📁 Directory Structure

```text
backend/
├── config/             # Connection configurations (db, redis, cloudinary, razorpay)
├── controllers/        # Business logic controllers
│   ├── address.controller.js
│   ├── cart.controller.js
│   ├── order.controller.js
│   ├── product.controller.js
│   ├── review.controller.js
│   └── user.authentication.js
├── middleware/         # Express middleware
│   ├── admin.middleware.js
│   ├── rolemiddleware.js
│   ├── upload.middleware.js
│   └── user.middleware.js
├── models/             # Mongoose database models (User, Product, Cart, Order, Review)
├── routes/             # API routes definitions
├── scripts/            # Database seed and maintenance scripts
├── test/               # Mocha/Chai automated tests (address, auth, checkout)
├── utils/              # Token refreshes, cookie options, validators
├── app.js              # Express app factory with middleware & route mounting
├── index.js            # Server entrypoint and DB connection lifecycle
└── package.json
```

---

## 🔧 Environment Variables

Create `.env` inside `backend/`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
FRONTEND_ORIGIN=http://localhost:5173

# Optional Services
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

---

## 🚀 Available Scripts

### `npm run dev`
Starts the API with `nodemon` for auto-reload during local development.

### `npm start`
Starts the production server (`node index.js`).

### `npm test`
Runs the automated Mocha/Chai test suite with in-memory MongoDB.

---

## 🔒 Security Architecture

- **HTTP-Only Cookies**: Tokens are never accessible to client-side JavaScript, preventing XSS-based credential theft.
- **Environment-Aware Cookie Policies**:
  - `NODE_ENV === "production"`: `sameSite: "none"` and `secure: true` for cross-origin HTTPS deployments.
  - Development: `sameSite: "lax"` and `secure: false` for simple localhost support.
- **Reverse Proxy Support**: `app.set("trust proxy", 1)` is enabled to ensure cookies are delivered properly behind Render, Railway, AWS ALB, and Cloudflare.
- **Origin Validation**: Strict CORS checks against configured `FRONTEND_ORIGIN`.
