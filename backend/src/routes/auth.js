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
    failureRedirect: "/login",
    session: true,
  }),
  (req, res) => {
    // ✅ SUCCESS → redirect to frontend dashboard
res.redirect("https://5173-49618724-acde-4874-98c1-2b48b7c4a3b7.cs-us-east1-yeah.cloudshell.dev");
  );

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
