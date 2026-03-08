import { useState, useEffect, useRef } from “react”;

// ─── MOCK USER DATABASE (in-memory) ───────────────────────────────────────────
const userDB = {};

// ─── AUTH HELPERS ─────────────────────────────────────────────────────────────
function hashPassword(pw) {
// Simple deterministic hash for demo purposes (not cryptographic)
let h = 0;
for (let i = 0; i < pw.length; i++) {
h = (Math.imul(31, h) + pw.charCodeAt(i)) | 0;
}
return h.toString(16);
}

// ─── MOVIE DATA ───────────────────────────────────────────────────────────────
const movies = [
{
id: 1,
title: “Blade Runner 2049”,
year: 2017,
genre: [“Sci-Fi”, “Thriller”],
rating: 8.0,
reviews: 842,
synopsis: “A young blade runner’s discovery of a long-buried secret leads him to track down former blade runner Rick Deckard, who’s been missing for thirty years.”,
poster: “https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg”,
accent: “#C47D1A”,
index: “001”,
},
{
id: 2,
title: “The Dark Knight”,
year: 2008,
genre: [“Action”, “Crime”],
rating: 9.0,
reviews: 2700,
synopsis: “When the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.”,
poster: “https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=600&q=80”,
accent: “#2E6FA3”,
index: “002”,
},
{
id: 3,
title: “Interstellar”,
year: 2014,
genre: [“Sci-Fi”, “Drama”],
rating: 8.6,
reviews: 1930,
synopsis: “A team of explorers travel through a wormhole in space in an attempt to ensure humanity’s survival as Earth faces catastrophic blight.”,
poster: “https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=600&q=80”,
accent: “#8A7A3A”,
index: “003”,
},
{
id: 4,
title: “Parasite”,
year: 2019,
genre: [“Drama”, “Thriller”],
rating: 8.5,
reviews: 1560,
synopsis: “Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.”,
poster: “https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg”,
accent: “#3A8A3A”,
index: “004”,
},
{
id: 5,
title: “Dune”,
year: 2021,
genre: [“Sci-Fi”, “Adventure”],
rating: 8.0,
reviews: 1100,
synopsis: “The son of a noble family entrusted with the protection of the most valuable asset in the galaxy must navigate treachery, politics, and destiny.”,
poster: “https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg”,
accent: “#B5671A”,
index: “005”,
},
{
id: 6,
title: “The Shawshank Redemption”,
year: 1994,
genre: [“Drama”],
rating: 9.3,
reviews: 2900,
synopsis: “Two imprisoned men bond over years, finding solace and eventual redemption through acts of common decency in a harsh world.”,
poster: “https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg”,
accent: “#9A5A30”,
index: “006”,
},
{
id: 7,
title: “Oppenheimer”,
year: 2023,
genre: [“Biography”, “Drama”],
rating: 8.9,
reviews: 1450,
synopsis: “The story of J. Robert Oppenheimer and his role in the development of the atomic bomb that forever changed the course of human history.”,
poster: “https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg”,
accent: “#B83A10”,
index: “007”,
},
{
id: 8,
title: “Spirited Away”,
year: 2001,
genre: [“Animation”, “Fantasy”],
rating: 9.3,
reviews: 1750,
synopsis: “During her family’s move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.”,
poster: “https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg”,
accent: “#A83060”,
index: “008”,
},
];

const allGenres = [“ALL”, …new Set(movies.flatMap((m) => m.genre))];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useInView(ref) {
const [inView, setInView] = useState(false);
useEffect(() => {
const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.08 });
if (ref.current) obs.observe(ref.current);
return () => obs.disconnect();
}, []);
return inView;
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose, onLogin }) {
const [mode, setMode] = useState(“login”); // “login” | “register”
const [loaded, setLoaded] = useState(false);
const [form, setForm] = useState({ email: “”, password: “”, name: “” });
const [error, setError] = useState(””);
const [success, setSuccess] = useState(””);
const [showPw, setShowPw] = useState(false);
const [loading, setLoading] = useState(false);

useEffect(() => {
setTimeout(() => setLoaded(true), 10);
}, []);

const handleClose = () => {
setLoaded(false);
setTimeout(onClose, 350);
};

const update = (field) => (e) => {
setForm((f) => ({ …f, [field]: e.target.value }));
setError(””);
setSuccess(””);
};

const switchMode = (m) => {
setMode(m);
setForm({ email: “”, password: “”, name: “” });
setError(””);
setSuccess(””);
};

const handleSubmit = () => {
setError(””);
setSuccess(””);

```
if (mode === "register") {
  if (!form.name.trim()) return setError("Please enter your name.");
  if (!form.email.trim()) return setError("Please enter your email.");
  if (!/\S+@\S+\.\S+/.test(form.email)) return setError("Please enter a valid email.");
  if (form.password.length < 6) return setError("Password must be at least 6 characters.");
  if (userDB[form.email.toLowerCase()]) return setError("An account with this email already exists.");

  setLoading(true);
  setTimeout(() => {
    userDB[form.email.toLowerCase()] = {
      name: form.name.trim(),
      email: form.email.toLowerCase(),
      passwordHash: hashPassword(form.password),
    };
    setLoading(false);
    setSuccess("Account created! You can now sign in.");
    switchMode("login");
  }, 800);

} else {
  if (!form.email.trim()) return setError("Please enter your email.");
  if (!form.password) return setError("Please enter your password.");

  setLoading(true);
  setTimeout(() => {
    const user = userDB[form.email.toLowerCase()];
    if (!user || user.passwordHash !== hashPassword(form.password)) {
      setLoading(false);
      return setError("Incorrect email or password.");
    }
    setLoading(false);
    setLoaded(false);
    setTimeout(() => {
      onLogin(user);
      onClose();
    }, 350);
  }, 700);
}
```

};

const inputStyle = {
width: “100%”,
background: “#f5f0e8”,
border: “1px solid #ddd6ca”,
borderRadius: “3px”,
padding: “12px 14px”,
fontFamily: “‘DM Mono’, monospace”,
fontSize: “11px”,
letterSpacing: “0.5px”,
color: “#1a1610”,
outline: “none”,
transition: “border-color 0.2s”,
boxSizing: “border-box”,
};

const labelStyle = {
fontFamily: “‘DM Mono’, monospace”,
fontSize: “9px”,
letterSpacing: “2.5px”,
textTransform: “uppercase”,
color: “#a89f90”,
display: “block”,
marginBottom: “7px”,
};

return (
<div
onClick={handleClose}
style={{
position: “fixed”, inset: 0, zIndex: 200,
display: “flex”, alignItems: “center”, justifyContent: “center”,
background: `rgba(240,236,230,${loaded ? 0.85 : 0})`,
backdropFilter: loaded ? “blur(14px)” : “blur(0px)”,
transition: “background 0.35s, backdrop-filter 0.35s”,
padding: “40px”,
}}
>
<div
onClick={(e) => e.stopPropagation()}
style={{
width: “100%”,
maxWidth: “420px”,
background: “#faf7f2”,
borderRadius: “6px”,
border: “1px solid #ddd6ca”,
boxShadow: “0 32px 80px rgba(0,0,0,0.14), 0 0 0 1px #e0d9d0”,
overflow: “hidden”,
opacity: loaded ? 1 : 0,
transform: loaded ? “scale(1) translateY(0)” : “scale(0.96) translateY(16px)”,
transition: “all 0.4s cubic-bezier(0.4,0,0.2,1)”,
}}
>
{/* Header bar */}
<div style={{
padding: “28px 32px 24px”,
borderBottom: “1px solid #ede8e0”,
display: “flex”,
justifyContent: “space-between”,
alignItems: “flex-start”,
}}>
<div>
<div style={{
fontFamily: “‘DM Mono’, monospace”,
fontSize: “8px”, letterSpacing: “3px”,
color: “#b8b0a0”, textTransform: “uppercase”, marginBottom: “10px”,
}}>
REEL · MEMBER ACCESS
</div>
<h2 style={{
margin: 0,
fontFamily: “‘Cormorant Garamond’, serif”,
fontSize: “30px”, fontWeight: “700”,
color: “#1a1610”, letterSpacing: “-0.5px”, lineHeight: 1.1,
}}>
{mode === “login” ? “Welcome back.” : “Create account.”}
</h2>
</div>
<button
onClick={handleClose}
style={{
background: “none”, border: “none”, cursor: “pointer”,
fontFamily: “‘DM Mono’, monospace”, fontSize: “9px”,
letterSpacing: “2px”, color: “#bbb”, padding: “4px 0”,
transition: “color 0.2s”, marginTop: “2px”,
}}
onMouseEnter={(e) => (e.target.style.color = “#9A5A30”)}
onMouseLeave={(e) => (e.target.style.color = “#bbb”)}
>
[ CLOSE ]
</button>
</div>

```
    {/* Tab switcher */}
    <div style={{
      display: "flex",
      borderBottom: "1px solid #ede8e0",
      background: "#f5f0e8",
    }}>
      {["login", "register"].map((m) => (
        <button
          key={m}
          onClick={() => switchMode(m)}
          style={{
            flex: 1,
            background: "none",
            border: "none",
            borderBottom: mode === m ? "2px solid #9A5A30" : "2px solid transparent",
            cursor: "pointer",
            padding: "13px 0",
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
            color: mode === m ? "#9A5A30" : "#b0a898",
            transition: "color 0.2s, border-color 0.2s",
          }}
        >
          {m === "login" ? "Sign In" : "Register"}
        </button>
      ))}
    </div>

    {/* Form */}
    <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>

      {/* Success message */}
      {success && (
        <div style={{
          padding: "10px 14px",
          background: "#f0f7f0",
          border: "1px solid #3A8A3A44",
          borderRadius: "3px",
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px", letterSpacing: "0.5px",
          color: "#3A8A3A",
        }}>
          ✓ {success}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div style={{
          padding: "10px 14px",
          background: "#fff5f5",
          border: "1px solid #B83A1044",
          borderRadius: "3px",
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px", letterSpacing: "0.5px",
          color: "#B83A10",
        }}>
          ✕ {error}
        </div>
      )}

      {/* Name field (register only) */}
      {mode === "register" && (
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            type="text"
            placeholder="Jane Doe"
            value={form.name}
            onChange={update("name")}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
            onBlur={(e) => (e.target.style.borderColor = "#ddd6ca")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
        </div>
      )}

      {/* Email */}
      <div>
        <label style={labelStyle}>Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={update("email")}
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
          onBlur={(e) => (e.target.style.borderColor = "#ddd6ca")}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </div>

      {/* Password */}
      <div>
        <label style={labelStyle}>Password {mode === "register" && <span style={{ color: "#ccc" }}>(min. 6 chars)</span>}</label>
        <div style={{ position: "relative" }}>
          <input
            type={showPw ? "text" : "password"}
            placeholder={mode === "register" ? "Create a password" : "Enter your password"}
            value={form.password}
            onChange={update("password")}
            style={{ ...inputStyle, paddingRight: "56px" }}
            onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
            onBlur={(e) => (e.target.style.borderColor = "#ddd6ca")}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button
            onClick={() => setShowPw((s) => !s)}
            style={{
              position: "absolute", right: "12px", top: "50%",
              transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: "8px", letterSpacing: "1.5px",
              color: "#bbb", padding: 0,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#9A5A30")}
            onMouseLeave={(e) => (e.target.style.color = "#bbb")}
          >
            {showPw ? "HIDE" : "SHOW"}
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        style={{
          width: "100%",
          padding: "14px",
          background: loading ? "#c0b8a8" : "#1a1610",
          border: "none",
          borderRadius: "3px",
          cursor: loading ? "not-allowed" : "pointer",
          fontFamily: "'DM Mono', monospace",
          fontSize: "10px",
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: "#f5f0e8",
          transition: "background 0.25s, transform 0.15s",
          transform: "translateY(0)",
          marginTop: "4px",
        }}
        onMouseEnter={(e) => { if (!loading) e.target.style.background = "#2e2820"; }}
        onMouseLeave={(e) => { if (!loading) e.target.style.background = "#1a1610"; }}
      >
        {loading
          ? (mode === "login" ? "Signing in..." : "Creating account...")
          : (mode === "login" ? "Sign In" : "Create Account")
        }
      </button>

      {/* Switch hint */}
      <div style={{
        textAlign: "center",
        fontFamily: "'Cormorant Garamond', serif",
        fontStyle: "italic",
        fontSize: "13px",
        color: "#b0a898",
      }}>
        {mode === "login"
          ? <>New here?{" "}
              <span
                onClick={() => switchMode("register")}
                style={{ color: "#9A5A30", cursor: "pointer", textDecoration: "underline" }}
              >Create an account</span></>
          : <>Already a member?{" "}
              <span
                onClick={() => switchMode("login")}
                style={{ color: "#9A5A30", cursor: "pointer", textDecoration: "underline" }}
              >Sign in</span></>
        }
      </div>
    </div>
  </div>
</div>
```

);
}

// ─── MOVIE CARD ───────────────────────────────────────────────────────────────
function MovieCard({ movie, rank, onClick }) {
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
cursor: “pointer”,
borderRadius: “6px”,
overflow: “hidden”,
background: “#ffffff”,
border: `1px solid ${hovered ? movie.accent + "55" : "#e8e2da"}`,
transition: `opacity 0.65s ${rank * 0.08}s, transform 0.65s ${rank * 0.08}s, border-color 0.3s, box-shadow 0.3s`,
opacity: inView ? 1 : 0,
transform: inView
? (hovered ? “translateY(-6px)” : “translateY(0)”)
: “translateY(28px)”,
boxShadow: hovered
? `0 20px 56px ${movie.accent}22, 0 4px 20px rgba(0,0,0,0.10)`
: “0 2px 12px rgba(0,0,0,0.06)”,
position: “relative”,
}}
>
{/* Index stamp */}
<div style={{
position: “absolute”,
top: “10px”, left: “12px”,
fontFamily: “‘DM Mono’, monospace”,
fontSize: “10px”, letterSpacing: “2px”,
color: hovered ? movie.accent : “rgba(255,255,255,0.55)”,
zIndex: 3, transition: “color 0.3s”, fontWeight: “500”,
}}>
{movie.index}
</div>

```
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
    {/* Accent sweep bar */}
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
        {[1,2,3,4,5].map((i) => (
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
        {(movie.reviews / 1000).toFixed(1)}K REVIEWS
      </span>
    </div>
  </div>
</div>
```

);
}

// ─── MOVIE MODAL ──────────────────────────────────────────────────────────────
function Modal({ movie, onClose }) {
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
position: “fixed”, inset: 0, zIndex: 100,
display: “flex”, alignItems: “center”, justifyContent: “center”,
background: `rgba(240,236,230,${loaded ? 0.82 : 0})`,
backdropFilter: loaded ? “blur(12px)” : “blur(0px)”,
transition: “background 0.4s, backdrop-filter 0.4s”,
padding: “40px”,
}}
>
<div
onClick={(e) => e.stopPropagation()}
style={{
display: “flex”,
maxWidth: “880px”, width: “100%”,
maxHeight: “88vh”, overflow: “hidden”,
borderRadius: “6px”,
opacity: loaded ? 1 : 0,
transform: loaded ? “scale(1) translateY(0)” : “scale(0.95) translateY(20px)”,
transition: “all 0.45s cubic-bezier(0.4,0,0.2,1)”,
border: `1px solid ${movie.accent}33`,
boxShadow: `0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px #e0d9d0`,
}}
>
{/* Poster */}
<div style={{ width: “360px”, flexShrink: 0, position: “relative”, overflow: “hidden” }}>
<img src={movie.poster} alt={movie.title}
style={{ width: “100%”, height: “100%”, objectFit: “cover”, display: “block” }}
/>
<div style={{
position: “absolute”, inset: 0,
background: “linear-gradient(to right, transparent 55%, #faf7f2 100%)”,
}} />
<div style={{
position: “absolute”, top: 0, left: 0,
width: “4px”, height: “100%”, background: movie.accent,
}} />
<div style={{
position: “absolute”, bottom: “16px”, left: “20px”,
fontFamily: “‘Cormorant Garamond’, serif”,
fontSize: “96px”, fontWeight: “700”,
color: “rgba(0,0,0,0.04)”,
lineHeight: 1, letterSpacing: “-4px”, userSelect: “none”,
}}>
{movie.index}
</div>
</div>

```
    {/* Info */}
    <div style={{
      flex: 1, background: "#faf7f2",
      padding: "36px 40px",
      display: "flex", flexDirection: "column", gap: "18px",
      overflowY: "auto",
    }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onClose}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            letterSpacing: "2px", color: "#bbb", padding: "0",
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
        {[1,2,3,4,5].map((i) => (
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
            USER SCORE / 10
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
            TOTAL REVIEWS
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
```

);
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MovieCatalog() {
const [selected, setSelected] = useState(null);
const [showAuth, setShowAuth] = useState(false);
const [currentUser, setCurrentUser] = useState(null);
const [showUserMenu, setShowUserMenu] = useState(false);
const filtered = movies;

const handleLogin = (user) => {
setCurrentUser(user);
};

const handleLogout = () => {
setCurrentUser(null);
setShowUserMenu(false);
};

return (
<>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,700;1,400;1,700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
<style>{`* { box-sizing: border-box; } body { margin: 0; background: #f5f0e8; } ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #ede8e0; } ::-webkit-scrollbar-thumb { background: #ccc; }`}</style>

```
  <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>

    {/* MASTHEAD */}
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
              
            </div>
          </div>
        </div>
      </div>

      {/* ── AUTH CONTROLS (NEW) ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px", paddingBottom: "6px" }}>
        {currentUser ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowUserMenu((s) => !s)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "none", border: "1px solid #ddd6ca",
                borderRadius: "4px", padding: "9px 14px",
                cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#9A5A30"; e.currentTarget.style.background = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ddd6ca"; e.currentTarget.style.background = "none"; }}
            >
              {/* Avatar initials */}
              <div style={{
                width: "26px", height: "26px", borderRadius: "50%",
                background: "#9A5A30",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                color: "#faf7f2", fontWeight: "500", letterSpacing: "0.5px",
                flexShrink: 0,
              }}>
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "9px",
                  letterSpacing: "1.5px", color: "#1a1610",
                }}>
                  {currentUser.name.split(" ")[0].toUpperCase()}
                </div>
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "8px",
                  letterSpacing: "1px", color: "#b0a898", marginTop: "1px",
                }}>
                  MEMBER
                </div>
              </div>
              <span style={{ color: "#bbb", fontSize: "10px", marginLeft: "4px" }}>▾</span>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                background: "#faf7f2", border: "1px solid #e0d9d0",
                borderRadius: "4px", boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
                minWidth: "180px", overflow: "hidden", zIndex: 50,
              }}>
                <div style={{
                  padding: "12px 16px 10px",
                  borderBottom: "1px solid #ede8e0",
                }}>
                  <div style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: "15px", fontWeight: "700", color: "#1a1610",
                  }}>
                    {currentUser.name}
                  </div>
                  <div style={{
                    fontFamily: "'DM Mono', monospace", fontSize: "9px",
                    letterSpacing: "0.5px", color: "#b0a898", marginTop: "2px",
                  }}>
                    {currentUser.email}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "12px 16px", textAlign: "left", cursor: "pointer",
                    fontFamily: "'DM Mono', monospace", fontSize: "9px",
                    letterSpacing: "2px", textTransform: "uppercase",
                    color: "#B83A10", transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#fff5f5")}
                  onMouseLeave={(e) => (e.target.style.background = "none")}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setShowAuth(true)}
            style={{
              background: "#1a1610",
              border: "none",
              borderRadius: "4px",
              padding: "10px 20px",
              cursor: "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: "9px",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              color: "#f5f0e8",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
            onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
          >
            Sign In
          </button>
        )}
      </div>
    </div>

    {/* FILTER (Static) */}
    <div style={{
      padding: "14px 56px",
      display: "flex",
      borderBottom: "1px solid #e0d9ce",
      alignItems: "center",
      background: "#f0ebe2",
    }}>
      <span style={{
        fontFamily: "'DM Mono', monospace",
        fontSize: "9px",
        letterSpacing: "3px",
        color: "#c0b8a8",
        textTransform: "uppercase",
        marginRight: "20px",
      }}>
        FILTER
      </span>

      {allGenres.map((g) => (
        <span
          key={g}
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "10px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "#b0a898",
            padding: "8px 14px",
          }}
        >
          {g}
        </span>
      ))}
    </div>

    {/* CARD GRID */}
    <div style={{
      padding: "40px 56px 60px",
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(248px, 1fr))",
      gap: "24px",
    }}>
      {filtered.map((movie, i) => (
        <MovieCard key={movie.id} movie={movie} rank={i} onClick={setSelected} />
      ))}
    </div>

    {/* FOOTER */}
    <div style={{
      padding: "32px 56px", borderTop: "1px solid #e0d9ce",
      background: "#eee8de",
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "3px", color: "#c0b8a8" }}>
        REEL · FILM CATALOG · ALL RIGHTS RESERVED
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: "13px", color: "#c0b8a8" }}>
        Click any card to expand
      </div>
    </div>
  </div>

  {/* Click outside to close user menu */}
  {showUserMenu && (
    <div
      onClick={() => setShowUserMenu(false)}
      style={{ position: "fixed", inset: 0, zIndex: 40 }}
    />
  )}

  <Modal movie={selected} onClose={() => setSelected(null)} />

  {showAuth && (
    <AuthModal
      onClose={() => setShowAuth(false)}
      onLogin={handleLogin}
    />
  )}
</>
```

);
}
