import mongoose, { Document, Schema } from "mongoose";
import { IUser } from "./Users";

interface IConversation extends Document {
  _id: mongoose.Types.ObjectId;
  participants: IUser[];
  idAdmin: string | null;
  isGroup: boolean;
  groupName?: string; // Optional if the conversation is not a group
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  participants: {
    type: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
    ],
    validate: {
      validator: (v) => {
        const uniqueParticipants = Array.from(new Set(v));
        return uniqueParticipants.length > 1;
      },
      message: "A conversation must have at least 2 unique participants.",
    },
  },
  idAdmin: {
    type: String,
    trim: true,
  },
  isGroup: { type: Boolean, default: false },
  groupName: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Middleware to update the updatedAt field on each save
conversationSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Conversations = mongoose.model<IConversation>(
  "Conversations",
  conversationSchema
);

export default Conversations;
