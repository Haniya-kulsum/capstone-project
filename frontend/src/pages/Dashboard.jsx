import React, { useReducer, useState } from "react";
import useSWR from "swr";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
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

  if (loading) return <div className="center-message">Loading…</div>;
  if (!user) return <div className="center-message">Not logged in</div>;

  const safeName = user.name || user.email || "User";

  const [filterState, dispatchFilter] = useReducer(filterReducer, {
    category: "all",
  });

  const { data: transactions, error } = useSWR(
    user?.id ? `/api/transactions/${user.id}` : null,
    fetcher
  );

  if (error) {
    return <div className="center-message">Failed to load transactions</div>;
  }

  if (!transactions) {
    return <div className="center-message">Loading dashboard…</div>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-title">
            <span className="app-title-main">Personal Finance Dashboard</span>
            <span className="app-title-sub">
              Logged in as {safeName}
            </span>
          </div>
          <div className="app-user">
            <div className="app-avatar">
              {safeName.charAt(0).toUpperCase()}
            </div>
            <button className="btn-ghost" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="card card-animate">
          <div className="card-title">Dashboard is finally working 🎉</div>
          <p>You have {transactions.length} transactions.</p>
        </div>
      </main>
    </div>
  );
}
