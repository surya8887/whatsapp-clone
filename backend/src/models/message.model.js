import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    conversation: { type: Schema.Types.ObjectId, ref: "Conversation" },
    sender: { type: Schema.Types.ObjectId, ref: "User" },
    receiver: { type: Schema.Types.ObjectId, ref: "User" }, 
    content: { type: String },
    imageOrVideoUrl: { type: String },
    contentType: { type: String, enum: ["video", "image", "text"] },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        emoji: { type: String },
      },
    ], 
    messageStatus: {
      type: String,
      enum: ["sent", "delivered", "read"], // ✅ better status values
      default: "sent",
    },
  },
  { timestamps: true }
);

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
