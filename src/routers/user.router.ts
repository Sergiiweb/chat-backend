import { Router } from "express";

import {
  getUser,
  loginUser,
  registerUser,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware.checkToken, getUser);

export const userRouter = router;
