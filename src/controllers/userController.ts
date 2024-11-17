import { Request, Response } from "express";

import mongoose from "mongoose";
import Users from "../modules/Users";

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
export const getUserByPhone = async (req: Request, res: Response) => {
  const { phoneNumber } = req.params;
  try {
    const user = await Users.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { _id: id, ...userWithoutId } = user.toObject();
    return res.status(200).json({ id, ...userWithoutId });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
