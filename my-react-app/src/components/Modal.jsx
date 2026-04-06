import { useState, useEffect } from "react";
import { ReviewsList } from "./ReviewsList";
import { API_KEY, BASE_URL, IMG_BASE, GENRE_MAP, GENRE_NAME_TO_ID } from "../lib/constants";

export function Modal({ movie, onClose, isAdmin, onAdminEdit, currentUser, onSelectMovie }) {
  const [loaded, setLoaded] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  useEffect(() => {
    if (movie) setTimeout(() => setLoaded(true), 10);
    else setLoaded(false);
  }, [movie]);

  // Fetch similar movies whenever modal opens
  useEffect(() => {
    if (!movie) return;
    setSimilar([]);
    setSimilarLoading(true);

    const fetchSimilar = async () => {
      // TMDB movies have a numeric id — use recommendations + similar endpoints
      const tmdbId = movie.tmdbId || (typeof movie.id === "number" ? movie.id : null);

      if (tmdbId) {
        // Try recommendations first (better quality results)
        const recRes = await fetch(
          `${BASE_URL}/movie/${tmdbId}/recommendations?api_key=${API_KEY}&page=1`
        );
        const recData = await recRes.json();
        let results = (recData.results || []).filter((m) => m.poster_path).slice(0, 8);

        // If recommendations are sparse, supplement with similar
        if (results.length < 4) {
          const simRes = await fetch(
            `${BASE_URL}/movie/${tmdbId}/similar?api_key=${API_KEY}&page=1`
          );
          const simData = await simRes.json();
          const simResults = (simData.results || [])
            .filter((m) => m.poster_path && !results.find((r) => r.id === m.id))
            .slice(0, 8 - results.length);
          results = [...results, ...simResults];
        }

        setSimilar(results.map((m) => ({
          id: m.id,
          title: m.title,
          year: m.release_date ? m.release_date.slice(0, 4) : "N/A",
          genre: (m.genre_ids || []).slice(0, 2).map((id) => GENRE_MAP[id] || "Other"),
          rating: m.vote_average || 0,
          reviews: m.vote_count || 0,
          synopsis: m.overview || "",
          poster: IMG_BASE + m.poster_path,
          accent: movie.accent,
          index: "001",
        })));
      } else {
        // Supabase-added film — fall back to genre-based discover
        const primaryGenre = movie.genre?.[0];
        const genreId = primaryGenre ? GENRE_NAME_TO_ID[primaryGenre] : null;
        if (!genreId) { setSimilarLoading(false); return; }

        const res = await fetch(
          `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&vote_count.gte=50&page=1`
        );
        const data = await res.json();
        setSimilar(
          (data.results || [])
            .filter((m) => m.poster_path && m.title !== movie.title)
            .slice(0, 8)
            .map((m) => ({
              id: m.id,
              title: m.title,
              year: m.release_date ? m.release_date.slice(0, 4) : "N/A",
              genre: (m.genre_ids || []).slice(0, 2).map((id) => GENRE_MAP[id] || "Other"),
              rating: m.vote_average || 0,
              reviews: m.vote_count || 0,
              synopsis: m.overview || "",
              poster: IMG_BASE + m.poster_path,
              accent: movie.accent,
              index: "001",
            }))
        );
      }
      setSimilarLoading(false);
    };

    fetchSimilar().catch(() => setSimilarLoading(false));
  }, [movie?.id]);

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

          {/* Reviews section */}
          <ReviewsList movie={movie} currentUser={currentUser} />

          {/* Similar movies */}
          {(similarLoading || similar.length > 0) && (
            <div style={{ marginTop: "8px" }}>
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "12px",
                paddingBottom: "10px", borderBottom: "1px solid #ede8e0",
              }}>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "9px",
                  letterSpacing: "2.5px", textTransform: "uppercase", color: "#b0a898",
                }}>
                  YOU MIGHT ALSO LIKE
                </span>
              </div>

              {similarLoading ? (
                <div style={{
                  fontFamily: "'DM Mono', monospace", fontSize: "9px",
                  color: "#ccc", letterSpacing: "2px",
                }}>
                  LOADING...
                </div>
              ) : (
                <div style={{
                  display: "flex", gap: "10px",
                  overflowX: "auto", paddingBottom: "8px",
                  // Hide scrollbar but keep scroll
                  scrollbarWidth: "none", msOverflowStyle: "none",
                }}>
                  {similar.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onSelectMovie(m)}
                      style={{
                        flexShrink: 0, width: "100px", cursor: "pointer",
                        borderRadius: "4px", overflow: "hidden",
                        border: "1px solid #e8e2da",
                        background: "#fff",
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {/* Poster */}
                      <div style={{ position: "relative", height: "148px" }}>
                        <img
                          src={m.poster}
                          alt={m.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                        {/* Rating badge */}
                        {m.rating > 0 && (
                          <div style={{
                            position: "absolute", bottom: "5px", left: "5px",
                            background: "rgba(0,0,0,0.72)",
                            borderRadius: "3px", padding: "2px 5px",
                            display: "flex", alignItems: "center", gap: "3px",
                          }}>
                            <span style={{ color: "#e6a817", fontSize: "8px" }}>★</span>
                            <span style={{
                              fontFamily: "'DM Mono', monospace",
                              fontSize: "8px", color: "#fff",
                            }}>
                              {m.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Title */}
                      <div style={{ padding: "6px 7px 8px" }}>
                        <div style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: "11px", fontWeight: "700",
                          color: "#1c1c1c", lineHeight: 1.2,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}>
                          {m.title}
                        </div>
                        <div style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: "8px", color: "#bbb",
                          marginTop: "3px", letterSpacing: "0.5px",
                        }}>
                          {m.year}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
