import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
// Admin only. Confirms before deleting a movie from Supabase.
export function DeleteConfirmModal({ movie, onClose, onConfirm }) {
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
