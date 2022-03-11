import express from "express";
import globalTryCatch from "../utils/utils";
import userController from "../controllers/userController";
import authAguard from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", globalTryCatch(userController().register));
router.post("/login", globalTryCatch(userController().login));
router.get(
  "/current-user",
  globalTryCatch(authAguard),
  globalTryCatch(userController().currentUser)
);

export default router;
