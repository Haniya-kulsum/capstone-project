import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";

/* ---------------- LOGIN PAGE ---------------- */

function LoginPage() {
  return (
    <div className="login-screen">
      <div className="login-card card-animate">
        <h1>Capstone Finance</h1>
        <p>
          Sign in with your Google account to view and manage your personal
          expense dashboard.
        </p>

        {/* 🔑 OAuth MUST be a redirect */}
        <a
          href="https://capstone-backend-c557.onrender.com/auth/google"
          className="btn-primary"
        >
          <span className="google-icon">G</span>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}

/* -------------- PROTECTED ROUTE -------------- */

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-message">Loading your dashboard…</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
}

/* ------------------- APP -------------------- */

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
