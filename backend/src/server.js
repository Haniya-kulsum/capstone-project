import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import session from "express-session";
import passport from "passport";

import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import transactionRoutes from "./routes/transactions.js";
import "./config/passport.js";

const app = express();
const PORT = process.env.PORT || 8080;

/* =======================
   SECURITY MIDDLEWARE
======================= */
app.use(helmet());

/* =======================
   CORS (LOCAL + CLOUD RUN)
======================= */
app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://capstone-frontend-805715922298.us-central1.run.app", // production
    ],
    credentials: true,
  })
);

/* =======================
   CORE MIDDLEWARE
======================= */
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/* =======================
   SESSION CONFIG (CLOUD RUN SAFE)
======================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret-haniya",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,        // REQUIRED for HTTPS (Cloud Run)
      httpOnly: true,
      sameSite: "none",    // REQUIRED for cross-site auth
    },
  })
);

/* =======================
   PASSPORT
======================= */
app.use(passport.initialize());
app.use(passport.session());

/* =======================
   ROUTES
======================= */
app.use("/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

/* =======================
   START SERVER (AFTER DB)
======================= */
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
  });
