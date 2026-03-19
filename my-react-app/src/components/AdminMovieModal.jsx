import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ─── ADMIN MOVIE FORM MODAL ───────────────────────────────────────────────────
// Used for both Add Movie and Edit Movie (admin only).
// When `editMovie` is provided, it pre-fills the form for editing.
// On save, calls onSave(formData). On cancel, calls onClose().
//
// NOTE: This saves to your Supabase `movies` table.
// Assumes columns: title, year, genre (text[]), synopsis, poster_url, tmdb_rating
export function AdminMovieModal({ editMovie, onClose, onSave }) {
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
