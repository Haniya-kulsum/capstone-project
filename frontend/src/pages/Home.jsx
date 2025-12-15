import React from "react";

export default function Home() {
  const API = import.meta.env.VITE_API_URL || "https://capstone-backend-c557.onrender.com";

  return (
    <div className="center-message" style={{ minHeight: "100vh" }}>
      <div className="card card-pad" style={{ width: "min(520px, 100%)" }}>
        <div className="card-title" style={{ fontSize: 20 }}>
          Capstone Finance
        </div>

        <div className="card-sub" style={{ marginBottom: 14 }}>
          Sign in with your Google account to view and manage your personal expense dashboard.
        </div>

        <a
          className="btn btn-primary"
          href={`${API}/auth/google`}
          style={{ width: "100%", display: "inline-block", textAlign: "center" }}
        >
          Continue with Google
        </a>
      </div>
    </div>
  );
}
