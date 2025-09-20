import { Router } from "express";
import { SendOTP, verifyOTP } from "../controllers/auth.controller.js";
const router = Router();

router.route("/send").post(SendOTP);
router.route("/verify").post(verifyOTP);

export default router;

