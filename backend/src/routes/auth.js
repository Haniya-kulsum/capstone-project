import express from "express";
import passport from "passport";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    successRedirect: "https://capstone-frontend-yqjn.onrender.com",
  })
);

router.get("/me", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json(req.user);
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("capstone.sid");
      res.json({ message: "Logged out" });
    });
  });
});

export default router;
