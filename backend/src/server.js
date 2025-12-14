import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import "./config/passport.js";
import cors from "cors";
const app = express();   // ✅ FIRST

app.set("trust proxy", 1); // ✅ AFTER app exists

const PORT = process.env.PORT || 8080;


/* =======================
   CORS
======================= */
app.use(
  cors({
    origin: true, // IMPORTANT for OAuth redirects
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
      sameSite: "none",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) =>
    console.error("❌ MongoDB connection failed:", err)
  );
