import express from "express";
import {
  getMessagesByConversationId,
  sendMessage,
} from "../controllers/mesageController";

const router = express.Router();

router.post("/send", sendMessage as any);
router.get("/getmessage/:conversationId", getMessagesByConversationId as any);
export default router;
