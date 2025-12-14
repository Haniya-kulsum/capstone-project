import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

import passport from "./config/passport.js"; // 🔥 REQUIRED
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

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
   SESSION
======================= */
app.use(
  session({
    name: "capstone.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
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
   TEST
======================= */
app.get("/", (req, res) => res.send("Backend running"));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

