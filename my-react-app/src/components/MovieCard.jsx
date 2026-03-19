import { useState, useRef } from "react";
import { useInView } from "../hooks/useInView";

// ─── MOVIE CARD ───────────────────────────────────────────────────────────────
export function MovieCard({ movie, rank, onClick, isAdmin, onAdminEdit, onAdminDelete }) {
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
