import React, { useMemo, useReducer, useState } from "react";
import useSWR from "swr";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

const fetcher = (url) => api.get(url).then((res) => res.data);
const fxFetcher = (url) => fetch(url).then((r) => r.json());

const PIE_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#f97316", "#fb7185", "#a78bfa"];

function filtersReducer(state, action) {
  switch (action.type) {
    case "setType":
      return { ...state, type: action.value };
    case "setCategory":
      return { ...state, category: action.value };
    case "setSort":
      return { ...state, sort: action.value };
    case "setQuery":
      return { ...state, q: action.value };
    default:
      return state;
  }
}

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function formatDateInput(d) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const safeName = user?.name || user?.email || "User";
  const userId = user?._id || user?.id; // whatever you store from OAuth

  const [filters, dispatch] = useReducer(filtersReducer, {
    type: "all",
    category: "all",
    sort: "newest",
    q: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // transaction object or null
  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "General",
    date: formatDateInput(new Date()),
    description: "",
  });

  const { data: transactions, error, mutate } = useSWR(
    userId ? `/api/transactions/${userId}` : null,
    fetcher
  );

  // External API requirement (Frankfurter)
  const { data: fxData } = useSWR(
    "https://api.frankfurter.app/latest?from=USD&to=INR",
    fxFetcher
  );

  const fxRate = fxData?.rates?.INR;

  const categories = useMemo(() => {
    const set = new Set((transactions || []).map((t) => t.category).filter(Boolean));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [transactions]);

  const filtered = useMemo(() => {
    const list = [...(transactions || [])];

    const q = filters.q.trim().toLowerCase();
    const byQuery = (t) => {
      if (!q) return true;
      const hay = `${t.category} ${t.description || ""} ${t.type}`.toLowerCase();
      return hay.includes(q);
    };

    const byType = (t) => (filters.type === "all" ? true : t.type === filters.type);
    const byCategory = (t) =>
      filters.category === "all" ? true : t.category === filters.category;

    const result = list.filter((t) => byQuery(t) && byType(t) && byCategory(t));

    result.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      if (filters.sort === "oldest") return da - db;
      if (filters.sort === "amountHigh") return Number(b.amount) - Number(a.amount);
      if (filters.sort === "amountLow") return Number(a.amount) - Number(b.amount);
      return db - da; // newest default
    });

    return result;
  }, [transactions, filters]);

  const totals = useMemo(() => {
    const txs = transactions || [];
    let income = 0;
    let expense = 0;
    for (const t of txs) {
      const amt = Number(t.amount || 0);
      if (t.type === "income") income += amt;
      else expense += amt;
    }
    return {
      count: txs.length,
      income,
      expense,
      net: income - expense,
    };
  }, [transactions]);

  const expenseByCategory = useMemo(() => {
    const txs = transactions || [];
    const map = new Map();
    for (const t of txs) {
      if (t.type !== "expense") continue;
      const key = t.category || "Uncategorized";
      map.set(key, (map.get(key) || 0) + Number(t.amount || 0));
    }
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  function openCreate() {
    setEditing(null);
    setForm({
      type: "expense",
      amount: "",
      category: "General",
      date: formatDateInput(new Date()),
      description: "",
    });
    setIsModalOpen(true);
  }

  function openEdit(tx) {
    setEditing(tx);
    setForm({
      type: tx.type,
      amount: String(tx.amount ?? ""),
      category: tx.category || "General",
      date: formatDateInput(tx.date),
      description: tx.description || "",
    });
    setIsModalOpen(true);
  }

  async function saveTransaction(e) {
    e.preventDefault();

    const payload = {
      userId: String(userId),
      type: form.type,
      amount: Number(form.amount),
      category: form.category.trim(),
      date: new Date(form.date).toISOString(),
      description: form.description.trim(),
    };

    if (!payload.category || !payload.date || Number.isNaN(payload.amount)) {
      alert("Please fill in amount, category, and date.");
      return;
    }

    try {
      if (editing?._id) {
        await api.put(`/api/transactions/${editing._id}`, payload);
      } else {
        await api.post(`/api/transactions`, payload);
      }
      await mutate(); // refresh list
      setIsModalOpen(false);
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Failed to save.");
    }
  }

  async function deleteTransaction(id) {
    const ok = confirm("Delete this transaction? This cannot be undone.");
    if (!ok) return;

    try {
      await api.delete(`/api/transactions/${id}`);
      await mutate();
    } catch (err) {
      alert(err?.response?.data?.error || err.message || "Failed to delete.");
    }
  }

  if (loading) return <div className="center-message">Loading…</div>;
  if (!user) return <div className="center-message">Not logged in</div>;
  if (error) return <div className="center-message">Failed to load transactions.</div>;
  if (!transactions) return <div className="center-message">Loading dashboard…</div>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-title">Personal Finance Dashboard</div>
            <div className="brand-sub">Logged in as {safeName}</div>
          </div>

          <div className="topbar-actions">
            <div className="avatar" aria-label={`Logged in as ${safeName}`}>
              {String(safeName).charAt(0).toUpperCase()}
            </div>
            <button className="btn btn-ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="grid">
          <section className="card">
            <div className="card-head">
              <h2 className="card-title">Overview</h2>
              <button className="btn btn-primary" onClick={openCreate}>
                + Add Transaction
              </button>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="stat-label">Transactions</div>
                <div className="stat-value">{totals.count}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Income</div>
                <div className="stat-value">{formatMoney(totals.income)}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Expense</div>
                <div className="stat-value">{formatMoney(totals.expense)}</div>
              </div>
              <div className="stat stat-net">
                <div className="stat-label">Net</div>
                <div className="stat-value">{formatMoney(totals.net)}</div>
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">External API (USD → INR)</h2>
            <p className="muted">
              {fxRate ? (
                <>
                  <span className="fx-big">1 USD = {fxRate} INR</span>
                  <br />
                  Source: Frankfurter API
                </>
              ) : (
                "Loading exchange rate…"
              )}
            </p>
          </section>

          <section className="card">
            <h2 className="card-title">Filters</h2>

            <div className="filters">
              <label className="field">
                <span className="field-label">Search</span>
                <input
                  className="input"
                  value={filters.q}
                  onChange={(e) => dispatch({ type: "setQuery", value: e.target.value })}
                  placeholder="category / description…"
                />
              </label>

              <label className="field">
                <span className="field-label">Type</span>
                <select
                  className="select"
                  value={filters.type}
                  onChange={(e) => dispatch({ type: "setType", value: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>

              <label className="field">
                <span className="field-label">Category</span>
                <select
                  className="select"
                  value={filters.category}
                  onChange={(e) =>
                    dispatch({ type: "setCategory", value: e.target.value })
                  }
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c === "all" ? "All" : c}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field-label">Sort</span>
                <select
                  className="select"
                  value={filters.sort}
                  onChange={(e) => dispatch({ type: "setSort", value: e.target.value })}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="amountHigh">Amount (High)</option>
                  <option value="amountLow">Amount (Low)</option>
                </select>
              </label>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Expenses by Category</h2>

            {expenseByCategory.length === 0 ? (
              <p className="muted">No expense data to chart yet.</p>
            ) : (
              <div className="chartWrap" aria-label="Expenses by category chart">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {expenseByCategory.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatMoney(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          <section className="card card-full">
            <div className="card-head">
              <h2 className="card-title">Transactions</h2>
              <div className="muted">{filtered.length} shown</div>
            </div>

            {filtered.length === 0 ? (
              <p className="muted">No transactions yet. Add one to get started.</p>
            ) : (
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th className="right">Amount</th>
                      <th className="right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((tx) => (
                      <tr key={tx._id}>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>
                          <span
                            className={`pill ${
                              tx.type === "income" ? "pill-income" : "pill-expense"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td>{tx.category}</td>
                        <td className="muted">{tx.description || "—"}</td>
                        <td className="right">{formatMoney(tx.amount)}</td>
                        <td className="right">
                          <div className="rowActions">
                            <button
                              className="btn btn-ghost"
                              onClick={() => openEdit(tx)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              onClick={() => deleteTransaction(tx._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>

      {isModalOpen && (
        <Modal title={editing ? "Edit Transaction" : "Add Transaction"} onClose={() => setIsModalOpen(false)}>
          <form onSubmit={saveTransaction} className="form">
            <label className="field">
              <span className="field-label">Type</span>
              <select
                className="select"
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">Amount (USD)</span>
              <input
                className="input"
                inputMode="decimal"
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                placeholder="e.g., 25.50"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Category</span>
              <input
                className="input"
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                placeholder="e.g., Groceries"
                required
              />
            </label>

            <label className="field">
              <span className="field-label">Date</span>
              <input
                className="input"
                type="date"
                value={form.date}
                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                required
              />
            </label>

            <label className="field field-full">
              <span className="field-label">Description</span>
              <input
                className="input"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional note…"
              />
            </label>

            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editing ? "Save Changes" : "Add Transaction"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
