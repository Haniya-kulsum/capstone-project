import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";

import authRoutes from "./routes/auth.js";

// 🔥 THIS LINE IS WHAT YOU WERE MISSING
import "./config/passport.js";

const app = express();

app.use(
  cors({
    origin: "https://capstone-frontend-yqjn.onrender.com",
    credentials: true,
  })
);

app.use(
  session({
    name: "capstone.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,        // Render = HTTPS
      sameSite: "none",    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend running");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
