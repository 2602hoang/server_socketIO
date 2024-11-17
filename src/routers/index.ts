import authRouter from "./authRouter";
import friendRouter from "./friendRouter";
import userRouter from "./userRouter";
import messageRouter from "./messageRouter";
import conversationRouter from "./conversationRouter";
import { Express } from "express";
const initRoutes = (app: Express) => {
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/user", userRouter);
  app.use("/api/v1/friends", friendRouter);
  app.use("/api/v1/messages", messageRouter);
  app.use("/api/v1/conversations", conversationRouter);
};
export default initRoutes;
