import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
// Handles Login, Register, and displays appropriate error/success messages.
// On successful login/register, calls onSuccess(user, isAdmin).
export function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 10);
  }, []);

  const resetForm = () => {
    setEmail(""); setPassword(""); setConfirmPassword("");
    setUsername(""); setError(null); setSuccessMsg(null);
  };

  const switchMode = (m) => { setMode(m); resetForm(); };

  // ── REGISTER ──
  const handleRegister = async () => {
    setError(null);
    if (!username.trim()) return setError("Username is required.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      // 1. Create auth user in Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });

      if (signUpError) throw signUpError;

      // 2. Insert profile row with role = 'user'
      // This assumes you have a `profiles` table with columns:
      //   id (uuid, FK to auth.users), username (text), role (text)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert([{ id: data.user.id, username, role: "user" }]);

      if (profileError) throw profileError;

      setSuccessMsg("Account created! You can now log in.");
      setTimeout(() => switchMode("login"), 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── LOGIN ──
  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      // 1. Sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // 2. Fetch profile to get role
      // Admin accounts are set by manually updating role to 'admin' in Supabase dashboard
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("username, role")
        .eq("id", data.user.id)
        .single();

      if (profileError) throw profileError;

      const isAdmin = profile.role === "admin";
      onSuccess(
        { ...data.user, username: profile.username, role: profile.role },
        isAdmin
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "login") handleLogin();
    else handleRegister();
  };

  const inputStyle = {
    width: "100%",
    background: "#faf7f2",
    border: "1px solid #e0d9ce",
    borderRadius: "3px",
    padding: "11px 14px",
    fontFamily: "'DM Mono', monospace",
    fontSize: "11px",
    letterSpacing: "0.5px",
    color: "#1a1610",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px",
    letterSpacing: "2.5px",
    textTransform: "uppercase",
    color: "#b0a898",
    display: "block",
    marginBottom: "6px",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `rgba(240,236,230,${loaded ? 0.88 : 0})`,
        backdropFilter: loaded ? "blur(14px)" : "blur(0px)",
        transition: "background 0.4s, backdrop-filter 0.4s",
        padding: "40px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          border: "1px solid #e0d9ce",
          borderRadius: "6px",
          width: "100%",
          maxWidth: "420px",
          padding: "44px 44px 40px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.14)",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s, transform 0.4s",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px", letterSpacing: "4px",
            color: "#c0b8a8", textTransform: "uppercase",
            marginBottom: "10px",
          }}>
            REEL · {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
          </div>
          <h2 style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "34px", fontWeight: "700",
            color: "#1a1610", letterSpacing: "-0.5px",
          }}>
            {mode === "login" ? "Welcome back." : "Join REEL."}
          </h2>
        </div>

        {/* Form fields */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {mode === "register" && (
            <div>
              <label style={labelStyle}>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
              />
            </div>
          )}

          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
              onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
            />
          </div>

          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
              onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>

          {mode === "register" && (
            <div>
              <label style={labelStyle}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
              />
            </div>
          )}
        </div>

        {/* Error / Success messages */}
        {error && (
          <div style={{
            marginTop: "16px",
            padding: "10px 14px",
            background: "#fff5f3",
            border: "1px solid #f0c4bc",
            borderRadius: "3px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px", letterSpacing: "0.5px",
            color: "#B83A10",
          }}>
            ✕ {error}
          </div>
        )}

        {successMsg && (
          <div style={{
            marginTop: "16px",
            padding: "10px 14px",
            background: "#f3fff5",
            border: "1px solid #bcf0c4",
            borderRadius: "3px",
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px", letterSpacing: "0.5px",
            color: "#3A8A3A",
          }}>
            ✓ {successMsg}
          </div>
        )}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            marginTop: "24px",
            width: "100%",
            background: loading ? "#c0b8a8" : "#1a1610",
            border: "none",
            borderRadius: "3px",
            padding: "13px",
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px", letterSpacing: "3px",
            color: "#f5f0e8",
            textTransform: "uppercase",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => { if (!loading) e.target.style.background = "#2e2820"; }}
          onMouseLeave={(e) => { if (!loading) e.target.style.background = "#1a1610"; }}
        >
          {loading ? "PLEASE WAIT..." : mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </button>

        {/* Mode switcher */}
        <div style={{
          marginTop: "20px",
          textAlign: "center",
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px", letterSpacing: "1px", color: "#b0a898",
        }}>
          {mode === "login" ? "No account? " : "Already a member? "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px", letterSpacing: "1px",
              color: "#9A5A30", padding: 0,
              textDecoration: "underline",
            }}
          >
            {mode === "login" ? "Register here" : "Sign in instead"}
          </button>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "18px", right: "20px",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px", letterSpacing: "2px", color: "#ccc",
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#B83A10")}
          onMouseLeave={(e) => (e.target.style.color = "#ccc")}
        >
          [ CLOSE ]
        </button>
      </div>
    </div>
  );
}
