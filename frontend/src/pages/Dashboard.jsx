import React, { useMemo, useReducer, useState } from "react";
import useSWR from "swr";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// ------------------ SWR fetchers ------------------
const fetcher = (url) => api.get(url).then((res) => res.data);

// External API (no key): exchange rates
const fxFetcher = (url) => fetch(url).then((r) => {
  if (!r.ok) throw new Error("External API failed");
  return r.json();
});

const COLORS = ["#0ea5e9", "#22c55e", "#eab308", "#f97316", "#ef4444"];

// ------------------ reducers ------------------
function filterReducer(state, action) {
  switch (action.type) {
    case "setCategory":
      return { ...state, category: action.value };
    case "setType":
      return { ...state, type: action.value };
    case "setSort":
      return { ...state, sort: action.value };
    default:
      return state;
  }
}

function uiReducer(state, action) {
  switch (action.type) {
    case "openCreate":
      return { ...state, modalOpen: true, editingId: null };
    case "openEdit":
      return { ...state, modalOpen: true, editingId: action.id };
    case "closeModal":
      return { ...state, modalOpen: false, editingId: null };
    default:
      return state;
  }
}

// ------------------ helpers ------------------
function toDateInputValue(d) {
  // supports ISO date string
  if (!d) return "";
  return String(d).slice(0, 10);
}

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const userId = user?._id || user?.id;

  const [filterState, dispatchFilter] = useReducer(filterReducer, {
    category: "all",
    type: "all",
    sort: "newest",
  });

  const [uiState, dispatchUI] = useReducer(uiReducer, {
    modalOpen: false,
    editingId: null,
  });

  const [toast, setToast] = useState(null); // simple toast (no extra lib)

  const safeName = user?.name || user?.email || "User";

  // ------------------ data ------------------
  const {
    data: transactions,
    error,
    isLoading,
    mutate,
  } = useSWR(userId ? `/api/transactions/${userId}` : null, fetcher);

  // External API card (USD -> INR)
  const {
    data: fxData,
    error: fxError,
    isLoading: fxLoading,
  } = useSWR(
    "https://api.frankfurter.app/latest?from=USD&to=INR",
    fxFetcher
  );

  // ------------------ computed ------------------
  const filtered = useMemo(() => {
    if (!transactions) return [];

    let list = [...transactions];

    if (filterState.type !== "all") {
      list = list.filter((t) => t.type === filterState.type);
    }

    if (filterState.category !== "all") {
      list = list.filter((t) => (t.category || "").toLowerCase() === filterState.category);
    }

    list.sort((a, b) => {
      const ad = new Date(a.date).getTime();
      const bd = new Date(b.date).getTime();
      return filterState.sort === "newest" ? bd - ad : ad - bd;
    });

    return list;
  }, [transactions, filterState]);

  const categories = useMemo(() => {
    const set = new Set();
    (transactions || []).forEach((t) => {
      if (t.category) set.add(String(t.category).toLowerCase());
    });
    return ["all", ...Array.from(set).sort()];
  }, [transactions]);

  const totals = useMemo(() => {
    const income = (filtered || [])
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    const expense = (filtered || [])
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);

    return { income, expense, net: income - expense };
  }, [filtered]);

  const pieData = useMemo(() => {
    const map = new Map();
    filtered
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const k = t.category || "Other";
        map.set(k, (map.get(k) || 0) + Number(t.amount || 0));
      });

    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  // ------------------ guards ------------------
  if (loading) return <div className="center-message">Loading…</div>;
  if (!user) return <div className="center-message">Not logged in</div>;
  if (error) return <div className="center-message">Failed to load transactions</div>;
  if (isLoading || !transactions) return <div className="center-message">Loading dashboard…</div>;

  // ------------------ CRUD actions ------------------
  async function onCreate(payload) {
    try {
      await api.post("/api/transactions", payload);
      setToast({ type: "success", msg: "Transaction added ✅" });
      dispatchUI({ type: "closeModal" });
      mutate();
    } catch (e) {
      setToast({ type: "error", msg: "Failed to add transaction" });
      console.error(e);
    }
  }

  async function onUpdate(id, payload) {
    try {
      await api.put(`/api/transactions/${id}`, payload);
      setToast({ type: "success", msg: "Transaction updated ✅" });
      dispatchUI({ type: "closeModal" });
      mutate();
    } catch (e) {
      setToast({ type: "error", msg: "Failed to update transaction" });
      console.error(e);
    }
  }

  async function onDelete(id) {
    const ok = confirm("Delete this transaction?");
    if (!ok) return;

    try {
      await api.delete(`/api/transactions/${id}`);
      setToast({ type: "success", msg: "Transaction deleted ✅" });
      mutate();
    } catch (e) {
      setToast({ type: "error", msg: "Failed to delete transaction" });
      console.error(e);
    }
  }

  const editingTx =
    uiState.editingId ? transactions.find((t) => t._id === uiState.editingId) : null;

  // ------------------ UI ------------------
  return (
    <div className="app-shell">
      {/* Simple Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="toast"
            onAnimationComplete={() => {
              setTimeout(() => setToast(null), 1800);
            }}
          >
            <span className={toast.type === "success" ? "toast-success" : "toast-error"}>
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-title">
            <span className="app-title-main">Personal Finance Dashboard</span>
            <span className="app-title-sub">Logged in as {safeName}</span>
          </div>

          <div className="app-user">
            <div className="app-avatar">{safeName.charAt(0).toUpperCase()}</div>
            <button className="btn-ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        {/* Top row: summary + external API */}
        <div className="grid grid-2">
          <div className="card card-animate">
            <div className="card-title">Overview</div>
            <div className="stat-row">
              <div className="stat">
                <div className="stat-label">Transactions</div>
                <div className="stat-value">{filtered.length}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Income</div>
                <div className="stat-value">${totals.income.toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Expense</div>
                <div className="stat-value">${totals.expense.toFixed(2)}</div>
              </div>
              <div className="stat">
                <div className="stat-label">Net</div>
                <div className={`stat-value ${totals.net >= 0 ? "pos" : "neg"}`}>
                  ${totals.net.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="actions-row">
              <button className="btn-primary" onClick={() => dispatchUI({ type: "openCreate" })}>
                + Add Transaction
              </button>
            </div>
          </div>

          <div className="card card-animate">
            <div className="card-title">External API (USD → INR)</div>
            {fxLoading && <div className="muted">Loading exchange rate…</div>}
            {fxError && <div className="error-text">Failed to load exchange rate</div>}
            {fxData && (
              <div className="fx-row">
                <div className="fx-big">
                  1 USD = {fxData?.rates?.INR?.toFixed?.(2)} INR
                </div>
                <div className="muted">Source: Frankfurter API</div>
              </div>
            )}
          </div>
        </div>

        {/* Filters + Chart */}
        <div className="grid grid-2">
          <div className="card">
            <div className="card-title">Filters</div>

            <div className="filter-grid">
              <label className="field">
                <span className="field-label">Type</span>
                <select
                  value={filterState.type}
                  onChange={(e) => dispatchFilter({ type: "setType", value: e.target.value })}
                >
                  <option value="all">All</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </label>

              <label className="field">
                <span className="field-label">Category</span>
                <select
                  value={filterState.category}
                  onChange={(e) => dispatchFilter({ type: "setCategory", value: e.target.value })}
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
                  value={filterState.sort}
                  onChange={(e) => dispatchFilter({ type: "setSort", value: e.target.value })}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Expenses by Category</div>
            {pieData.length === 0 ? (
              <div className="muted">No expense data to chart yet.</div>
            ) : (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="card">
          <div className="card-title">Transactions</div>

          {filtered.length === 0 ? (
            <div className="muted">No transactions yet. Add one to get started.</div>
          ) : (
            <div className="table">
              <div className="table-head">
                <div>Date</div>
                <div>Type</div>
                <div>Category</div>
                <div className="right">Amount</div>
                <div className="right">Actions</div>
              </div>

              <AnimatePresence initial={false}>
                {filtered.map((tx) => (
                  <motion.div
                    key={tx._id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.18 }}
                    className="table-row"
                  >
                    <div>{toDateInputValue(tx.date)}</div>
                    <div>
                      <span className={`pill ${tx.type === "income" ? "pill-green" : "pill-red"}`}>
                        {tx.type}
                      </span>
                    </div>
                    <div>{tx.category || "—"}</div>
                    <div className="right">${Number(tx.amount || 0).toFixed(2)}</div>
                    <div className="right row-actions">
                      <button
                        className="btn-small"
                        onClick={() => dispatchUI({ type: "openEdit", id: tx._id })}
                      >
                        Edit
                      </button>
                      <button className="btn-small danger" onClick={() => onDelete(tx._id)}>
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Modal (Create/Edit) */}
        <AnimatePresence>
          {uiState.modalOpen && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => dispatchUI({ type: "closeModal" })}
            >
              <motion.div
                className="modal"
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 14, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-title">
                  {editingTx ? "Edit Transaction" : "Add Transaction"}
                </div>

                <TransactionForm
                  userId={userId}
                  initial={editingTx}
                  onCancel={() => dispatchUI({ type: "closeModal" })}
                  onSubmit={(payload) => {
                    if (editingTx) return onUpdate(editingTx._id, payload);
                    return onCreate(payload);
                  }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// ------------------ Form Component ------------------
function TransactionForm({ userId, initial, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => ({
    type: initial?.type || "expense",
    amount: initial?.amount != null ? String(initial.amount) : "",
    category: initial?.category || "",
    date: initial?.date ? String(initial.date).slice(0, 10) : "",
    description: initial?.description || "",
  }));

  function change(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function submit(e) {
    e.preventDefault();

    const payload = {
      userId,
      type: form.type,
      amount: Number(form.amount),
      category: form.category.trim(),
      date: form.date,
      description: form.description.trim(),
    };

    onSubmit(payload);
  }

  return (
    <form onSubmit={submit} className="form">
      <div className="form-grid">
        <label className="field">
          <span className="field-label">Type</span>
          <select name="type" value={form.type} onChange={change}>
            <option value="income">income</option>
            <option value="expense">expense</option>
          </select>
        </label>

        <label className="field">
          <span className="field-label">Amount</span>
          <input
            name="amount"
            value={form.amount}
            onChange={change}
            inputMode="decimal"
            placeholder="e.g. 25.50"
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Category</span>
          <input
            name="category"
            value={form.category}
            onChange={change}
            placeholder="e.g. groceries"
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Date</span>
          <input type="date" name="date" value={form.date} onChange={change} required />
        </label>

        <label className="field field-full">
          <span className="field-label">Description (optional)</span>
          <input
            name="description"
            value={form.description}
            onChange={change}
            placeholder="Short note…"
          />
        </label>
      </div>

      <div className="modal-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {initial ? "Save Changes" : "Add Transaction"}
        </button>
      </div>
    </form>
  );
}
