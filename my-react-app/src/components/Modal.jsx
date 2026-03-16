import { useState, useEffect } from "react";

export function Modal({ movie, onClose, isAdmin, onAdminEdit }) {
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

        {/* Info panel */}
        <div style={{
          flex: 1, background: "#faf7f2",
          padding: "36px 40px",
          display: "flex", flexDirection: "column", gap: "18px",
          overflowY: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {isAdmin && (
              <button
                onClick={() => { onClose(); onAdminEdit(movie); }}
                style={{
                  background: "none", border: "1px solid #2E6FA3",
                  borderRadius: "3px", padding: "6px 14px", cursor: "pointer",
                  fontFamily: "'DM Mono', monospace",
                  fontSize: "9px", letterSpacing: "2px", color: "#2E6FA3",
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
                marginLeft: "auto", transition: "color 0.2s",
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
            margin: 0, fontFamily: "'Cormorant Garamond', serif",
            fontSize: "40px", fontWeight: "700",
            color: "#111", lineHeight: 1.05, letterSpacing: "-1px",
          }}>
            {movie.title}
          </h2>

          <div style={{ height: "1px", background: `linear-gradient(to right, ${movie.accent}, transparent)` }} />

          <p style={{
            margin: 0, fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", fontSize: "16px", color: "#777", lineHeight: "1.75",
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
                fontSize: "24px", fontWeight: "700", color: "#ccc", letterSpacing: "-0.5px",
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