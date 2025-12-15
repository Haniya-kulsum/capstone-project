import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import transactionsRoutes from "./routes/transactions.js";
import "./config/passport.js";
import "dotenv/config";


const app = express();

// Parse JSON
app.use(express.json());

// CORS
app.use(
  cors({
    origin: "https://capstone-frontend-yqjn.onrender.com",
    credentials: true,
  })
);

// Required for Render (secure cookies behind proxy)
app.set("trust proxy", 1);

// Session cookie
app.use(
  session({
    name: "capstone.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      secure: true,
      sameSite: "none",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB connection
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI; // support both for now
console.log("MONGO_URI present?", Boolean(MONGO_URI));

if (!MONGO_URI) {
  console.error("❌ No Mongo URI found. Set MONGO_URI in Render env vars.");
} else {
  mongoose
    .connect(MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    })
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err.message));
}
// Routes
app.use("/auth", authRoutes);
app.use("/api/transactions", transactionsRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
