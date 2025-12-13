import express from "express";
import passport from "passport";

const router = express.Router();

/**
 * GOOGLE LOGIN
 */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

/**
 * GOOGLE CALLBACK
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173",
  }),
  (req, res) => {
    // Redirect to frontend after successful login
    res.redirect("http://localhost:5173");
  }
);

/**
 * RETURN AUTHENTICATED USER
 */
router.get("/me", (req, res) => {
  res.json({ user: req.user || null });
});

/**
 * LOGOUT
 */
router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

export default router;
