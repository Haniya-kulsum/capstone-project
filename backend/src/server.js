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
   TRUST PROXY (Cloud Run)
======================= */
app.set("trust proxy", 1);

/* =======================
   SECURITY
======================= */
app.use(helmet());

/* =======================
   PARSERS
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* =======================
   LOGGING
======================= */
app.use(morgan("dev"));

/* =======================
   CORS
======================= */
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/* =======================
   SESSION
======================= */
app.use(
  session({
    secret: process.env.SESSION_SECRET || "capstone-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());

/* =======================
   ROUTES
======================= */
app.use("/auth", authRoutes);
app.use("/transactions", transactionRoutes);

/* =======================
   SERVER START
======================= */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* =======================
   DB CONNECT (BACKGROUND)
======================= */
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) =>
    console.error("❌ MongoDB connection failed:", err)
  );
