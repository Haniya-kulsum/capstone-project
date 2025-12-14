import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow flex items-center justify-between px-6 py-3 mb-4">
      <Link to="/" className="font-semibold text-lg">
        💸 Capstone Finance
      </Link>

      <div className="flex items-center gap-4">
        {user && (
          <span className="hidden sm:flex items-center gap-2 text-sm text-slate-700">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
            <span>Hello, {user.name.split(" ")[0]}</span>
          </span>
        )}

        {!user ? (
          <a
            href="https://capstone-backend-c557.onrender.com/auth/google"
            className="px-4 py-1.5 rounded-full bg-sky-600 text-white text-sm hover:bg-sky-700"
          >
            Sign in with Google
          </a>
        ) : (
          <>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-full border border-sky-600 text-sky-700 text-sm hover:bg-sky-50"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-full bg-slate-800 text-white text-sm hover:bg-slate-900"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
