import React from "react";

export default function Home() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Capstone Finance</h1>

      <p className="text-slate-700 mb-6">
        Sign in with your Google account to view and manage your personal expense
        dashboard.
      </p>

      <a
        href="https://capstone-backend-c557.onrender.com/auth/google"
        className="inline-block px-4 py-2 rounded-lg bg-sky-600 text-white text-sm hover:bg-sky-700"
      >
        Sign in with Google
      </a>
    </main>
  );
}
