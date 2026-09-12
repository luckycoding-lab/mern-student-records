import express from "express";
import multer from "multer";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentCSV,
  importStudentCSV,
} from "../controllers/studentController.js";

import {
  studentSchema,
  updateStudentSchema,
  validateBody,
} from "../validators/studentValidator.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// Multer memory storage for parsing CSV without disk writes
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
});

// Enforce authentication across all student endpoints
router.use(protect);

// 1. CSV Endpoints (Placed before /:id parameter routes)
router.get("/export/csv", exportStudentCSV);
router.post("/import/csv", upload.single("file"), importStudentCSV);

// 2. Collection Root (/)
router
  .route("/")
  .get(getStudents)
  .post(validateBody(studentSchema), createStudent);

// 3. Item Endpoints (/:id)
router
  .route("/:id")
  .patch(validateBody(updateStudentSchema), updateStudent)
  .delete(deleteStudent);

export default router;