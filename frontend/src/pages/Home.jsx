import React from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Link } from "react-router-dom";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">
        Personal Finance Dashboard 💰
      </h1>

      <p className="text-slate-700 mb-6">
        Track your expenses and see a quick overview of where your money goes.
        Login with Google to see your personalized dashboard.
      </p>

      {loading ? (
        <p>Checking login…</p>
      ) : user ? (
        <div className="space-y-4">
          <p>Welcome back, {user.name}! 🎉</p>

          <Link
            to="/dashboard"
            className="inline-block px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <a
          href="https://capstone-backend-c557.onrender.com/auth/google"
          className="inline-block px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700"
        >
          Sign in with Google
        </a>
      )}
    </main>
  );
}
