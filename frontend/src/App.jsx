import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";

function Login() {
  return (
    <div className="app-shell" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <a
        href="https://capstone-backend-c557.onrender.com/auth/google"
        className="btn-primary"
      >
        Sign in with Google
      </a>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <p style={{ color: "white" }}>Loading...</p>;

  return (
    <Routes>
      <Route path="/" element={user ? <Dashboard /> : <Login />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
