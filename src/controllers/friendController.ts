import { Request, Response } from "express";
import Friendships from "../modules/Friendships";
import Users from "../modules/Users";

export const sendFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, friendId }: { userId: string; friendId: string } = req.body;

  if (!userId || !friendId) {
    return res
      .status(400)
      .json({ message: "userId and friendId are required" });
  }

  try {
    const existingFriendship = await Friendships.findOne({
      $or: [
        { userId, friendId, status: "pending" },
        { userId: friendId, friendId: userId, status: "pending" },
      ],
    });

    if (existingFriendship) {
      return res.status(409).json({ message: "Friend request already exists" });
    }

    const friendship = new Friendships({
      userId,
      friendId,
      status: "pending",
    });

    await friendship.save();

    return res.status(201).json({ message: "Friend request sent", friendship });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const acceptFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, friendId }: { userId: string; friendId: string } = req.body;

  if (!userId || !friendId) {
    return res
      .status(400)
      .json({ message: "userId and friendId are required" });
  }

  try {
    const friendship = await Friendships.findOneAndUpdate(
      { userId: friendId, friendId: userId, status: "pending" },
      { status: "accepted" },
      { new: true }
    );

    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    return res
      .status(200)
      .json({ message: "Friend request accepted", friendship });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const declineFriendRequest = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId, friendId }: { userId: string; friendId: string } = req.body;

  if (!userId || !friendId) {
    return res
      .status(400)
      .json({ message: "userId and friendId are required" });
  }

  try {
    const friendship = await Friendships.findOneAndUpdate(
      { userId: friendId, friendId: userId, status: "pending" },
      { status: "declined" },
      { new: true }
    );

    if (!friendship) {
      return res.status(404).json({ message: "Friend request not found" });
    }

    return res
      .status(200)
      .json({ message: "Friend request declined", friendship });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getFriendList = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const friendships = await Friendships.find({
      $or: [
        { userId, status: "accepted" },
        { friendId: userId, status: "accepted" },
      ],
    });

    const friendIds = friendships.map((friendship) => {
      return friendship.userId.toString() === userId
        ? friendship.friendId.toString()
        : friendship.userId.toString();
    });

    const friends = await Users.find({ _id: { $in: friendIds } });

    // Create a map of friend details for quick access
    const friendDetailsMap = friends.reduce((acc, friend) => {
      acc[friend._id.toString()] = {
        id: friend._id.toString(),
        name: friend.username, // Adjust according to your user model
      };
      return acc;
    }, {} as Record<string, { id: string; name: string }>);

    // Combine friendships with friend details
    const detailedFriendships = friendships.map((friendship) => {
      const friendId =
        friendship.userId.toString() === userId
          ? friendship.friendId
          : friendship.userId;
      const friendDetails = friendDetailsMap[friendId.toString()];

      return {
        ...friendship.toObject(), // Spread the existing friendship data
        friendDetails: friendDetails || null, // Add friend details or null if not found
      };
    });

    // Return the response with detailed friendships
    return res.status(200).json({
      message: "Friend list retrieved",
      friendships: detailedFriendships,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getPendingFriendRequests = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const pendingRequests = await Friendships.find({
      friendId: userId,
      status: "pending",
    });

    return res
      .status(200)
      .json({ message: "Pending friend requests retrieved", pendingRequests });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
