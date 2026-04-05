import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

export function FavouritesModal({ currentUser, onClose, onSelectMovie, onRemove }) {
  const [loaded, setLoaded] = useState(false);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoaded(true), 10); }, []);

  useEffect(() => {
    if (!currentUser) return;
    const fetchFavourites = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });
      if (!error && data) setFavourites(data);
      setLoading(false);
    };
    fetchFavourites();
  }, [currentUser]);

  const handleRemove = async (movieId, e) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", currentUser.id)
      .eq("movie_id", movieId);
    if (!error) {
      setFavourites((prev) => prev.filter((f) => f.movie_id !== movieId));
      onRemove?.(movieId);
    }
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
          background: "#faf7f2",
          border: "1px solid #e0d9ce",
          borderRadius: "6px",
          width: "100%", maxWidth: "860px",
          maxHeight: "88vh", display: "flex", flexDirection: "column",
          boxShadow: "0 32px 80px rgba(0,0,0,0.14)",
          opacity: loaded ? 1 : 0,
          transform: loaded ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s, transform 0.4s",
          position: "relative",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "32px 40px 24px",
          borderBottom: "1px solid #ede8e0",
          flexShrink: 0,
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: "9px",
            letterSpacing: "4px", color: "#c0b8a8",
            textTransform: "uppercase", marginBottom: "10px",
          }}>
            {currentUser?.username || "My"} · Favourites
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <h2 style={{
              margin: 0, fontFamily: "'Cormorant Garamond', serif",
              fontSize: "36px", fontWeight: "700", color: "#1a1610",
              letterSpacing: "-0.5px",
            }}>
              My Favourites
              {!loading && favourites.length > 0 && (
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "12px",
                  fontWeight: "400", color: "#b0a898", marginLeft: "14px",
                  letterSpacing: "1px",
                }}>
                  {favourites.length} {favourites.length === 1 ? "film" : "films"}
                </span>
              )}
            </h2>
            <button
              onClick={onClose}
              style={{
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

        {/* Content */}
        <div style={{ overflowY: "auto", padding: "24px 40px 32px", flex: 1 }}>
          {loading ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: "200px", flexDirection: "column", gap: "12px",
            }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "22px", fontStyle: "italic", color: "#c0b8a8",
              }}>
                Loading favourites...
              </div>
            </div>
          ) : favourites.length === 0 ? (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              height: "200px", flexDirection: "column", gap: "12px", textAlign: "center",
            }}>
              <div style={{ fontSize: "32px" }}>♡</div>
              <div style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "20px", fontStyle: "italic", color: "#c0b8a8",
              }}>
                No favourites yet.
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: "9px", letterSpacing: "2px", color: "#d0c8bc",
              }}>
                CLICK THE ♡ ON ANY FILM TO SAVE IT HERE
              </div>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
            }}>
              {favourites.map((fav) => (
                <div
                  key={fav.id}
                  onClick={() => {
                    onSelectMovie({
                      id: fav.movie_id,
                      title: fav.movie_title,
                      poster: fav.movie_poster,
                      year: fav.movie_year,
                      rating: fav.movie_rating || 0,
                      reviews: 0,
                      genre: fav.movie_genre || [],
                      synopsis: fav.movie_synopsis || "",
                      accent: "#9A5A30",
                      index: "♡",
                    });
                    onClose();
                  }}
                  style={{
                    cursor: "pointer",
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "#fff",
                    border: "1px solid #e8e2da",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
                    e.currentTarget.style.transform = "translateY(-3px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {/* Poster */}
                  <div style={{ position: "relative", height: "180px", overflow: "hidden" }}>
                    <img
                      src={fav.movie_poster || "https://via.placeholder.com/180x270?text=No+Poster"}
                      alt={fav.movie_title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, #fff 0%, transparent 60%)",
                    }} />
                    {/* Remove button */}
                    <button
                      onClick={(e) => handleRemove(fav.movie_id, e)}
                      title="Remove from favourites"
                      style={{
                        position: "absolute", top: "8px", right: "8px",
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid #f0c4bc",
                        borderRadius: "50%", width: "28px", height: "28px",
                        cursor: "pointer", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "14px", color: "#B83A10",
                        transition: "background 0.2s",
                        zIndex: 2,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#B83A10")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.9)")}
                    >
                      <span style={{ pointerEvents: "none", color: "inherit" }}>✕</span>
                    </button>
                    {/* Rating badge */}
                    {fav.movie_rating > 0 && (
                      <div style={{
                        position: "absolute", top: "8px", left: "8px",
                        background: "rgba(255,255,255,0.88)",
                        borderRadius: "4px", padding: "3px 7px",
                        display: "flex", alignItems: "center", gap: "4px",
                        zIndex: 2,
                      }}>
                        <span style={{ color: "#e6a817", fontSize: "10px" }}>★</span>
                        <span style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "10px", color: "#1a1a1a",
                        }}>
                          {Number(fav.movie_rating).toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ padding: "10px 12px 12px" }}>
                    <div style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: "14px", fontWeight: "700",
                      color: "#1c1c1c", lineHeight: 1.2,
                      marginBottom: "4px",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}>
                      {fav.movie_title}
                    </div>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "9px", color: "#bbb", letterSpacing: "1px",
                    }}>
                      {fav.movie_year}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}