import express from "express";
import {
  createConversation,
  getConversationById,
  getConversationByUserId,
} from "../controllers/conversationController";
import { refreshTokenMiddleware } from "../middleware/refresh_Token";
import { verifyToken } from "../middleware/verify_Token";

const router = express.Router();

router.post("/create", createConversation as any);
// router.use(verifyToken as any);
router.use(refreshTokenMiddleware as any);
router.get("/getallbyid/:userId", getConversationByUserId as any);
router.get("/getonebyid/:conversationId", getConversationById as any);

export default router;
