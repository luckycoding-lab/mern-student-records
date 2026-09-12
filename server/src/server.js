import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";

import { connectDB } from "./config/db.js";
import { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import studentRoutes from "./routes/studentRoutes.js"; // 1. Import student router
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Render reverse proxy (ensures secure cookies and HTTPS headers work)
app.set("trust proxy", 1);

// 1. CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL,
  "https://mern-student-records.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS policy violation: Origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 2. Body & Cookie Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Passport Initialization
app.use(passport.initialize());
configurePassport();

// 4. Mount Application Routers
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes); // 2. Mount student router

// 5. Global Error Handler
app.use(errorHandler);

// 6. Server Launch
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log("🚀 Server listening on port:", PORT);
    });
  } catch (error) {
    console.error("Server launch aborted due to DB connection failure.", error);
  }
};

start();