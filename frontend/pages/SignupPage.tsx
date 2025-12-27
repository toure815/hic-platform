import React, { useState } from "react";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../utils/supabase";
import { api } from "../apiClient";

export function SignupPage() {
  // debug: expose API base from Vite env to browser console
  // @ts-ignore: import.meta.env typing may not be declared in this project
  console.log('VITE_API_BASE_URL=', import.meta.env.VITE_API_BASE_URL);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-gray-700">Loading…</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/portal" replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Step 1: Supabase signup
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { businessName, name },
        },
      });

      if (signUpError) throw signUpError;

      // Step 2: Sign in to obtain Supabase session (access token)
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInErr) throw signInErr;

      const accessToken = signInData.session?.access_token;

      // Read Vite env into a local const (ts-ignore in case ImportMeta types aren't declared)
      // @ts-ignore: import.meta.env typing may not be declared in this project
      const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      // Call Encore onboarding draft endpoint
      const res = await fetch(`${VITE_API_BASE_URL}/onboarding/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({
          stepData: { businessName, name, email },
          currentStep: 1,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Encore onboarding failed: ${res.status} ${text}`);
      }

      // Step 3: Call n8n webhook for provider onboarding
      await fetch("https://api.ecrofmedia.xyz:5678/webhook/provider-onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          businessName,
          name,
          email,
        }),
      });

      // Step 4: Redirect after signup
      navigate("/onboarding/start", { replace: true });
    } catch (err: any) {
      setError(err.message || "Signup failed");
    } finally {
      setSubmitting(false);
    }
  };

  // TEMP DEBUG: test Encore connection and log response
  async function testEncoreConnection() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      // @ts-ignore: import.meta.env typing may not be declared in this project
      const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

      console.log("[TEMP DEBUG] VITE_API_BASE_URL=", VITE_API_BASE_URL);

      const res = await fetch(`${VITE_API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const text = await res.text();
      console.log("[TEMP DEBUG] Encore /auth/me status=", res.status);
      console.log("[TEMP DEBUG] Encore /auth/me body=", text);
    } catch (err) {
      console.error("[TEMP DEBUG] testEncoreConnection error", err);
    }
  }

  // Expose for console testing in development only
  // @ts-ignore: import.meta.env typing may not be declared in this project
  const VITE_MODE = import.meta.env.MODE;
  if (VITE_MODE === "development") {
    // @ts-ignore
    window.testEncoreConnection = testEncoreConnection;
  }

  const canSubmit =
    businessName.trim().length > 0 &&
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.trim().length > 0 &&
    !submitting;

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your details below to create your account
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              type="text"
              placeholder="Enter your business name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Enter your name"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Enter your email"
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Enter your password"
              required
              autoComplete="new-password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}


          <button
            disabled={!canSubmit}
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-900 disabled:bg-black disabled:text-white disabled:opacity-70"
          >
            <span>＋</span> {submitting ? "Creating..." : "Create Account"}
          </button>
        </form>

        {/* Redirect link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}



