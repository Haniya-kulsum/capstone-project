import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";

const app = express();

/* =======================
   TRUST PROXY (RENDER)
======================= */
app.set("trust proxy", 1);

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
   MIDDLEWARE
======================= */
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

/* =======================
   ROUTES
======================= */
app.use("/auth", authRoutes);

/* =======================
   START SERVER
======================= */
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

/* =======================
   DB CONNECT
======================= */
connectDB()
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error", err));
