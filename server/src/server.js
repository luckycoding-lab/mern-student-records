import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import cookieParser from "cookie-parser";
import passport from "passport";

import { connectDB } from "./config/db.js";
import { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentCSV,
  importStudentCSV,
} from "./controllers/studentController.js";

import {
  studentSchema,
  updateStudentSchema,
  validateBody,
} from "./validators/studentValidator.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust Render reverse proxy (ensures secure cookies and HTTPS headers work)
app.set("trust proxy", 1);

// 1. CORS Configuration (Allows both local dev and your live Vercel domain)
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://mern-student-records.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
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

// 4. Auth Routes
app.use("/api/auth", authRoutes);

// Multer memory storage for parsing CSV without disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

// 5. CSV Routes (Placed BEFORE dynamic /:id routes to prevent parameter collisions)
app.get("/api/students/export/csv", exportStudentCSV);
app.post("/api/students/import/csv", upload.single("file"), importStudentCSV);

// 6. Student CRUD Routes
app.get("/api/students", getStudents);
app.post("/api/students", validateBody(studentSchema), createStudent);
app.patch("/api/students/:id", validateBody(updateStudentSchema), updateStudent);
app.delete("/api/students/:id", deleteStudent);

// 7. Global Error Handler
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 8. Server Launch
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server launch aborted due to DB connection failure.", error);
  }
};

start();