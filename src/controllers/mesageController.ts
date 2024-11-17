import { Request, Response } from "express";
import Messages from "../modules/Messages";
import Conversations from "../modules/Conversations";

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    conversationId,
    senderId,
    replierId,
    content,
  }: {
    conversationId: string;
    senderId: string;
    replierId: string;
    content: string;
  } = req.body;

  if (!conversationId || !senderId || !replierId || !content) {
    return res
      .status(400)
      .json({ message: "conversationId, senderId, and content are required." });
  }
  const existingConversation = await Conversations.findById(conversationId);

  if (!existingConversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }
  try {
    const messages = new Messages({
      conversationId,
      senderId,
      replierId,
      content,
    });

    await messages.save();

    return res
      .status(201)
      .json({ message: "Message sent successfully", messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getMessagesByConversationId = async (
  req: Request<{ conversationId: string }>,
  res: Response
): Promise<Response> => {
  const { conversationId } = req.params;
  const existingConversation = await Conversations.findById(conversationId);

  if (!existingConversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  try {
    const messages = await Messages.find({ conversationId })
      .populate("senderId", "username email phoneNumber isOnline lastLogout")
      .sort({ timestamp: 1 });
    const groupName = existingConversation.groupName;

    // const messagesWithGroupName = messages.map((message) => ({
    //   ...message.toObject(),
    //   groupName,
    // }));

    return res.status(200).json({
      message: "Messages retrieved",
      groupName,
      messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
