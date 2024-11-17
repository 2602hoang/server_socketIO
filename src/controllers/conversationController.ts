import { Request, Response } from "express";
import Conversations from "../modules/Conversations";
import Users from "../modules/Users";
import mongoose from "mongoose";
export const createConversation = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { participants, isGroup, groupName, idAdmin } = req.body;

  if (!participants || participants.length < 2) {
    return res
      .status(400)
      .json({ message: "At least two participants are required." });
  }

  const uniqueParticipants = Array.from(new Set(participants));
  if (uniqueParticipants.length < 2) {
    return res
      .status(400)
      .json({ message: "Duplicate participant IDs are not allowed." });
  }

  const existingParticipants = await Users.find({
    _id: { $in: uniqueParticipants },
  });

  if (existingParticipants.length !== uniqueParticipants.length) {
    return res.status(400).json({
      message: "One or more participant IDs do not exist in the database.",
    });
  }

  const name = `Group Chat ${uniqueParticipants.length}`;
  try {
    const conversation = new Conversations({
      participants: uniqueParticipants,
      idAdmin,
      isGroup,
      groupName: name || groupName,
    });

    await conversation.save();

    return res.status(201).json({
      message: "Conversation created successfully",
      conversation,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getConversationByUserId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const userId = req.params.userId;

  try {
    const conversations = await Conversations.find({
      participants: userId,
    })
      .populate("participants")
      .sort({ updatedAt: -1 });

    if (conversations.length === 0) {
      return res.status(200).json({
        message: "No conversations found for this user.",
        status: null,
      });
    }

    const conversationsWithDifferentIds = conversations.map((conversation) => {
      const differentParticipantIds = conversation.participants
        .filter((participant) => participant._id.toString() !== userId)
        .map((participant) => ({
          id: participant._id.toString(),
          username: participant.username,
        }));

      return {
        ...conversation.toObject(),
        differentParticipantIds,
      };
    });

    return res.status(200).json(conversationsWithDifferentIds);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while retrieving conversations.",
      status: true,
    });
  }
};

export const getConversationById = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const conversationId = req.params.conversationId;

  // Validate the conversation ID format
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID format." });
  }

  try {
    const conversation = await Conversations.findById(conversationId).populate(
      "participants"
    );

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found." });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};
