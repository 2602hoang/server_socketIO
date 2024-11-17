import mongoose, { Document, Schema } from "mongoose";

interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  replierId: mongoose.Types.ObjectId[];
  content: string;
  timestamp: Date;
  isRead: boolean;
}

const messageSchema = new Schema<IMessage>({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversations",
    required: true,
  },

  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
  replierId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },
  ],
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});
messageSchema.post("save", async function (doc: IMessage) {
  await mongoose.model("Conversations").findByIdAndUpdate(doc.conversationId, {
    updatedAt: new Date(),
  });
});

const Messages = mongoose.model<IMessage>("Messages", messageSchema);

export default Messages;
