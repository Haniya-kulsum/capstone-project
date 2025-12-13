import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export default function AddTransactionModal({ open, onClose, onAdded }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    category: "",
    description: "",
    amount: "",
  });

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await api.post(`/api/transactions/${user._id}`, form);

    onAdded();   // refresh dashboard
    onClose();   // close modal
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <motion.div
        className="bg-white p-6 rounded-lg w-96 shadow-lg"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <h2 className="font-bold text-lg mb-4">Add Transaction</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            name="category"
            placeholder="Category"
            className="border p-2 w-full rounded"
            value={form.category}
            onChange={handleChange}
            required
          />

          <input
            name="description"
            placeholder="Description"
            className="border p-2 w-full rounded"
            value={form.description}
            onChange={handleChange}
            required
          />

          <input
            name="amount"
            type="number"
            placeholder="Amount"
            className="border p-2 w-full rounded"
            value={form.amount}
            onChange={handleChange}
            required
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
