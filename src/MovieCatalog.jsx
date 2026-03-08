import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://itasutpvggvqhjwpjiju.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0YXN1dHB2Z2d2cWhqd3BqaWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5OTUxNjksImV4cCI6MjA4ODU3MTE2OX0.5lMwubRoXfcSShg-jBO1tPTQpwy3xSfRhZP4UnJXPD4";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── TMDB CONFIG ──────────────────────────────────────────────────────────────
const API_KEY = "1d0b000b8bbf7d95bdfa6bfd876956e5";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// TMDB genre ID → name map
const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western",
};

// Accent colors cycled per card
const ACCENTS = [
  "#C47D1A", "#2E6FA3", "#8A7A3A", "#3A8A3A",
  "#B5671A", "#9A5A30", "#B83A10", "#A83060",
  "#4A7A8A", "#7A3A8A", "#3A5A8A", "#8A3A4A",
];

function formatIndex(n) {
  return String(n + 1).padStart(3, "0");
}

function useInView(ref) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.08 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return inView;
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
// Handles Login, Register, and displays appropriate error/success messages.
// On successful login/register, calls onSuccess(user, isAdmin).
function AuthModal({ onClose, onSuccess }) {
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

// ─── MOVIE CARD ───────────────────────────────────────────────────────────────
function MovieCard({ movie, rank, onClick, isAdmin, onAdminEdit, onAdminDelete }) {
  const ref = useRef();
  const inView = useInView(ref);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(movie)}
      style={{
        cursor: "pointer",
        borderRadius: "6px",
        overflow: "hidden",
        background: "#ffffff",
        border: `1px solid ${hovered ? movie.accent + "55" : "#e8e2da"}`,
        transition: `opacity 0.65s ${rank * 0.06}s, transform 0.65s ${rank * 0.06}s, border-color 0.3s, box-shadow 0.3s`,
        opacity: inView ? 1 : 0,
        transform: inView
          ? (hovered ? "translateY(-6px)" : "translateY(0)")
          : "translateY(28px)",
        boxShadow: hovered
          ? `0 20px 56px ${movie.accent}22, 0 4px 20px rgba(0,0,0,0.10)`
          : "0 2px 12px rgba(0,0,0,0.06)",
        position: "relative",
      }}
    >
      {/* Index stamp */}
      <div style={{
        position: "absolute", top: "10px", left: "12px",
        fontFamily: "'DM Mono', monospace",
        fontSize: "10px", letterSpacing: "2px",
        color: hovered ? movie.accent : "rgba(255,255,255,0.55)",
        zIndex: 3, transition: "color 0.3s", fontWeight: "500",
      }}>
        {movie.index}
      </div>

      {/* Score badge */}
      <div style={{
        position: "absolute", top: "10px", right: "10px", zIndex: 3,
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${hovered ? movie.accent + "66" : "rgba(0,0,0,0.08)"}`,
        borderRadius: "4px", padding: "4px 9px",
        display: "flex", alignItems: "center", gap: "5px",
        transition: "border-color 0.3s",
      }}>
        <span style={{ color: "#e6a817", fontSize: "11px", lineHeight: 1 }}>★</span>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "12px", fontWeight: "500",
          color: "#1a1a1a", letterSpacing: "0.5px",
        }}>
          {movie.rating.toFixed(1)}
        </span>
      </div>

      {/* Poster */}
      <div style={{ position: "relative", height: "256px", overflow: "hidden" }}>
        <img
          src={movie.poster}
          alt={movie.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
            transform: hovered ? "scale(1.06)" : "scale(1)",
            filter: hovered ? "brightness(0.9)" : "brightness(0.82)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #ffffff 0%, rgba(255,255,255,0.1) 40%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: 0, left: 0,
          height: "3px", width: hovered ? "100%" : "0%",
          background: movie.accent,
          transition: "width 0.45s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>

      {/* Card body */}
      <div style={{ padding: "18px 20px 20px", background: "#fff" }}>
        <h3 style={{
          margin: "0 0 4px",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "20px", fontWeight: "700",
          color: hovered ? "#0a0a0a" : "#1c1c1c",
          letterSpacing: "-0.3px", lineHeight: 1.15,
          transition: "color 0.25s",
        }}>
          {movie.title}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px", color: "#aaa", letterSpacing: "1px",
          }}>
            {movie.year}
          </span>
          <span style={{ color: "#ddd", fontSize: "8px" }}>·</span>
          {movie.genre.map((g, gi) => (
            <span key={g} style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px", letterSpacing: "1.5px",
              textTransform: "uppercase",
              color: hovered ? movie.accent : "#bbb",
              transition: "color 0.3s",
            }}>
              {g}{gi < movie.genre.length - 1 ? " /" : ""}
            </span>
          ))}
        </div>

        <p style={{
          margin: "0 0 16px",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic", fontSize: "14px",
          color: hovered ? "#555" : "#999",
          lineHeight: "1.65",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          transition: "color 0.3s",
        }}>
          {movie.synopsis}
        </p>

        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          paddingTop: "12px",
          borderTop: `1px solid ${hovered ? movie.accent + "22" : "#f0ece6"}`,
          transition: "border-color 0.3s",
        }}>
          <div style={{ display: "flex", gap: "3px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{
                fontSize: "11px",
                color: i <= Math.round(movie.rating / 2) ? "#e6a817" : "#e0dbd4",
              }}>★</span>
            ))}
          </div>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px", color: "#ccc", letterSpacing: "1px",
          }}>
            {movie.reviews >= 1000
              ? (movie.reviews / 1000).toFixed(1) + "K"
              : movie.reviews} VOTES
          </span>
        </div>

        {/* Admin controls — only visible to admins */}
        {isAdmin && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              marginTop: "14px",
              paddingTop: "12px",
              borderTop: "1px dashed #f0c4bc",
              display: "flex", gap: "8px",
            }}
          >
            <button
              onClick={() => onAdminEdit(movie)}
              style={{
                flex: 1,
                background: "none",
                border: "1px solid #2E6FA3",
                borderRadius: "3px",
                padding: "6px 0",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "9px", letterSpacing: "1.5px",
                color: "#2E6FA3",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#2E6FA3";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "none";
                e.target.style.color = "#2E6FA3";
              }}
            >
              EDIT
            </button>
            <button
              onClick={() => onAdminDelete(movie)}
              style={{
                flex: 1,
                background: "none",
                border: "1px solid #B83A10",
                borderRadius: "3px",
                padding: "6px 0",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "9px", letterSpacing: "1.5px",
                color: "#B83A10",
                transition: "background 0.2s, color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "#B83A10";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "none";
                e.target.style.color = "#B83A10";
              }}
            >
              DELETE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MODAL (Movie Detail) ─────────────────────────────────────────────────────
function Modal({ movie, onClose, isAdmin, onAdminEdit }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (movie) setTimeout(() => setLoaded(true), 10);
    else setLoaded(false);
  }, [movie]);
  if (!movie) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `rgba(240,236,230,${loaded ? 0.82 : 0})`,
        backdropFilter: loaded ? "blur(12px)" : "blur(0px)",
        transition: "background 0.4s, backdrop-filter 0.4s",
        padding: "40px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          maxWidth: "880px", width: "100%",
          maxHeight: "88vh", overflow: "hidden",
          borderRadius: "6px",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "scale(1) translateY(0)" : "scale(0.95) translateY(20px)",
          transition: "all 0.45s cubic-bezier(0.4,0,0.2,1)",
          border: `1px solid ${movie.accent}33`,
          boxShadow: `0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px #e0d9d0`,
        }}
      >
        {/* Poster */}
        <div style={{ width: "360px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
          <img src={movie.poster} alt={movie.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to right, transparent 55%, #faf7f2 100%)",
          }} />
          <div style={{
            position: "absolute", top: 0, left: 0,
            width: "4px", height: "100%", background: movie.accent,
          }} />
          <div style={{
            position: "absolute", bottom: "16px", left: "20px",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "96px", fontWeight: "700",
            color: "rgba(0,0,0,0.04)",
            lineHeight: 1, letterSpacing: "-4px", userSelect: "none",
          }}>
            {movie.index}
          </div>
        </div>

        {/* Info */}
        <div style={{
          flex: 1, background: "#faf7f2",
          padding: "36px 40px",
          display: "flex", flexDirection: "column", gap: "18px",
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {/* Admin edit button inside modal */}
            {isAdmin && (
              <button
                onClick={() => { onClose(); onAdminEdit(movie); }}
                style={{
                  background: "none",
                  border: "1px solid #2E6FA3",
                  borderRadius: "3px",
                  padding: "6px 14px",
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "9px", letterSpacing: "2px",
                  color: "#2E6FA3",
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => { e.target.style.background = "#2E6FA3"; e.target.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.target.style.background = "none"; e.target.style.color = "#2E6FA3"; }}
              >
                EDIT MOVIE
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                letterSpacing: "2px", color: "#bbb", padding: "0",
                marginLeft: "auto",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.color = movie.accent)}
              onMouseLeave={(e) => (e.target.style.color = "#bbb")}
            >
              [ CLOSE ]
            </button>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {movie.genre.map((g) => (
              <span key={g} style={{
                fontFamily: "'DM Mono', monospace", fontSize: "9px",
                letterSpacing: "2.5px", textTransform: "uppercase", color: movie.accent,
              }}>{g}</span>
            ))}
            <span style={{ color: "#ddd" }}>—</span>
            <span style={{
              fontFamily: "'DM Mono', monospace", fontSize: "9px",
              color: "#bbb", letterSpacing: "2px",
            }}>{movie.year}</span>
          </div>

          <h2 style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "40px", fontWeight: "700",
            color: "#111", lineHeight: 1.05, letterSpacing: "-1px",
          }}>
            {movie.title}
          </h2>

          <div style={{ height: "1px", background: `linear-gradient(to right, ${movie.accent}, transparent)` }} />

          <p style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", fontSize: "16px",
            color: "#777", lineHeight: "1.75",
          }}>
            {movie.synopsis}
          </p>

          <div style={{ display: "flex", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <span key={i} style={{
                fontSize: "16px",
                color: i <= Math.round(movie.rating / 2) ? "#e6a817" : "#e0dbd4",
              }}>★</span>
            ))}
          </div>

          <div style={{
            marginTop: "auto",
            display: "flex", alignItems: "flex-end", justifyContent: "space-between",
            borderTop: "1px solid #ede8e0", paddingTop: "20px",
          }}>
            <div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "60px", fontWeight: "700",
                color: movie.accent, lineHeight: 1, letterSpacing: "-2px",
              }}>
                {movie.rating.toFixed(1)}
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: "9px",
                color: "#bbb", letterSpacing: "2px", marginTop: "4px",
              }}>
                TMDB SCORE / 10
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "24px", fontWeight: "700",
                color: "#ccc", letterSpacing: "-0.5px",
              }}>
                {movie.reviews.toLocaleString()}
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace", fontSize: "9px",
                color: "#bbb", letterSpacing: "2px",
              }}>
                TOTAL VOTES
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN MOVIE FORM MODAL ───────────────────────────────────────────────────
// Used for both Add Movie and Edit Movie (admin only).
// When `editMovie` is provided, it pre-fills the form for editing.
// On save, calls onSave(formData). On cancel, calls onClose().
//
// NOTE: This saves to your Supabase `movies` table.
// Assumes columns: title, year, genre (text[]), synopsis, poster_url, tmdb_rating
function AdminMovieModal({ editMovie, onClose, onSave }) {
  const [loaded, setLoaded] = useState(false);
  const [title, setTitle] = useState(editMovie?.title || "");
  const [year, setYear] = useState(editMovie?.year || "");
  const [genre, setGenre] = useState(editMovie?.genre?.join(", ") || "");
  const [synopsis, setSynopsis] = useState(editMovie?.synopsis || "");
  const [posterUrl, setPosterUrl] = useState(editMovie?.poster || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 10);
  }, []);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) return setError("Title is required.");
    if (!year.trim() || isNaN(year)) return setError("Valid year is required.");

    setLoading(true);
    try {
      const formData = {
        title: title.trim(),
        year: year.trim(),
        genre: genre.split(",").map((g) => g.trim()).filter(Boolean),
        synopsis: synopsis.trim(),
        poster_url: posterUrl.trim(),
      };

      if (editMovie?.supabaseId) {
        // UPDATE existing movie in Supabase
        const { error: updateError } = await supabase
          .from("movies")
          .update(formData)
          .eq("id", editMovie.supabaseId);
        if (updateError) throw updateError;
      } else {
        // INSERT new movie into Supabase
        const { error: insertError } = await supabase
          .from("movies")
          .insert([formData]);
        if (insertError) throw insertError;
      }

      onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#faf7f2", border: "1px solid #e0d9ce",
    borderRadius: "3px", padding: "10px 14px",
    fontFamily: "'DM Mono', monospace", fontSize: "11px",
    letterSpacing: "0.5px", color: "#1a1610",
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "'DM Mono', monospace", fontSize: "9px",
    letterSpacing: "2.5px", textTransform: "uppercase",
    color: "#b0a898", display: "block", marginBottom: "6px",
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
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
          background: "#fff", border: "1px solid #e0d9ce",
          borderRadius: "6px", width: "100%", maxWidth: "480px",
          padding: "44px 44px 40px", maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 32px 80px rgba(0,0,0,0.14)",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s, transform 0.4s",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: "9px",
            letterSpacing: "4px", color: "#B83A10",
            textTransform: "uppercase", marginBottom: "10px",
          }}>
            ADMIN · {editMovie ? "EDIT MOVIE" : "ADD MOVIE"}
          </div>
          <h2 style={{
            margin: 0, fontFamily: "'Cormorant Garamond', serif",
            fontSize: "32px", fontWeight: "700", color: "#1a1610",
          }}>
            {editMovie ? `Editing: ${editMovie.title}` : "Add New Film"}
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Movie title" style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
              onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
            />
          </div>
          <div>
            <label style={labelStyle}>Year *</label>
            <input type="text" value={year} onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2024" style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
              onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
            />
          </div>
          <div>
            <label style={labelStyle}>Genres (comma-separated)</label>
            <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Action, Drama" style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
              onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
            />
          </div>
          <div>
            <label style={labelStyle}>Poster URL</label>
            <input type="text" value={posterUrl} onChange={(e) => setPosterUrl(e.target.value)}
              placeholder="https://..." style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
              onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
            />
          </div>
          <div>
            <label style={labelStyle}>Synopsis</label>
            <textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Movie synopsis..." rows={4}
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.6" }}
              onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
              onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
            />
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: "16px", padding: "10px 14px",
            background: "#fff5f3", border: "1px solid #f0c4bc",
            borderRadius: "3px", fontFamily: "'DM Mono', monospace",
            fontSize: "10px", color: "#B83A10",
          }}>
            ✕ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
          <button
            onClick={handleSave} disabled={loading}
            style={{
              flex: 1, background: loading ? "#c0b8a8" : "#1a1610",
              border: "none", borderRadius: "3px", padding: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: "10px",
              letterSpacing: "2px", color: "#f5f0e8",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = "#2e2820"; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = "#1a1610"; }}
          >
            {loading ? "SAVING..." : editMovie ? "SAVE CHANGES" : "ADD FILM"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "none",
              border: "1px solid #e0d9ce", borderRadius: "3px", padding: "12px",
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
              fontSize: "10px", letterSpacing: "2px", color: "#b0a898",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#B83A10"; e.target.style.color = "#B83A10"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#e0d9ce"; e.target.style.color = "#b0a898"; }}
          >
            CANCEL
          </button>
        </div>

        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "18px", right: "20px",
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: "9px",
            letterSpacing: "2px", color: "#ccc", transition: "color 0.2s",
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

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
// Admin only. Confirms before deleting a movie from Supabase.
function DeleteConfirmModal({ movie, onClose, onConfirm }) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 10);
  }, []);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      // Delete from Supabase `movies` table by supabaseId
      // If movie came from TMDB (no supabaseId), we store its tmdb id as reference
      const { error: deleteError } = await supabase
        .from("movies")
        .delete()
        .eq("id", movie.supabaseId);
      if (deleteError) throw deleteError;
      onConfirm(movie);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!movie) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
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
          background: "#fff", border: "1px solid #f0c4bc",
          borderRadius: "6px", width: "100%", maxWidth: "400px",
          padding: "44px", boxShadow: "0 32px 80px rgba(184,58,16,0.12)",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s, transform 0.4s",
        }}
      >
        <div style={{
          fontFamily: "'DM Mono', monospace", fontSize: "9px",
          letterSpacing: "4px", color: "#B83A10",
          textTransform: "uppercase", marginBottom: "12px",
        }}>
          ADMIN · DELETE FILM
        </div>
        <h2 style={{
          margin: "0 0 12px",
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: "28px", fontWeight: "700", color: "#1a1610",
        }}>
          Remove "{movie.title}"?
        </h2>
        <p style={{
          margin: "0 0 24px",
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic", fontSize: "15px", color: "#999",
          lineHeight: "1.6",
        }}>
          This will permanently delete this film from the catalog. This action cannot be undone.
        </p>

        {error && (
          <div style={{
            marginBottom: "16px", padding: "10px 14px",
            background: "#fff5f3", border: "1px solid #f0c4bc",
            borderRadius: "3px", fontFamily: "'DM Mono', monospace",
            fontSize: "10px", color: "#B83A10",
          }}>
            ✕ {error}
          </div>
        )}

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={handleDelete} disabled={loading}
            style={{
              flex: 1, background: loading ? "#e0b0a8" : "#B83A10",
              border: "none", borderRadius: "3px", padding: "12px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: "10px",
              letterSpacing: "2px", color: "#fff",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = "#8A2A08"; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = "#B83A10"; }}
          >
            {loading ? "DELETING..." : "YES, DELETE"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, background: "none",
              border: "1px solid #e0d9ce", borderRadius: "3px", padding: "12px",
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
              fontSize: "10px", letterSpacing: "2px", color: "#b0a898",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.borderColor = "#9A5A30")}
            onMouseLeave={(e) => (e.target.style.borderColor = "#e0d9ce")}
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MovieCatalog() {
  // ── Movie state (from teammates) ──
  const [movies, setMovies] = useState([]);
  const [allGenres, setAllGenres] = useState(["ALL"]);
  const [activeGenre, setActiveGenre] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Auth state (Elias — Authentication & Role Logic) ──
  const [currentUser, setCurrentUser] = useState(null);   // Supabase user object + profile
  const [isAdmin, setIsAdmin] = useState(false);           // true if role === 'admin'
  const [authChecked, setAuthChecked] = useState(false);   // prevents flash before session loads
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Admin action state ──
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [editMovie, setEditMovie] = useState(null);        // movie being edited
  const [deleteMovie, setDeleteMovie] = useState(null);    // movie pending deletion

  // ── On mount: restore session if user was previously logged in ──
  useEffect(() => {
    // Check if there's an active Supabase session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      }
      setAuthChecked(true);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Fetch profile row to determine role ──
  const loadUserProfile = async (user) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      setCurrentUser({ ...user, username: profile.username, role: profile.role });
      setIsAdmin(profile.role === "admin");
    }
  };

  // ── Called by AuthModal on successful login/register ──
  const handleAuthSuccess = (user, adminStatus) => {
    setCurrentUser(user);
    setIsAdmin(adminStatus);
    setShowAuthModal(false);
  };

  // ── Logout ──
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  // ── Fetch movies from TMDB (unchanged from teammates) ──
  useEffect(() => {
    setLoading(true);
    setError(null);

    const isSearching = searchQuery.trim().length > 0;
    const url = isSearching
      ? `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${page}`
      : `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch movies");
        return r.json();
      })
      .then((data) => {
        const mapped = data.results
          .filter((m) => m.poster_path)
          .map((m, i) => ({
            id: m.id,
            title: m.title,
            year: m.release_date ? m.release_date.slice(0, 4) : "N/A",
            genre: m.genre_ids.slice(0, 2).map((id) => GENRE_MAP[id] || "Other"),
            rating: m.vote_average,
            reviews: m.vote_count,
            synopsis: m.overview || "No synopsis available.",
            poster: IMG_BASE + m.poster_path,
            accent: ACCENTS[i % ACCENTS.length],
            index: formatIndex((page - 1) * 20 + i),
          }));

        setMovies(mapped);
        setTotalPages(Math.min(data.total_pages, 10));

        const genres = ["ALL", ...new Set(mapped.flatMap((m) => m.genre))];
        setAllGenres(genres);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [searchQuery, page]);

  // Reset page when search changes
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveGenre("ALL");
    setSearchQuery(searchInput);
  };

  // ── Admin: handle movie deleted — remove from local state immediately ──
  const handleMovieDeleted = (deletedMovie) => {
    setMovies((prev) => prev.filter((m) => m.id !== deletedMovie.id));
    setDeleteMovie(null);
  };

  // ── Admin: handle movie saved (added or edited) — refresh list ──
  const handleMovieSaved = () => {
    setShowAddMovie(false);
    setEditMovie(null);
    // Re-trigger fetch by briefly toggling page
    setLoading(true);
    setPage((p) => p); // triggers useEffect re-run
  };

  const filtered = activeGenre === "ALL"
    ? movies
    : movies.filter((m) => m.genre.includes(activeGenre));

  // Don't render until we've checked for an existing session
  if (!authChecked) return null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #f5f0e8; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #ede8e0; }
        ::-webkit-scrollbar-thumb { background: #ccc; }
        input:focus { outline: none; }
        textarea:focus { outline: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>

        {/* ── MASTHEAD ── */}
        <div style={{
          padding: "48px 56px 36px",
          display: "grid", gridTemplateColumns: "1fr auto",
          alignItems: "end", borderBottom: "1px solid #e0d9ce",
        }}>
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: "9px",
              letterSpacing: "3px", color: "#b8b0a0",
              textTransform: "uppercase", marginBottom: "14px",
            }}>
              Issue 08 &nbsp;·&nbsp; {new Date().getFullYear()}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "22px" }}>
              <h1 style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: "700", fontSize: "72px",
                letterSpacing: "-4px", lineHeight: 0.9, color: "#1a1610",
              }}>
                REEL
              </h1>
              <div style={{ width: "1px", height: "52px", background: "#d0c8bc", marginBottom: "4px" }} />
              <div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "9px",
                  letterSpacing: "4px", color: "#a89f90",
                  textTransform: "uppercase", marginBottom: "6px",
                }}>
                  A FILM CATALOG
                </div>
                <div style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: "italic", fontSize: "15px", color: "#b0a898",
                }}>
                  Powered by TMDB
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Search + Auth controls */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", paddingBottom: "6px" }}>

            {/* ── AUTH NAV AREA ── */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {currentUser ? (
                <>
                  {/* Logged-in user info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isAdmin && (
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "8px",
                        letterSpacing: "2px", color: "#fff",
                        background: "#B83A10", borderRadius: "3px",
                        padding: "3px 8px", textTransform: "uppercase",
                      }}>
                        ADMIN
                      </span>
                    )}
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: "10px",
                      letterSpacing: "1px", color: "#9A5A30",
                    }}>
                      {currentUser.username || currentUser.email}
                    </span>
                  </div>

                  {/* Admin: Add Movie button */}
                  {isAdmin && (
                    <button
                      onClick={() => setShowAddMovie(true)}
                      style={{
                        background: "#1a1610", border: "none",
                        borderRadius: "3px", padding: "8px 14px",
                        cursor: "pointer", fontFamily: "'DM Mono', monospace",
                        fontSize: "9px", letterSpacing: "2px", color: "#f5f0e8",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
                      onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
                    >
                      + ADD FILM
                    </button>
                  )}

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none",
                      border: "1px solid #e0d9ce",
                      borderRadius: "3px", padding: "8px 14px",
                      cursor: "pointer", fontFamily: "'DM Mono', monospace",
                      fontSize: "9px", letterSpacing: "2px", color: "#b0a898",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.borderColor = "#B83A10";
                      e.target.style.color = "#B83A10";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.borderColor = "#e0d9ce";
                      e.target.style.color = "#b0a898";
                    }}
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                /* Not logged in — show Sign In button */
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: "#1a1610", border: "1px solid #1a1610",
                    borderRadius: "3px", padding: "8px 18px",
                    cursor: "pointer", fontFamily: "'DM Mono', monospace",
                    fontSize: "9px", letterSpacing: "2px", color: "#f5f0e8",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
                  onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
                >
                  SIGN IN
                </button>
              )}
            </div>

            {/* Search bar (unchanged from teammates) */}
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: "0" }}>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search films..."
                style={{
                  background: "#fff",
                  border: "1px solid #ddd6ca",
                  borderRight: "none",
                  borderRadius: "3px 0 0 3px",
                  padding: "10px 16px",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "1px",
                  color: "#1a1610",
                  width: "220px",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#1a1610",
                  border: "1px solid #1a1610",
                  borderRadius: "0 3px 3px 0",
                  padding: "10px 16px",
                  cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "2px",
                  color: "#f5f0e8",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
                onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
              >
                SEARCH
              </button>
              {searchQuery && (
                <button
                  onClick={() => { setSearchInput(""); setSearchQuery(""); setPage(1); }}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", fontSize: "9px",
                    letterSpacing: "2px", color: "#bbb", marginLeft: "12px",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "#B83A10")}
                  onMouseLeave={(e) => (e.target.style.color = "#bbb")}
                >
                  ✕ CLEAR
                </button>
              )}
            </form>
          </div>
        </div>

        {/* ── FILTER BAR (unchanged from teammates) ── */}
        <div style={{
          padding: "14px 56px",
          display: "flex",
          borderBottom: "1px solid #e0d9ce",
          alignItems: "center",
          background: "#f0ebe2",
          flexWrap: "wrap",
          gap: "4px",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px", letterSpacing: "3px",
            color: "#c0b8a8", textTransform: "uppercase",
            marginRight: "16px",
          }}>
            FILTER
          </span>
          {allGenres.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              style={{
                background: "none",
                border: activeGenre === g ? "1px solid #9A5A30" : "1px solid transparent",
                borderRadius: "3px",
                cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px", letterSpacing: "2px",
                textTransform: "uppercase",
                color: activeGenre === g ? "#9A5A30" : "#b0a898",
                padding: "6px 12px",
                transition: "color 0.2s, border-color 0.2s",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* ── CONTENT (unchanged from teammates, admin props added) ── */}
        {loading ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "400px", flexDirection: "column", gap: "16px",
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "28px", fontStyle: "italic", color: "#c0b8a8",
            }}>
              Loading films...
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px", letterSpacing: "3px", color: "#d0c8bc",
            }}>
              FETCHING FROM TMDB
            </div>
          </div>
        ) : error ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "400px",
          }}>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "11px", letterSpacing: "1px", color: "#B83A10",
            }}>
              ✕ {error}
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            height: "400px", flexDirection: "column", gap: "12px",
          }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "24px", fontStyle: "italic", color: "#c0b8a8",
            }}>
              No films found.
            </div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px", letterSpacing: "2px", color: "#d0c8bc",
            }}>
              TRY A DIFFERENT SEARCH OR FILTER
            </div>
          </div>
        ) : (
          <div style={{
            padding: "40px 56px 60px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))",
            gap: "24px",
          }}>
            {filtered.map((movie, i) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                rank={i}
                onClick={setSelected}
                isAdmin={isAdmin}
                onAdminEdit={setEditMovie}
                onAdminDelete={setDeleteMovie}
              />
            ))}
          </div>
        )}

        {/* ── PAGINATION (unchanged from teammates) ── */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: "8px", padding: "0 56px 48px",
          }}>
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === 1}
              style={{
                background: "none",
                border: "1px solid #ddd6ca",
                borderRadius: "3px",
                padding: "8px 16px",
                cursor: page === 1 ? "not-allowed" : "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "9px", letterSpacing: "2px",
                color: page === 1 ? "#d0c8bc" : "#9A5A30",
                transition: "border-color 0.2s",
              }}
            >
              ← PREV
            </button>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px", letterSpacing: "2px", color: "#b0a898",
              padding: "0 12px",
            }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === totalPages}
              style={{
                background: "none",
                border: "1px solid #ddd6ca",
                borderRadius: "3px",
                padding: "8px 16px",
                cursor: page === totalPages ? "not-allowed" : "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "9px", letterSpacing: "2px",
                color: page === totalPages ? "#d0c8bc" : "#9A5A30",
                transition: "border-color 0.2s",
              }}
            >
              NEXT →
            </button>
          </div>
        )}

        {/* ── FOOTER (unchanged from teammates) ── */}
        <div style={{
          padding: "32px 56px", borderTop: "1px solid #e0d9ce",
          background: "#eee8de",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", color: "#c0b8a8" }}>
            REEL · FILM CATALOG · POWERED BY TMDB
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px", color: "#c0b8a8" }}>
            Click any card to expand
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Movie detail modal (updated with admin props) */}
      <Modal
        movie={selected}
        onClose={() => setSelected(null)}
        isAdmin={isAdmin}
        onAdminEdit={setEditMovie}
      />

      {/* Auth modal — login / register */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Admin: Add movie modal */}
      {showAddMovie && (
        <AdminMovieModal
          onClose={() => setShowAddMovie(false)}
          onSave={handleMovieSaved}
        />
      )}

      {/* Admin: Edit movie modal */}
      {editMovie && (
        <AdminMovieModal
          editMovie={editMovie}
          onClose={() => setEditMovie(null)}
          onSave={handleMovieSaved}
        />
      )}

      {/* Admin: Delete confirm modal */}
      {deleteMovie && (
        <DeleteConfirmModal
          movie={deleteMovie}
          onClose={() => setDeleteMovie(null)}
          onConfirm={handleMovieDeleted}
        />
      )}
    </>
  );
}
