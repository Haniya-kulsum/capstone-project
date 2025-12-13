import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

// ⭐ REQUIRED so browser sends session cookies (connect.sid)
axios.defaults.withCredentials = true;

// ⭐ Backend base URL
const API_BASE = "http://localhost:3000";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // GET LOGGED-IN USER FROM BACKEND
  // ------------------------------
  async function fetchUser() {
    try {
      const res = await axios.get(`${API_BASE}/auth/me`);
      setUser(res.data.user || null);
    } catch (err) {
      console.error("Auth error:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUser();
  }, []);

  // ------------------------------
  // LOGOUT
  // ------------------------------
  const logout = async () => {
    try {
      await axios.get(`${API_BASE}/auth/logout`);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
