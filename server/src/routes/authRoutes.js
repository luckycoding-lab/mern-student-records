import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { protect } from "../middleware/auth.js";

const routes = express.Router();
// 1. Trigger Google Consent Screen
routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// 2. Google OAuth Callback
routes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      {
        id: req.user.id,
        displayName: req.user.displayName,
        email: req.user.email,
        avatar: req.user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    // Set secure HTTP-Only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Must be true on HTTPS
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // 'none' allows cross-domain cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    // Redirect to React frontend
    res.redirect(`${process.env.CLIENT_URL}/`);
  },
);

// 3. Get Current Logged-In User
routes.get("/me", protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});
// 4. Logout User
routes.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export default routes;
