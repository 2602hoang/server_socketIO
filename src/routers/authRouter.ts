import express from "express";
import {
  login,
  logout,
  refreshToken,
  register,
} from "../controllers/authController";
import { log } from "console";

const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/logout/:userId", logout);

router.post("/refreshToken", refreshToken);

export default router;
