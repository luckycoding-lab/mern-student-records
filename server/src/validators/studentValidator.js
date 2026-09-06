import { z } from 'zod';

const nameRegex = /^[a-zA-Z\s.'-]+$/;
const cityRegex = /^[a-zA-Z\s.-]+$/;

export const studentSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(nameRegex, 'Name can only contain alphabetic letters'),
  age: z
    .number({ required_error: 'Age is required' })
    .int('Age must be an integer')
    .min(16, 'Minimum age is 16')
    .max(60, 'Maximum age is 60'),
  city: z
    .string({ required_error: 'City is required' })
    .trim()
    .min(2, 'City must be at least 2 characters')
    .regex(cityRegex, 'City can only contain alphabetic letters'),
  gpa: z.number().min(0).max(10).default(0),
  courses: z.array(z.string().trim().min(1)).optional().default([]),
  idCards: z
    .object({
      hasPenCard: z.boolean().default(false),
      hasAdhaarCard: z.boolean().default(true),
    })
    .optional(),
});

export const updateStudentSchema = studentSchema.partial();

export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const formattedErrors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }
  req.body = result.data;
  next();
};