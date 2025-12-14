import React, { useReducer, useState } from "react";
import useSWR from "swr";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext.jsx";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const fetcher = (url) => api.get(url).then((res) => res.data);

const COLORS = ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#ef4444"];

function filterReducer(state, action) {
  switch (action.type) {
    case "setCategory":
      return { ...state, category: action.value };
    default:
      return state;
  }
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();

  // 🔑 IMPORTANT: prevent crash
  if (loading) return null;
  if (!user) return null;

  const [filterState, dispatchFilter] = useReducer(filterReducer, {
    category: "all",
  });

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "food",
    date: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    amount: "",
    category: "",
    date: "",
    description: "",
  });

  const {
    data: transactions,
    mutate: mutateTransactions,
  } = useSWR(`/api/transactions/${user.id}`, fetcher);

  const txList = transactions ?? [];
 
  const {
  data: rateData,
  isLoading: rateLoading,
  error: rateError,
    } = useSWR(
    "https://api.exchangerate.host/latest?base=USD&symbols=EUR",
    (url) => fetch(url).then((r) => r.json())
  );

  const filteredTx =
    filterState.category === "all"
      ? txList
      : txList.filter((t) => t.category === filterState.category);

  const total = filteredTx.reduce((sum, t) => sum + (t.amount || 0), 0);

  const byCategory = Object.values(
    filteredTx.reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = { name: t.category, value: 0 };
      }
      acc[t.category].value += t.amount || 0;
      return acc;
    }, {})
  );

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.date) return;

    await api.post("/api/transactions", {
      userId: user.id,
      type: form.type,
      amount: Number(form.amount),
      category: form.category,
      date: new Date(form.date).toISOString(),
      description: form.description,
    });

    setForm({
      type: "expense",
      amount: "",
      category: "food",
      date: "",
      description: "",
    });

    mutateTransactions();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/transactions/${id}`);
    mutateTransactions();
  };

  const startEditing = (tx) => {
    setEditingId(tx._id);
    setEditForm({
      amount: tx.amount,
      category: tx.category,
      date: tx.date.split("T")[0],
      description: tx.description || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  const saveEdit = async (id) => {
    await api.put(`/api/transactions/${id}`, {
      amount: Number(editForm.amount),
      category: editForm.category,
      date: new Date(editForm.date).toISOString(),
      description: editForm.description,
    });

    setEditingId(null);
    mutateTransactions();
  };

  const cancelEdit = () => setEditingId(null);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-title">
            <span className="app-title-main">Personal Finance Dashboard</span>
            <span className="app-title-sub">
              Logged in as {user.name} ({user.email})
            </span>
          </div>
          <div className="app-user">
            <div className="app-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <button className="btn-ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="app-main">

        {/* SUMMARY */}
        <section className="summary-row">
          <div className="card card-animate">
            <div className="card-title">Total Transactions</div>
            <div className="summary-value">{filteredTx.length}</div>
          </div>

          <div className="card card-animate">
            <div className="card-title">Total Amount</div>
            <div className="summary-value">${total.toFixed(2)}</div>
          </div>

          <div className="card card-animate">
            <div className="card-title">USD → EUR Rate</div>
            {rateLoading && <p>Loading...</p>}
            {rateError && <p>Error</p>}
            {rateData?.rates && (
              <div className="summary-value">
                {rateData.rates.EUR.toFixed(3)} EUR
              </div>
            )}
          </div>
        </section>

        {/* FILTERS */}
        <section className="card card-animate" style={{ marginBottom: "1.3rem" }}>
          <div className="card-title">Filters</div>
          <select
            value={filterState.category}
            onChange={(e) =>
              dispatchFilter({ type: "setCategory", value: e.target.value })
            }
          >
            <option value="all">All</option>
            <option value="food">Food</option>
            <option value="rent">Rent</option>
            <option value="travel">Travel</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </section>

        {/* GRID */}
        <section className="dashboard-grid">

          {/* CHART */}
          <div className="card card-animate">
            <div className="card-title">Spending by Category</div>
            {byCategory.length === 0 ? (
              <p>No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    {byCategory.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* TRANSACTION LIST */}
          <div className="card card-animate">
            <div className="card-title">Recent Transactions</div>

            <ul className="tx-list">
              {filteredTx
                .slice()
                .reverse()
                .slice(0, 10)
                .map((t) => (
                  <li key={t._id} className="tx-item">

                    {editingId === t._id ? (
                      <div className="form-grid" style={{ width: "100%" }}>
                        <input
                          type="number"
                          name="amount"
                          value={editForm.amount}
                          onChange={handleEditChange}
                        />
                        <select
                          name="category"
                          value={editForm.category}
                          onChange={handleEditChange}
                        >
                          <option value="food">Food</option>
                          <option value="rent">Rent</option>
                          <option value="travel">Travel</option>
                          <option value="shopping">Shopping</option>
                          <option value="other">Other</option>
                        </select>
                        <input
                          type="date"
                          name="date"
                          value={editForm.date}
                          onChange={handleEditChange}
                        />
                        <textarea
                          name="description"
                          value={editForm.description}
                          onChange={handleEditChange}
                        />

                        <button
                          className="btn-small"
                          style={{ background: "#22c55e" }}
                          onClick={() => saveEdit(t._id)}
                        >
                          Save
                        </button>

                        <button
                          className="btn-small"
                          style={{ background: "#9ca3af" }}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="tx-meta">
                          <span className="tx-category">
                            {t.category} – ${t.amount.toFixed(2)}
                          </span>
                          <span className="tx-desc">
                            {t.description || "No description"} —{" "}
                            {new Date(t.date).toLocaleDateString()}
                          </span>
                        </div>

                        <div style={{ display: "flex", gap: "0.4rem" }}>
                          <button
                            className="btn-small"
                            style={{ background: "#3b82f6" }}
                            onClick={() => startEditing(t)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn-small"
                            style={{ background: "#ef4444" }}
                            onClick={() => handleDelete(t._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}

                  </li>
                ))}
            </ul>
          </div>

          {/* ADD FORM */}
          <div className="card card-animate">
            <div className="card-title">Add New Transaction</div>

            <form className="form-grid" onSubmit={handleAddTransaction}>
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleFormChange}
                placeholder="Amount"
                required
              />

              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
              >
                <option value="food">Food</option>
                <option value="rent">Rent</option>
                <option value="travel">Travel</option>
                <option value="shopping">Shopping</option>
                <option value="other">Other</option>
              </select>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleFormChange}
                required
              />

              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                placeholder="Description"
              />

              <button type="submit" className="btn-small">
                Save Transaction
              </button>
            </form>
          </div>

        </section>
      </main>
    </div>
  );
}
