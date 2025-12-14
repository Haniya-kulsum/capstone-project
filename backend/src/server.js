import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import "./config/passport.js"; // passport config

dotenv.config();

const app = express();

/* =======================
   TRUST PROXY (REQUIRED)
   ======================= */
app.set("trust proxy", 1); // 🔥 REQUIRED for Render HTTPS cookies

/* =======================
   CORS
   ======================= */
app.use(
  cors({
    origin: "https://capstone-frontend-yqjn.onrender.com",
    credentials: true,
  })
);

/* =======================
   BODY PARSER
   ======================= */
app.use(express.json());

/* =======================
   SESSION (CRITICAL FIX)
   ======================= */
app.use(
  session({
    name: "capstone.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      httpOnly: true,
      secure: true,      // 🔥 MUST be true on Render
      sameSite: "none",  // 🔥 REQUIRED for cross-site cookies
      maxAge: 1000 * 60 * 60 * 24, // 1 day
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

/* =======================
   HEALTH CHECK
   ======================= */
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

/* =======================
   START SERVER
   ======================= */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
