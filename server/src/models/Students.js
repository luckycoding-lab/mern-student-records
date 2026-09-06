import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Student name is Required"],
      trim: true,
      minLenth: [2, "Name must be at least 2 character long"],
    },
    age: {
      type: Number,
      required: [true, "Age is Required"],
      min: [16, "Minimum age is Required"],
      max: [30, "Maximum age is Required"],
    },
    city: {
      type: String,
      required: [true],
      trim: true,
    },
    gpa: {
      type: Number,
      min: 0.0,
      max: 10.0,
      default: 0.0,
    },
    courses: {
      type: [String],
      default: [],
    },
    idCards: {
      hasPenCard: { type: Boolean, default: false },
      hasAdhaarCard: { type: Boolean, default: true },
    },
  },
  { timestamp: true },
);

studentSchema.index({city: 1, age: 1});
export const Student = mongoose.model("Student", studentSchema);