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


// SECURITY
app.use(helmet());

// CORS MUST BE EXACT OR GOOGLE LOGIN FAILS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// SESSION MUST BE LIKE THIS OR LOGIN FAILS
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret-haniya",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // local HTTP
      httpOnly: true,
      sameSite: "lax",
    },
  })
);

// PASSPORT
app.use(passport.initialize());
app.use(passport.session());

// ROUTES
app.use("/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

// START SERVER
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Backend running on http://localhost:${PORT}`)
  );
});
