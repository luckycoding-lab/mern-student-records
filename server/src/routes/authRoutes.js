import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { protect } from "../middleware/auth.js";

const routes = express.Router();

const isProduction = process.env.NODE_ENV === "production";

// 1. Trigger Google Consent Screen
routes.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// 2. Google OAuth Callback
routes.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL || "https://mern-student-records.vercel.app"}/login?error=auth_failed`,
  }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      {
        id: req.user._id || req.user.id,
        displayName: req.user.displayName,
        email: req.user.email,
        avatar: req.user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Set cross-domain cookie (SameSite=None; Secure is required for Vercel <-> Render)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const clientUrl = process.env.CLIENT_URL || "https://mern-student-records.vercel.app";
    // Redirect to dashboard (or clientUrl if your main screen is at '/')
    res.redirect(`${clientUrl}/`);
  }
);

// 3. Get Current Logged-In User
routes.get("/me", protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// 4. Logout User (Must match exact same cookie flags to clear it)
routes.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export default routes;