import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { ReviewModal } from "./ReviewModal";

export function ReviewsList({ movie, currentUser }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("movie_id", String(movie.id))
      .order("created_at", { ascending: false });

    if (!error && data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [movie.id]);

  const handleDelete = async (reviewId) => {
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", reviewId);

    if (!error) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  const handleReviewSaved = () => {
    setShowReviewModal(false);
    fetchReviews();
  };

  const labelStyle = {
    fontFamily: "'DM Mono', monospace",
    fontSize: "9px", letterSpacing: "2.5px",
    textTransform: "uppercase", color: "#b0a898",
  };

  return (
    <div style={{ marginTop: "24px" }}>
      {/* Header row */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "16px",
        paddingBottom: "12px", borderBottom: "1px solid #ede8e0",
      }}>
        <span style={{ ...labelStyle }}>
          REVIEWS {reviews.length > 0 && `(${reviews.length})`}
        </span>

        {currentUser && (
          <button
            onClick={() => setShowReviewModal(true)}
            aria-label="Write a Review"
            style={{
              background: "#1a1610", border: "none",
              borderRadius: "3px", padding: "7px 14px",
              cursor: "pointer", fontFamily: "'DM Mono', monospace",
              fontSize: "9px", letterSpacing: "2px", color: "#f5f0e8",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
            onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
          >
            + WRITE A REVIEW
          </button>
        )}
      </div>

      {/* Reviews list */}
      {loading ? (
        <div style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px", color: "#ccc", letterSpacing: "2px",
          padding: "16px 0",
        }}>
          LOADING REVIEWS...
        </div>
      ) : reviews.length === 0 ? (
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: "italic", fontSize: "15px",
          color: "#bbb", padding: "12px 0",
        }}>
          No reviews yet. Be the first to share your thoughts.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "#faf7f2",
                border: "1px solid #ede8e0",
                borderRadius: "4px",
                padding: "16px 18px",
              }}
            >
              {/* Review header */}
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "8px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Stars */}
                  <div>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} style={{
                        fontSize: "13px",
                        color: s <= review.rating ? "#e6a817" : "#e0dbd4",
                      }}>★</span>
                    ))}
                  </div>
                  {/* Username */}
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "10px", color: "#9A5A30", letterSpacing: "1px",
                  }}>
                    {review.username || "Anonymous"}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Date */}
                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "9px", color: "#ccc", letterSpacing: "1px",
                  }}>
                    {new Date(review.created_at).toLocaleDateString("en-CA")}
                  </span>

                  {/* Delete — only own reviews */}
                  {currentUser?.id === review.user_id && (
                    <button
                      onClick={() => handleDelete(review.id)}
                      aria-label="Delete Review"
                      style={{
                        background: "none", border: "1px solid #f0c4bc",
                        borderRadius: "3px", padding: "3px 8px",
                        cursor: "pointer", fontFamily: "'DM Mono', monospace",
                        fontSize: "8px", letterSpacing: "1px", color: "#B83A10",
                        transition: "background 0.2s, color 0.2s",
                      }}
                      onMouseEnter={(e) => { e.target.style.background = "#B83A10"; e.target.style.color = "#fff"; }}
                      onMouseLeave={(e) => { e.target.style.background = "none"; e.target.style.color = "#B83A10"; }}
                    >
                      DELETE
                    </button>
                  )}
                </div>
              </div>

              {/* Review text */}
              <p style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic", fontSize: "15px",
                color: "#555", lineHeight: "1.7",
              }}>
                {review.review_text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Review modal */}
      {showReviewModal && (
        <ReviewModal
          movie={movie}
          currentUser={currentUser}
          onClose={() => setShowReviewModal(false)}
          onSave={handleReviewSaved}
        />
      )}
    </div>
  );
}