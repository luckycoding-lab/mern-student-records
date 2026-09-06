import { Student } from "../models/Students.js";
import { Parser } from "json2csv";
import csv from "csv-parser";
import { Readable } from "stream";

export const getStudents = async (req, res, next) => {
  try {
    const { city } = req.query;
    const query = {};
    if (city && city.trim() !== "") {
      query.city = { $regex: city.trim(), $options: "i" };
    }
    const students = await Student.find(query).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: students.length, data: students });
  } catch (err) {
    next(err);
  }
};

export const createStudent = async (req, res, next) => {
  try {
    const newStudent = await Student.create(req.body);
    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    next(err);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const deleted = await Student.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    res.status(200).json({ success: true, message: "Student record deleted" });
  } catch (err) {
    next(err);
  }
};

// 1. Export Students to CSV

export const exportStudentCSV = async (req, res, next) => {
  try {
    const student = await Student.find({}).lean();
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

    const feilds = [
      "ID",
      "Name",
      "Age",
      "City",
      "GPA",
      "Courses",
      "HasPenCard",
      "HasAdhaarCard",
    ];
    const json2csvParser = new Parser({ feilds });
    const csvData = json2csvParser.parse(flattenedData);

    res.header("Content-Type", "text/csv");
    res.attachment(`students_export_${Date.now()}.csv`);

    // Disable caching to prevent HTTP 304
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=students_export_${Date.now()}.csv`);
    
    return res.status(200).send(csvData);
  } catch (error) {
    next(err);
  }
};

// 2. Import Students from CSV
export const importStudentCSV = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded. Please attach a CSV file.' 
      });
    }

    const results = [];
    const stream = Readable.from(req.file.buffer.toString());

    stream
      .pipe(csv())
      .on('data', (row) => {
        // Handle case-insensitive headers & trim values
        const name = row.Name?.trim() || row.name?.trim();
        const rawAge = row.Age || row.age;
        const city = row.City?.trim() || row.city?.trim();
        const rawGpa = row.GPA || row.gpa;
        const rawCourses = row.Courses || row.courses || '';
        const hasPen = row.HasPenCard || row.hasPenCard || row.haspencard;
        const hasAdhaar = row.HasAdhaarCard || row.hasAdhaarCard || row.hasadhaarcard;

        const age = Number(rawAge);
        const gpa = Number(rawGpa) || 0;

        if (name && !isNaN(age) && city) {
          results.push({
            name,
            age,
            city,
            gpa,
            courses: rawCourses.split(';').map((c) => c.trim()).filter(Boolean),
            idCards: {
              hasPenCard: String(hasPen).toLowerCase() === 'yes' || String(hasPen) === 'true',
              hasAdhaarCard: String(hasAdhaar).toLowerCase() !== 'no' && String(hasAdhaar) !== 'false',
            },
          });
        }
      })
      .on('end', async () => {
        if (results.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'No valid rows found. Check that columns include Name, Age, and City.' 
          });
        }

        const inserted = await Student.insertMany(results);
        return res.status(201).json({
          success: true,
          message: `Successfully imported ${inserted.length} student records`,
          count: inserted.length,
          data: inserted,
        });
      })
      .on('error', (err) => next(err));
  } catch (err) {
    next(err);
  }
};