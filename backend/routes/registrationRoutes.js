import express from "express";
import {
  createRegistration,
  getRegistrationByChildId,
  updateRegistration,
  updateEnrollment,
} from "../controllers/registrationControllers.js";

const router = express.Router();

router.post("/", createRegistration);
router.get("/:childId", getRegistrationByChildId);
router.put("/:childId", updateRegistration);
router.patch("/:childId", updateRegistration);
// update enrollment details only
router.put("/:childId/enrollment", updateEnrollment);

export default router;
