import express from "express";
import {
  getPaymentPlans,
  updatePaymentPlan,
  getPrograms,
  updateProgram,
  getRoomTypes,
  updateRoomType,
} from "../controllers/planControllers.js";

const router = express.Router();

/* ===== PAYMENT PLAN ===== */
router.get("/payment-plans", getPaymentPlans);
router.put("/payment-plans/:paymentplanid", updatePaymentPlan);

/* ===== PROGRAMS ===== */
router.get("/programs", getPrograms);
router.put("/programs/:programid", updateProgram);

/* ===== ROOM TYPES ===== */
router.get("/room-types", getRoomTypes);
router.put("/room-types/:roomtypeid", updateRoomType);

export default router;
