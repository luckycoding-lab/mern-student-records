import { Student } from "../models/Students.js";
import { Parser } from "json2csv";
import csv from "csv-parser";
import { Readable } from "stream";
import asyncHandler from "../utils/asyncHandler.js";
import { SAMPLE_STUDENTS } from "../utils/sampleStudents.js";

// 1. Get All Students (Scoped to User + Auto-Seeding)
export const getStudents = asyncHandler(async (req, res) => {
  const { city } = req.query;
  const userId = req.user.id;

  const count = await Student.countDocuments({ user: userId });

  if (count === 0) {
    const demoData = SAMPLE_STUDENTS.map((student) => ({
      ...student,
      user: userId,
    }));
    await Student.insertMany(demoData);
  }

  const query = { user: userId };

  if (city && city.trim() !== "") {
    query.city = { $regex: city.trim(), $options: "i" };
  }

  const students = await Student.find(query).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

// 2. Create Student (Assign to Authenticated User)
export const createStudent = asyncHandler(async (req, res) => {
  const newStudent = await Student.create({
    ...req.body,
    user: req.user.id,
  });
  res.status(201).json({ success: true, data: newStudent });
});

// 3. Update Student (Owner-Scoped)
export const updateStudent = asyncHandler(async (req, res) => {
  const updated = await Student.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) {
    res.status(404);
    throw new Error("Student record not found or unauthorized");
  }

  res.status(200).json({ success: true, data: updated });
});

// 4. Delete Student (Owner-Scoped)
export const deleteStudent = asyncHandler(async (req, res) => {
  const deleted = await Student.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!deleted) {
    res.status(404);
    throw new Error("Student record not found or unauthorized");
  }

  res.status(200).json({ success: true, message: "Student record deleted" });
});

// 5. Export Students to CSV (Owner-Scoped)
export const exportStudentCSV = asyncHandler(async (req, res) => {
  // Only query students belonging to the authenticated user
  const student = await Student.find({ user: req.user.id }).lean();

  const flattenedData = student.map((s) => ({
    ID: s._id.toString(),
    Name: s.name,
    Age: s.age,
    City: s.city,
    GPA: s.gpa,
    Courses: s.courses ? s.courses.join("; ") : "",
    HasPenCard: s.idCards?.hasPenCard ? "Yes" : "No",
    HasAdhaarCard: s.idCards?.hasAdhaarCard ? "Yes" : "No",
  }));

  const fields = [
    "ID",
    "Name",
    "Age",
    "City",
    "GPA",
    "Courses",
    "HasPenCard",
    "HasAdhaarCard",
  ];

  const json2csvParser = new Parser({ fields });
  const csvData = json2csvParser.parse(flattenedData);

  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=students_export_${Date.now()}.csv`
  );

  return res.status(200).send(csvData);
});

// 6. Import Students from CSV (Assign to Authenticated User)
export const importStudentCSV = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded. Please attach a CSV file.");
  }

  const results = [];
  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csv())
    .on("data", (row) => {
      const name = row.Name?.trim() || row.name?.trim();
      const rawAge = row.Age || row.age;
      const city = row.City?.trim() || row.city?.trim();
      const rawGpa = row.GPA || row.gpa;
      const rawCourses = row.Courses || row.courses || "";
      const hasPen = row.HasPenCard || row.hasPenCard || row.haspencard;
      const hasAdhaar =
        row.HasAdhaarCard || row.hasAdhaarCard || row.hasadhaarcard;

      const age = Number(rawAge);
      const gpa = Number(rawGpa) || 0;

      if (name && !isNaN(age) && city) {
        results.push({
          user: req.user.id, // Attach ownership
          name,
          age,
          city,
          gpa,
          courses: rawCourses
            .split(";")
            .map((c) => c.trim())
            .filter(Boolean),
          idCards: {
            hasPenCard:
              String(hasPen).toLowerCase() === "yes" ||
              String(hasPen) === "true",
            hasAdhaarCard:
              String(hasAdhaar).toLowerCase() !== "no" &&
              String(hasAdhaar) !== "false",
          },
        });
      }
    })
    .on("end", async () => {
      try {
        if (results.length === 0) {
          return res.status(400).json({
            success: false,
            message:
              "No valid rows found. Check that columns include Name, Age, and City.",
          });
        }

        const inserted = await Student.insertMany(results);
        return res.status(201).json({
          success: true,
          message: `Successfully imported ${inserted.length} student records`,
          count: inserted.length,
          data: inserted,
        });
      } catch (insertError) {
        next(insertError);
      }
    })
    .on("error", (streamError) => next(streamError));
});