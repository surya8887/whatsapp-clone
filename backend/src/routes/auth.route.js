import { Router } from "express";
import {
  SendOTP,
  verifyOTP,
  updateProfile,
} from "../controllers/auth.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/send").post(SendOTP);
router.route("/verify").post(verifyOTP);

// Protected Routes

router
  .route("/update-profile")
  .put(verifyJWT, upload.single("profilePicture"), updateProfile);

export default router;
