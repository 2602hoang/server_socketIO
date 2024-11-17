import mongoose, { Document, Schema } from "mongoose";

interface IFriendship extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  friendId: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined" | "blocked";
  createdAt: Date;
}

const friendshipSchema = new Schema<IFriendship>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  friendId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined", "blocked"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a unique index for userId and friendId combination
friendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });

const Friendships = mongoose.model<IFriendship>(
  "Friendships",
  friendshipSchema
);

export default Friendships;
