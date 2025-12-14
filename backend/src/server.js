import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

/* =======================
   CORS (VERY IMPORTANT)
======================= */
app.use(
  cors({
    origin: "https://capstone-frontend-yqjn.onrender.com",
    credentials: true,
  })
);

/* =======================
   SESSION CONFIG
======================= */
app.use(
  session({
    name: "capstone.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,        // 🔥 REQUIRED for HTTPS (Render)
      sameSite: "none",    // 🔥 REQUIRED for cross-domain
      maxAge: 1000 * 60 * 60 * 24,
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
   TEST ROUTES
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
  console.log("Server running on port", PORT);
});
