import express from "express";
import { getUserById, getUserByPhone } from "../controllers/userController";
import { refreshTokenMiddleware } from "../middleware/refresh_Token";

const router = express.Router();
router.use(refreshTokenMiddleware as any);
router.get("/getone/:id", getUserById as any);
router.get("/getonebyphone/:phoneNumber", getUserByPhone as any);
export default router;
