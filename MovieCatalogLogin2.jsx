import { useState, useEffect, useRef } from "react";

const API_KEY = "1d0b000b8bbf7d95bdfa6bfd876956e5";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";

// TMDB genre ID → name map
const GENRE_MAP = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy",
  80: "Crime", 99: "Documentary", 18: "Drama", 10751: "Family",
  14: "Fantasy", 36: "History", 27: "Horror", 10402: "Music",
  9648: "Mystery", 10749: "Romance", 878: "Sci-Fi", 10770: "TV Movie",
  53: "Thriller", 10752: "War", 37: "Western", 28: "Action",
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
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
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

// ─── CREATE ACCOUNT MODAL ─────────────────────────────────────────────────────
function CreateAccountModal({ onClose }) {
  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setTimeout(() => setLoaded(true), 10); }, []);

  const handleClose = () => { setLoaded(false); setTimeout(onClose, 350); };

  const handleSubmit = () => {
    if (!email.trim()) return setError("Please enter your email.");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Please enter a valid email.");
    setSubmitted(true);
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: `rgba(240,236,230,${loaded ? 0.85 : 0})`,
        backdropFilter: loaded ? "blur(14px)" : "blur(0px)",
        transition: "background 0.35s, backdrop-filter 0.35s",
        padding: "40px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: "400px",
          background: "#faf7f2", borderRadius: "6px",
          border: "1px solid #ddd6ca",
          boxShadow: "0 32px 80px rgba(0,0,0,0.14), 0 0 0 1px #e0d9d0",
          overflow: "hidden",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "scale(1) translateY(0)" : "scale(0.96) translateY(16px)",
          transition: "all 0.4s cubic-bezier(0.4,0,0.2,1)",
        }}
      >
        <div style={{
          padding: "28px 32px 24px",
          borderBottom: "1px solid #ede8e0",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace", fontSize: "8px",
              letterSpacing: "3px", color: "#b8b0a0",
              textTransform: "uppercase", marginBottom: "10px",
            }}>
              REEL · NEW MEMBER
            </div>
            <h2 style={{
              margin: 0, fontFamily: "'Cormorant Garamond', serif",
              fontSize: "28px", fontWeight: "700",
              color: "#1a1610", letterSpacing: "-0.5px", lineHeight: 1.1,
            }}>
              Create an account.
            </h2>
          </div>
          <button
            onClick={handleClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: "9px",
              letterSpacing: "2px", color: "#bbb", padding: "4px 0",
              transition: "color 0.2s", marginTop: "2px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#9A5A30")}
            onMouseLeave={(e) => (e.target.style.color = "#bbb")}
          >
            [ CLOSE ]
          </button>
        </div>

        <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: "18px" }}>
          {submitted ? (
            <div style={{
              padding: "14px", background: "#f0f7f0",
              border: "1px solid #3A8A3A44", borderRadius: "3px",
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic", fontSize: "15px", color: "#3A8A3A", lineHeight: 1.6,
            }}>
              Thanks! We'll be in touch at <strong>{email}</strong>.
            </div>
          ) : (
            <>
              <div>
                <label style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "9px",
                  letterSpacing: "2.5px", textTransform: "uppercase",
                  color: "#a89f90", display: "block", marginBottom: "7px",
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{
                    width: "100%", background: "#f5f0e8",
                    border: `1px solid ${error ? "#B83A10" : "#ddd6ca"}`,
                    borderRadius: "3px", padding: "12px 14px",
                    fontFamily: "'DM Mono', monospace", fontSize: "11px",
                    letterSpacing: "0.5px", color: "#1a1610", outline: "none",
                    transition: "border-color 0.2s", boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
                  onBlur={(e) => (e.target.style.borderColor = error ? "#B83A10" : "#ddd6ca")}
                />
                {error && (
                  <div style={{
                    marginTop: "6px", fontFamily: "'DM Mono', monospace",
                    fontSize: "9px", color: "#B83A10", letterSpacing: "0.5px",
                  }}>
                    ✕ {error}
                  </div>
                )}
              </div>
              <button
                onClick={handleSubmit}
                style={{
                  width: "100%", padding: "14px", background: "#1a1610",
                  border: "none", borderRadius: "3px", cursor: "pointer",
                  fontFamily: "'DM Mono', monospace", fontSize: "10px",
                  letterSpacing: "3px", textTransform: "uppercase",
                  color: "#f5f0e8", transition: "background 0.25s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
                onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function MovieCatalog() {
  const [movies, setMovies] = useState([]);
  const [allGenres, setAllGenres] = useState(["ALL"]);
  const [activeGenre, setActiveGenre] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch movies from TMDB
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

        // Build genre list
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

  const filtered = activeGenre === "ALL"
    ? movies
    : movies.filter((m) => m.genre.includes(activeGenre));

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
      `}</style>

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
                  Powered by TMDB
                </div>
              </div>
            </div>
          </div>

          {/* Create Account button + Search bar */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", alignSelf: "stretch" }}>
          <button
            onClick={() => setShowCreateAccount(true)}
            style={{
              background: "#1a1610", border: "none", borderRadius: "4px",
              padding: "10px 20px", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: "9px",
              letterSpacing: "2.5px", textTransform: "uppercase",
              color: "#f5f0e8", transition: "background 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
            onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
          >
            Create Account
          </button>
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

        {/* FILTER BAR */}
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

        {/* CONTENT */}
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
              <MovieCard key={movie.id} movie={movie} rank={i} onClick={setSelected} />
            ))}
          </div>
        )}

        {/* PAGINATION */}
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

        {/* FOOTER */}
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

      <Modal movie={selected} onClose={() => setSelected(null)} />
      {showCreateAccount && (
        <CreateAccountModal onClose={() => setShowCreateAccount(false)} />
      )}
    </>
  );
}
