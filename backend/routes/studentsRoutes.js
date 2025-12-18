import express from "express";
import {
  getAllStudents,
  getStudentById,
  updateStudent,
} from "../controllers/studentsController.js";

const router = express.Router();

/**
 * PATCH /api/students/:childId
 * Update student information (child, parent, medical, care facility details)
 * Body: { childInfo, parentGuardianInfo, medicalInfo, careFacilityInfo }
 */
router.patch("/:childId", updateStudent);

/**
 * GET /api/students
 * Fetch all students with their complete information
 * Response: Array of students with child, parent, medical, and facility info
 */
router.get("/", getAllStudents);

/**
 * GET /api/students/:childId
 * Fetch single student by childId with complete information
 * Response: Single student object with all related data
 */
router.get("/:childId", getStudentById);

export default router;
