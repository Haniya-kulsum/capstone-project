import { AuthProvider, useAuth } from "./context/AuthContext";

function Login() {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Capstone Finance</h1>
        <p>
          Sign in with your Google account to view and manage your personal
          expense dashboard.
        </p>

        <a
          className="btn-primary"
          href="https://capstone-backend-c557.onrender.com/auth/google"
        >
          Sign in with Google
        </a>
      </div>
    </div>
  );
}

import Dashboard from "./pages/Dashboard";


function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="center-message">Loading...</div>;
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
  

