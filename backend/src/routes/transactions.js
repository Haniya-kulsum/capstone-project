import express from "express";
import { Transaction } from "../models/Transaction.js";

const router = express.Router();

// CREATE a transaction
router.post("/", async (req, res) => {
  try {
    const { userId, type, amount, category, date, description } = req.body;

    if (!userId || !type || amount === undefined || !category || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const tx = new Transaction({
      userId,
      type,
      amount,
      category,
      date,
      description,
    });

    await tx.save();
    res.status(201).json(tx);
  } catch (err) {
    console.error("❌ Create transaction error:", err);
    res.status(500).json({ error: err.message });
  }
});

// READ all transactions for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const txs = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(txs);
  } catch (err) {
    console.error("❌ Fetch transactions error:", err);
    res.status(500).json({ error: err.message }); // ✅ show real error
  }
});

// UPDATE a transaction
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Transaction.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Update transaction error:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE a transaction
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Transaction.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Transaction not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Delete transaction error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
