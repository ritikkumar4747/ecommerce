# E-Commerce Application

This repository contains a full-stack e-commerce platform built with a Node.js/Express backend and a React/Vite frontend. The app supports product browsing, authentication, cart management, checkout, order history, reviews, and role-based access for users, sellers, and admins.

## Features

- User authentication with register, login, logout, and token refresh
- Role-based access for users, sellers, and admins
- Product catalog with product details and review support
- Shopping cart with add, update, and remove actions
- Checkout and order creation with payment verification support via Razorpay
- Address management and order history
- Seller and admin dashboards for product and order management
- Image uploads for products using Cloudinary

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express, MongoDB with Mongoose
- Auth: JWT and refresh tokens
- Payments: Razorpay
- Storage: Cloudinary
- Testing: Mocha, Chai, Supertest, MongoDB Memory Server

## Project Structure

```text
backend/          # Express API, controllers, models, routes
frontend/         # React app and pages
scripts/          # Utility scripts for seeding and maintenance
```

## Prerequisites

Before running the app locally, make sure you have:

- Node.js 18+ installed
- npm installed
- A MongoDB instance running
- Optional: Redis, Cloudinary, and Razorpay credentials for full feature support

## Setup

1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

2. Configure environment variables

Copy the example environment file and update it with your values:

```bash
cp backend/.env.example backend/.env
```

Required values include:

- MONGO_URI
- PORT
- JWT_SECRET
- JWT_REFRESH_SECRET

Optional values for extra features:

- REDIS_HOST, REDIS_PORT, REDIS_USERNAME, REDIS_PASSWORD
- CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME
- RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET
- FRONTEND_ORIGIN

3. Run the application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The frontend will usually be available at http://localhost:5173 and the backend at http://localhost:5000.

## Optional Admin Setup

To create an admin user, run the seed script from the repository root:

```bash
node backend/scripts/seedAdmin.js youremail@example.com
```

This promotes the given email to admin if no admin account exists yet.

## Running Tests

Backend tests can be run with:

```bash
cd backend
npm test
```

## Notes

- Only one admin is allowed by design in this application.
- If you encounter module resolution issues while running scripts, run them from the repository root rather than from inside the frontend folder.
- Some features such as image uploads and payments require external service credentials.

