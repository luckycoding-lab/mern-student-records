import jwt from "jsonwebtoken";

// 1. Google OAuth Callback Handler
export const googleAuthCallback = (req, res) => {
  try {
    // Generate JWT from authenticated user profile attached by Passport
    const token = jwt.sign(
      {
        id: req.user._id || req.user.id,
        email: req.user.email,
        name: req.user.displayName || req.user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    // Set cross-domain cookie (SameSite=None; Secure is required for Vercel <-> Render)
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const clientUrl = process.env.CLIENT_URL || "https://mern-student-records.vercel.app";
    return res.redirect(`${clientUrl}/dashboard`);
  } catch (error) {
    console.error("JWT signing error in auth callback:", error);
    const clientUrl = process.env.CLIENT_URL || "https://mern-student-records.vercel.app";
    return res.redirect(`${clientUrl}/login?error=auth_failed`);
  }
};

// 2. Current Authenticated User Verification Endpoint
export const getMe = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ success: true, user: decoded });
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// 3. Logout Handler
export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};