import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import "./config/passport.js";
import transactionsRoutes from "./routes/transactions.js";

const app = express();

// ✅ REQUIRED to parse JSON bodies
app.use(express.json());

app.use(
  cors({
    origin: "https://capstone-frontend-yqjn.onrender.com",
    credentials: true,
  })
);

// 🔥 REQUIRED FOR RENDER
app.set("trust proxy", 1);

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

app.use("/auth", authRoutes);

// ✅ THIS WAS MISSING
app.use("/api/transactions", transactionsRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
