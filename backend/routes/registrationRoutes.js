import express from "express";
import {
  createRegistration,
  getRegistrationByChildId,
  updateRegistration,
} from "../controllers/registrationControllers.js";

const router = express.Router();

router.post("/", createRegistration);
router.get("/:childId", getRegistrationByChildId);
router.put("/:childId", updateRegistration);
router.patch("/:childId", updateRegistration);

export default router;
