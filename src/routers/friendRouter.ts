import express from "express";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriendList,
  getPendingFriendRequests,
  sendFriendRequest,
} from "../controllers/friendController";
// import { verifyToken } from "../middleware/verify_Token";

const router = express.Router();

// router.use(verifyToken as any);
// router.get("/:id", verifyToken as any);
router.get("/friendList/:userId", getFriendList as any);
router.get("/friendrequest/:userId", getPendingFriendRequests as any);

router.post("/friendrequest", sendFriendRequest as any);
router.post("/acceptfriendrequest", acceptFriendRequest as any);
router.post("/declinefriendrequest", declineFriendRequest as any);

export default router;
