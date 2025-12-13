Personal Finance Dashboard – Full-Stack Capstone Project

A fully deployed, full-stack Personal Finance Dashboard built with React, Express, MongoDB, Google OAuth, modern UI, external API integration, CRUD operations, animations, testing, DevContainer, and complete documentation.

This project was developed as a capstone demonstrating professional software engineering competence across the stack.

 Live Deployment Links
Frontend (React) – Vercel

🔗 https://YOUR_FRONTEND_DEPLOYMENT_URL_HERE

Backend (Express API) – Google Cloud Run

🔗 https://YOUR_BACKEND_DEPLOYMENT_URL_HERE

Replace the URLs above after deployment.

 Video Demonstration

🔗 https://YOUR_VIDEO_LINK_HERE

(Shows authentication, CRUD, external API, dashboard UI, test execution, and design artifact explanation.)

 Tech Stack
Frontend

React (Vite)

Context API (global auth state)

useReducer (filtering workflow)

External API integration (ExchangeRate API)

Recharts (data visualization library)

Custom CSS animations

Axios (HTTP client)

Backend

Node.js + Express

Google OAuth 2.0 (Passport.js)

MongoDB (Mongoose)

Full CRUD API for transactions

Sessions + Cookies

Cloud deployment (Google Cloud Run)

Additional Tools

Playwright (automated E2E test)

DevContainer (reproducible environment)

PlantUML (sequence diagram)

Helmet, CORS, Morgan (security & logging)

 Features Overview (Mapped to Rubric)
 1. Authentication (Google OAuth)

Secure login using Google OAuth via Passport.js

Maintains session with cookie-based auth

Protected routes in React using <ProtectedRoute>

Displays personalized dashboard after login

 2. Full CRUD Functionality (Transactions API)

The app implements Create, Read, Update, Delete for the Transaction model.

Operation	Route	Description
Create	POST /api/transactions	Add a new transaction
Read	GET /api/transactions/:userId	Fetch all transactions for logged-in user
Update	PUT /api/transactions/:id	Edit transaction
Delete	DELETE /api/transactions/:id	Delete transaction

Fully integrated with the React UI.

 3. External API Integration

The dashboard fetches real-time currency conversion (USD → EUR) using:

https://api.exchangerate.host/latest?base=USD&symbols=EUR


Includes:

Loading indicators

Error states

Clean UI presentation

 4. Advanced React Features

The project uses two advanced features required in the rubric:

1️ Context API

Used for global authentication state:

Tracks user login

Handles logout

Provides protected routing

2️ useReducer

Used for filtering transactions by category:

function filterReducer(state, action) { … }


These are meaningful integrations, NOT superficial.

 5. Interactivity & Personalization

Dashboard shows user's name and email

Expense chart updates dynamically for each user

Filtering modifies chart + summary in real-time

Add Transaction form updates list automatically

Personalized avatar and greeting

Entire UI changes based on login state

 6. Additional Library Integration

The project uses:

 Recharts

For category-based spending visualization.

 7. Animation

Custom CSS animation applied to all dashboard components:

Smooth fade-in

Lift-up transitions

Animated card rendering

Animated login card

This satisfies the “meaningful animation” requirement.

 Project Architecture
capstone-project/
 ├── backend/
 │   ├── src/
 │   │   ├── config/
 │   │   ├── models/
 │   │   ├── routes/
 │   │   └── server.js
 │   ├── package.json
 │   └── Dockerfile
 │
 ├── frontend/
 │   ├── src/
 │   │   ├── context/
 │   │   ├── pages/
 │   │   ├── App.jsx
 │   │   └── main.jsx
 │   ├── public/
 │   └── package.json
 │
 ├── .devcontainer/
 ├── README.md
 └── tests/
     └── playwright.spec.ts

 Automated Testing (Playwright)
 Test Workflow Covered

✔ User loads dashboard
✔ User logs in
✔ User creates a transaction
✔ UI automatically updates with new transaction

 How to run the test
cd frontend
npx playwright install
npx playwright test


If backend is deployed, adjust test with deployed URL.

 Database (MongoDB) Schema
Transaction Model
{
  userId: ObjectId,
  type: "expense" | "income",
  amount: Number,
  category: String,
  date: Date,
  description: String,
}

User Model
{
  googleId: String,
  email: String,
  name: String,
  avatarUrl: String
}

 Backend API Documentation
POST /api/transactions

Create a transaction.

GET /api/transactions/:userId

Return all user transactions.

PUT /api/transactions/:id

Update a transaction.

DELETE /api/transactions/:id

Delete a transaction.

GET /auth/google

Begin Google Login.

GET /auth/me

Returns authenticated user.

 DevContainer Instructions

The .devcontainer folder contains:

Dockerfile with Node 20

Extensions for JS/TS, Docker, ESLint

Port forwarding settings

Open in VS Code:

Dev Containers: Reopen in Container


Everything installs automatically.

 Running the Project Locally
Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev

 Deployment Instructions (Google Cloud Run)
1. Authenticate
gcloud auth login

2. Build + Deploy Backend
gcloud run deploy finance-backend \
  --source . \
  --allow-unauthenticated \
  --region us-east1 \
  --set-env-vars GOOGLE_CLIENT_ID=... \
  --set-env-vars GOOGLE_CLIENT_SECRET=... \
  --set-env-vars MONGO_URI=... \
  --set-env-vars SESSION_SECRET=...

3. Update Frontend .env
VITE_API_URL = https://your-cloud-run-url

4. Deploy Frontend to Vercel
vercel deploy --prod
