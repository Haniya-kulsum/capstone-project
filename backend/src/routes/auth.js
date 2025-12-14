import express from "express";
import passport from "passport";

const router = express.Router();

// 🔐 Start Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 🔁 Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  (req, res) => {
    // 🔑 THIS LINE IS CRITICAL
    req.login(req.user, () => {
      res.redirect("https://capstone-frontend-yqjn.onrender.com");
    });
  }
);


// 👤 Get logged-in user (FIXED RESPONSE SHAPE)
router.get("/me", (req, res) => {
  // 🚫 disable cache completely
  res.setHeader("Cache-Control", "no-store");

  if (!req.user) {
    return res.status(401).json({ user: null });
  }

  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
    },
  });
});

// 🚪 Logout
router.get("/logout", (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);

    req.session.destroy(() => {
      res.clearCookie("capstone.sid", {
        sameSite: "none",
        secure: true,
      });
      res.json({ success: true });
    });
  });
});

export default router;
