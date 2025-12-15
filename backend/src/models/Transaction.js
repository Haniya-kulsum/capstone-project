import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true }, // ✅ Google profile id string
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Transaction =
  mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);

