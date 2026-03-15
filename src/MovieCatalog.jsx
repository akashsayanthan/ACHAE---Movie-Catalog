import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { API_KEY, BASE_URL, IMG_BASE, GENRE_MAP, ACCENTS, formatIndex } from "./lib/constants";
import { MovieCard } from "./components/MovieCard";
import { Modal } from "./components/Modal";
import { AuthModal } from "./components/AuthModal";
import { AdminMovieModal } from "./components/AdminMovieModal";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

export default function MovieCatalog() {
  // ── Movie state ──
  const [movies, setMovies] = useState([]);
  const [allGenres, setAllGenres] = useState(["ALL"]);
  const [activeGenre, setActiveGenre] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ── Auth state ──
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ── Admin action state ──
  const [showAddMovie, setShowAddMovie] = useState(false);
  const [editMovie, setEditMovie] = useState(null);
  const [deleteMovie, setDeleteMovie] = useState(null);

  // ── Restore session on mount ──
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) await loadUserProfile(session.user);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT" || !session) {
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (user) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      setCurrentUser({ ...user, username: profile.username, role: profile.role });
      setIsAdmin(profile.role === "admin");
    }
  };

  const handleAuthSuccess = (user, adminStatus) => {
    setCurrentUser(user);
    setIsAdmin(adminStatus);
    setShowAuthModal(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  // ── Fetch movies from TMDB ──
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

        const genres = ["ALL", ...new Set(mapped.flatMap((m) => m.genre))];
        setAllGenres(genres);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [searchQuery, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveGenre("ALL");
    setSearchQuery(searchInput);
  };

  const handleMovieDeleted = (deletedMovie) => {
    setMovies((prev) => prev.filter((m) => m.id !== deletedMovie.id));
    setDeleteMovie(null);
  };

  const handleMovieSaved = () => {
    setShowAddMovie(false);
    setEditMovie(null);
    setLoading(true);
    setPage((p) => p);
  };

  const filtered = activeGenre === "ALL"
    ? movies
    : movies.filter((m) => m.genre.includes(activeGenre));

  if (!authChecked) return null;

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
        textarea:focus { outline: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#f5f0e8" }}>

        {/* ── MASTHEAD ── */}
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
                margin: 0, fontFamily: "'Cormorant Garamond', serif",
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

          {/* Auth + Search */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", paddingBottom: "6px" }}>

            {/* Auth nav */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {currentUser ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {isAdmin && (
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: "8px",
                        letterSpacing: "2px", color: "#fff",
                        background: "#B83A10", borderRadius: "3px",
                        padding: "3px 8px", textTransform: "uppercase",
                      }}>
                        ADMIN
                      </span>
                    )}
                    <span style={{
                      fontFamily: "'DM Mono', monospace", fontSize: "10px",
                      letterSpacing: "1px", color: "#9A5A30",
                    }}>
                      {currentUser.username || currentUser.email}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => setShowAddMovie(true)}
                      style={{
                        background: "#1a1610", border: "none",
                        borderRadius: "3px", padding: "8px 14px",
                        cursor: "pointer", fontFamily: "'DM Mono', monospace",
                        fontSize: "9px", letterSpacing: "2px", color: "#f5f0e8",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
                      onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
                    >
                      + ADD FILM
                    </button>
                  )}

                  <button
                    onClick={handleLogout}
                    style={{
                      background: "none", border: "1px solid #e0d9ce",
                      borderRadius: "3px", padding: "8px 14px",
                      cursor: "pointer", fontFamily: "'DM Mono', monospace",
                      fontSize: "9px", letterSpacing: "2px", color: "#b0a898",
                      transition: "border-color 0.2s, color 0.2s",
                    }}
                    onMouseEnter={(e) => { e.target.style.borderColor = "#B83A10"; e.target.style.color = "#B83A10"; }}
                    onMouseLeave={(e) => { e.target.style.borderColor = "#e0d9ce"; e.target.style.color = "#b0a898"; }}
                  >
                    SIGN OUT
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: "#1a1610", border: "1px solid #1a1610",
                    borderRadius: "3px", padding: "8px 18px",
                    cursor: "pointer", fontFamily: "'DM Mono', monospace",
                    fontSize: "9px", letterSpacing: "2px", color: "#f5f0e8",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#2e2820")}
                  onMouseLeave={(e) => (e.target.style.background = "#1a1610")}
                >
                  SIGN IN
                </button>
              )}
            </div>

            {/* Search bar */}
            <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center" }}>
              <input
                type="text" value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search films..."
                style={{
                  background: "#fff", border: "1px solid #ddd6ca",
                  borderRight: "none", borderRadius: "3px 0 0 3px",
                  padding: "10px 16px", fontFamily: "'DM Mono', monospace",
                  fontSize: "10px", letterSpacing: "1px", color: "#1a1610", width: "220px",
                }}
              />
              <button
                type="submit"
                style={{
                  background: "#1a1610", border: "1px solid #1a1610",
                  borderRadius: "0 3px 3px 0", padding: "10px 16px",
                  cursor: "pointer", fontFamily: "'DM Mono', monospace",
                  fontSize: "9px", letterSpacing: "2px", color: "#f5f0e8",
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
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "9px", letterSpacing: "2px", color: "#bbb", marginLeft: "12px",
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

        {/* ── FILTER BAR ── */}
        <div style={{
          padding: "14px 56px", display: "flex",
          borderBottom: "1px solid #e0d9ce", alignItems: "center",
          background: "#f0ebe2", flexWrap: "wrap", gap: "4px",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: "9px",
            letterSpacing: "3px", color: "#c0b8a8",
            textTransform: "uppercase", marginRight: "16px",
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
                borderRadius: "3px", cursor: "pointer",
                fontFamily: "'DM Mono', monospace",
                fontSize: "10px", letterSpacing: "2px",
                textTransform: "uppercase",
                color: activeGenre === g ? "#9A5A30" : "#b0a898",
                padding: "6px 12px", transition: "color 0.2s, border-color 0.2s",
              }}
            >
              {g}
            </button>
          ))}
        </div>

        {/* ── CONTENT ── */}
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
            display: "flex", alignItems: "center", justifyContent: "center", height: "400px",
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
              <MovieCard
                key={movie.id}
                movie={movie}
                rank={i}
                onClick={setSelected}
                isAdmin={isAdmin}
                onAdminEdit={setEditMovie}
                onAdminDelete={setDeleteMovie}
              />
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {!loading && !error && filtered.length > 0 && (
          <div style={{
            display: "flex", justifyContent: "center", alignItems: "center",
            gap: "8px", padding: "0 56px 48px",
          }}>
            <button
              onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === 1}
              style={{
                background: "none", border: "1px solid #ddd6ca",
                borderRadius: "3px", padding: "8px 16px",
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
              fontSize: "9px", letterSpacing: "2px", color: "#b0a898", padding: "0 12px",
            }}>
              {page} / {totalPages}
            </span>
            <button
              onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              disabled={page === totalPages}
              style={{
                background: "none", border: "1px solid #ddd6ca",
                borderRadius: "3px", padding: "8px 16px",
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

        {/* ── FOOTER ── */}
        <div style={{
          padding: "32px 56px", borderTop: "1px solid #e0d9ce",
          background: "#eee8de",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "9px", letterSpacing: "3px", color: "#c0b8a8",
          }}>
            REEL · FILM CATALOG · POWERED BY TMDB
          </div>
          <div style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: "italic", fontSize: "13px", color: "#c0b8a8",
          }}>
            Click any card to expand
          </div>
        </div>
      </div>

      {/* ── MODALS ── */}
      <Modal
        movie={selected}
        onClose={() => setSelected(null)}
        isAdmin={isAdmin}
        onAdminEdit={setEditMovie}
      />
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
      {showAddMovie && (
        <AdminMovieModal
          onClose={() => setShowAddMovie(false)}
          onSave={handleMovieSaved}
        />
      )}
      {editMovie && (
        <AdminMovieModal
          editMovie={editMovie}
          onClose={() => setEditMovie(null)}
          onSave={handleMovieSaved}
        />
      )}
      {deleteMovie && (
        <DeleteConfirmModal
          movie={deleteMovie}
          onClose={() => setDeleteMovie(null)}
          onConfirm={handleMovieDeleted}
        />
      )}
    </>
  );
}