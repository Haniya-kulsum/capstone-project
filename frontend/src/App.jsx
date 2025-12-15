import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function LoginPage() {
  return (
    <div className="login-screen">
      <div className="login-card card-animate">
        <h1>Capstone Finance</h1>
        <p>
          Sign in with your Google account to view and manage your personal
          expense dashboard.
        </p>

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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-message">Loading…</div>;
  }

  if (!user) {
    return <LoginPage />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </BrowserRouter>
    </AuthProvider>
  );
}
