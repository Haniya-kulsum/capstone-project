import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import "./config/passport.js";
import authRoutes from "./routes/auth.js";

const app = express();

/* 🔥 REQUIRED FOR RENDER */
app.set("trust proxy", 1);

/* CORS */
app.use(
  cors({
    origin: "https://capstone-frontend-yqjn.onrender.com",
    credentials: true,
  })
);

/* SESSION */
app.use(
  session({
    name: "capstone.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* PASSPORT */
app.use(passport.initialize());
app.use(passport.session());

/* ROUTES */
app.use("/auth", authRoutes);

/* TEST */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* AUTH CHECK */
app.get("/auth/me", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json(req.user);
});

/* START */
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
