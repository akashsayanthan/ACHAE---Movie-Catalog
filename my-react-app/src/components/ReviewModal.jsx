import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function ReviewModal({ movie, currentUser, onClose, onSave }) {
  const [loaded, setLoaded] = useState(false);
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { setTimeout(() => setLoaded(true), 10); }, []);

  const handleSubmit = async () => {
    setError(null);
    if (rating === 0) return setError("Please select a star rating.");
    if (!reviewText.trim()) return setError("Review cannot be empty.");
    if (reviewText.trim().length < 10) return setError("Review must be at least 10 characters.");

    setLoading(true);
    try {
      const { error: insertError } = await supabase
        .from("reviews")
        .insert([{
          user_id: currentUser.id,
          movie_id: String(movie.id),
          movie_title: movie.title,
          rating,
          review_text: reviewText.trim(),
          username: currentUser.username || currentUser.email,
        }]);

      if (insertError) throw insertError;
      onSave();
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
    resize: "vertical", lineHeight: "1.6",
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
        position: "fixed", inset: 0, zIndex: 400,
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
          borderRadius: "6px", width: "100%", maxWidth: "500px",
          padding: "44px 44px 40px",
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
            letterSpacing: "4px", color: "#9A5A30",
            textTransform: "uppercase", marginBottom: "10px",
          }}>
            WRITE A REVIEW
          </div>
          <h2 style={{
            margin: 0, fontFamily: "'Cormorant Garamond', serif",
            fontSize: "28px", fontWeight: "700", color: "#1a1610",
          }}>
            {movie.title}
          </h2>
        </div>

        {/* Star rating */}
        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Your Rating *</label>
          <div style={{ display: "flex", gap: "8px" }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                aria-label={`${star} star`}
                aria-pressed={rating === star ? "true" : "false"}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: "28px", padding: "0",
                  color: star <= (hovered || rating) ? "#e6a817" : "#e0dbd4",
                  transition: "color 0.15s",
                  lineHeight: 1,
                }}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Review text */}
        <div style={{ marginBottom: "8px" }}>
          <label style={labelStyle}>Your Review *</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Write your review here... (minimum 10 characters)"
            rows={5}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = "#9A5A30")}
            onBlur={(e) => (e.target.style.borderColor = "#e0d9ce")}
          />
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: "9px",
            color: "#ccc", textAlign: "right", marginTop: "4px",
          }}>
            {reviewText.length} chars
          </div>
        </div>

        {/* Error */}
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

        {/* Buttons */}
        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            aria-label="Submit Review"
            style={{
              flex: 1, background: loading ? "#c0b8a8" : "#1a1610",
              border: "none", borderRadius: "3px", padding: "13px",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'DM Mono', monospace",
              fontSize: "10px", letterSpacing: "2px", color: "#f5f0e8",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => { if (!loading) e.target.style.background = "#2e2820"; }}
            onMouseLeave={(e) => { if (!loading) e.target.style.background = "#1a1610"; }}
          >
            {loading ? "SUBMITTING..." : "SUBMIT REVIEW"}
          </button>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              flex: 1, background: "none",
              border: "1px solid #e0d9ce", borderRadius: "3px", padding: "13px",
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
              fontSize: "10px", letterSpacing: "2px", color: "#b0a898",
              transition: "border-color 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = "#9A5A30"; e.target.style.color = "#9A5A30"; }}
            onMouseLeave={(e) => { e.target.style.borderColor = "#e0d9ce"; e.target.style.color = "#b0a898"; }}
          >
            CANCEL
          </button>
        </div>

        {/* Close X */}
        <button
          onClick={onClose}
          aria-label="Close"
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