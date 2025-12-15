import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";

function Login() {
  return (
    <div className="auth-shell">
      <div className="auth-card" role="region" aria-label="Sign in">
        <div className="auth-badge">Capstone Finance</div>
        <h1 className="auth-title">Personal Finance Dashboard</h1>
        <p className="auth-subtitle">
          Sign in with Google to manage your income and expenses securely.
        </p>

        <a
          className="btn btn-primary btn-lg"
          href="https://capstone-backend-c557.onrender.com/auth/google"
        >
          Continue with Google
        </a>

        <p className="auth-footnote">
          Your session is stored securely using HTTP-only cookies.
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="center-message">
        Loading authentication…
        <p className="subtle-text">
          (Backend may take ~30 seconds to wake up)
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
