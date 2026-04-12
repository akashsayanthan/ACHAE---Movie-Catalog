import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import { MovieCard } from "../components/MovieCard";
import { FavouritesModal } from "../components/FavouritesModal";
import { WatchedModal } from "../components/WatchedModal";
import { WishlistModal } from "../components/WishlistModal";

// MOCK useInView
vi.mock("../hooks/useInView", () => ({ useInView: () => true }));


// MOCK SUPABASE
const mockSelect = vi.fn();
const mockDelete = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => mockSelect(),
        }),
      }),
      delete: () => ({
        eq: () => ({
          eq: (col, val) => mockDelete(col, val),
        }),
      }),
    }),
  },
}));

// SAMPLE DATA 

const sampleMovie = {
  id: 42,
  title: "Inception",
  year: "2010",
  genre: ["Sci-Fi", "Thriller"],
  rating: 8.8,
  reviews: 34512,
  synopsis: "A thief who steals corporate secrets.",
  poster: "https://example.com/inception.jpg",
  accent: "#2E6FA3",
  index: "001",
};

const loggedInUser = { id: "user-123", username: "akash", role: "user" };

const makeFavItem = (overrides = {}) => ({
  id: "fav-1", user_id: "user-123",
  movie_id: "42", movie_title: "Inception",
  movie_poster: "https://example.com/inception.jpg",
  movie_year: "2010", movie_rating: 8.8,
  movie_genre: ["Sci-Fi", "Thriller"],
  movie_synopsis: "A thief who steals corporate secrets.",
  created_at: "2026-01-01T00:00:00Z",
  ...overrides,
});

const makeWatchedItem  = (o = {}) => ({ ...makeFavItem(), id: "wat-1", ...o });
const makeWishlistItem = (o = {}) => ({ ...makeFavItem(), id: "wis-1", ...o });

const noop = () => {};

function renderCard(props = {}) {
  return render(
    <MovieCard
      movie={sampleMovie}
      rank={0}
      onClick={noop}
      isAdmin={false}
      onAdminEdit={noop}
      onAdminDelete={noop}
      currentUser={loggedInUser}
      isFavourited={false}
      onToggleFavourite={noop}
      isWatched={false}
      onToggleWatched={noop}
      isWishlisted={false}
      onToggleWishlist={noop}
      {...props}
    />
  );
}

// 1. MOVIECARD — FAVOURITES BUTTON

describe("MovieCard — Favourites button", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("rendering", () => {
    test("shows 'Add to favourites' button when logged in and not favourited", () => {
      renderCard({ isFavourited: false });
      expect(screen.getByRole("button", { name: /add to favourites/i })).toBeInTheDocument();
    });

    test("shows 'Remove from favourites' button when already favourited", () => {
      renderCard({ isFavourited: true });
      expect(screen.getByRole("button", { name: /remove from favourites/i })).toBeInTheDocument();
    });

    test("does not show favourites button when no user is logged in", () => {
      renderCard({ currentUser: null });
      expect(screen.queryByRole("button", { name: /favourites/i })).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    test("calls onToggleFavourite with the movie when clicked", async () => {
      const onToggleFavourite = vi.fn().mockResolvedValue(undefined);
      renderCard({ onToggleFavourite });
      fireEvent.click(screen.getByRole("button", { name: /add to favourites/i }));
      await waitFor(() => expect(onToggleFavourite).toHaveBeenCalledWith(sampleMovie));
    });

    test("clicking favourites does not trigger the card onClick", async () => {
      const onClick = vi.fn();
      const onToggleFavourite = vi.fn().mockResolvedValue(undefined);
      renderCard({ onClick, onToggleFavourite });
      fireEvent.click(screen.getByRole("button", { name: /add to favourites/i }));
      await waitFor(() => expect(onToggleFavourite).toHaveBeenCalled());
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

// 2. MOVIECARD — WATCHED BUTTON

describe("MovieCard — Watched button", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("rendering", () => {
    test("shows 'Mark as watched' button when logged in and not watched", () => {
      renderCard({ isWatched: false });
      expect(screen.getByRole("button", { name: /mark as watched/i })).toBeInTheDocument();
    });

    test("shows 'Remove from watched' button when already marked watched", () => {
      renderCard({ isWatched: true });
      expect(screen.getByRole("button", { name: /remove from watched/i })).toBeInTheDocument();
    });

    test("does not show watched button when no user is logged in", () => {
      renderCard({ currentUser: null });
      expect(screen.queryByRole("button", { name: /watched/i })).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    test("calls onToggleWatched with the movie when clicked", async () => {
      const onToggleWatched = vi.fn().mockResolvedValue(undefined);
      renderCard({ onToggleWatched });
      fireEvent.click(screen.getByRole("button", { name: /mark as watched/i }));
      await waitFor(() => expect(onToggleWatched).toHaveBeenCalledWith(sampleMovie));
    });

    test("clicking watched does not trigger the card onClick", async () => {
      const onClick = vi.fn();
      const onToggleWatched = vi.fn().mockResolvedValue(undefined);
      renderCard({ onClick, onToggleWatched });
      fireEvent.click(screen.getByRole("button", { name: /mark as watched/i }));
      await waitFor(() => expect(onToggleWatched).toHaveBeenCalled());
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

// 3. MOVIECARD — WISHLIST BUTTON

describe("MovieCard — Wishlist button", () => {
  beforeEach(() => vi.clearAllMocks());

  describe("rendering", () => {
    test("shows 'Add to wishlist' button when logged in and not wishlisted", () => {
      renderCard({ isWishlisted: false });
      expect(screen.getByRole("button", { name: /add to wishlist/i })).toBeInTheDocument();
    });

    test("shows 'Remove from wishlist' button when already wishlisted", () => {
      renderCard({ isWishlisted: true });
      expect(screen.getByRole("button", { name: /remove from wishlist/i })).toBeInTheDocument();
    });

    test("does not show wishlist button when no user is logged in", () => {
      renderCard({ currentUser: null });
      expect(screen.queryByRole("button", { name: /wishlist/i })).not.toBeInTheDocument();
    });
  });

  describe("interaction", () => {
    test("calls onToggleWishlist with the movie when clicked", async () => {
      const onToggleWishlist = vi.fn().mockResolvedValue(undefined);
      renderCard({ onToggleWishlist });
      fireEvent.click(screen.getByRole("button", { name: /add to wishlist/i }));
      await waitFor(() => expect(onToggleWishlist).toHaveBeenCalledWith(sampleMovie));
    });

    test("clicking wishlist does not trigger the card onClick", async () => {
      const onClick = vi.fn();
      const onToggleWishlist = vi.fn().mockResolvedValue(undefined);
      renderCard({ onClick, onToggleWishlist });
      fireEvent.click(screen.getByRole("button", { name: /add to wishlist/i }));
      await waitFor(() => expect(onToggleWishlist).toHaveBeenCalled());
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});

// 4. MOVIECARD — ALL THREE BUTTONS TOGETHER

describe("MovieCard — all three list buttons together", () => {
  beforeEach(() => vi.clearAllMocks());

  test("all three buttons are visible simultaneously when logged in", () => {
    renderCard();
    expect(screen.getByRole("button", { name: /add to favourites/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /mark as watched/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add to wishlist/i })).toBeInTheDocument();
  });

  test("none of the three list buttons appear when logged out", () => {
    renderCard({ currentUser: null });
    expect(screen.queryByRole("button", { name: /favourites/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /watched/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /wishlist/i })).not.toBeInTheDocument();
  });

  test("each button toggles independently without triggering the others", async () => {
    const onToggleFavourite = vi.fn().mockResolvedValue(undefined);
    const onToggleWatched   = vi.fn().mockResolvedValue(undefined);
    const onToggleWishlist  = vi.fn().mockResolvedValue(undefined);
    renderCard({ onToggleFavourite, onToggleWatched, onToggleWishlist });

    fireEvent.click(screen.getByRole("button", { name: /add to favourites/i }));
    await waitFor(() => expect(onToggleFavourite).toHaveBeenCalledTimes(1));
    expect(onToggleWatched).not.toHaveBeenCalled();
    expect(onToggleWishlist).not.toHaveBeenCalled();
  });
});

// 5. FAVOURITES MODAL

describe("FavouritesModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(async () => {
    await act(async () => { vi.runAllTimers(); });
    vi.useRealTimers();
    cleanup();
  });

  describe("fetching", () => {
    test("shows loading state before data arrives", () => {
      mockSelect.mockReturnValueOnce(new Promise(() => {}));
      render(<FavouritesModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      expect(screen.getByText(/loading favourites/i)).toBeInTheDocument();
    });

    test("displays fetched favourites as poster cards", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeFavItem()], error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText("Inception")).toBeInTheDocument());
    });

    test("shows film count in heading when favourites exist", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeFavItem(), makeFavItem({ id: "fav-2", movie_id: "99", movie_title: "Dune" })], error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText(/2 films/i)).toBeInTheDocument());
    });

    test("shows empty state message when no favourites exist", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText(/no favourites yet/i)).toBeInTheDocument());
    });
  });

  describe("removing a film", () => {
    test("shows a remove button on each favourite card", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeFavItem()], error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByTitle(/remove from favourites/i)).toBeInTheDocument());
    });

    test("removes card from list after clicking remove", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeFavItem()], error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => fireEvent.click(screen.getByTitle(/remove from favourites/i)));
      await waitFor(() => expect(screen.queryByText("Inception")).not.toBeInTheDocument());
    });

    test("calls onRemove callback with the movie_id after removal", async () => {
      const onRemove = vi.fn();
      mockSelect.mockResolvedValueOnce({ data: [makeFavItem()], error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={onRemove} />);
      await waitFor(() => fireEvent.click(screen.getByTitle(/remove from favourites/i)));
      await waitFor(() => expect(onRemove).toHaveBeenCalledWith("42"));
    });
  });

  describe("selecting a film", () => {
    test("calls onSelectMovie and onClose when a poster card is clicked", async () => {
      const onSelectMovie = vi.fn();
      const onClose = vi.fn();
      mockSelect.mockResolvedValueOnce({ data: [makeFavItem()], error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={onClose} onSelectMovie={onSelectMovie} onRemove={noop} />);
      await waitFor(() => fireEvent.click(screen.getByText("Inception")));
      expect(onSelectMovie).toHaveBeenCalledWith(expect.objectContaining({ title: "Inception" }));
      expect(onClose).toHaveBeenCalled();
    });
  });

  describe("close button", () => {
    test("calls onClose when [ CLOSE ] is clicked", async () => {
      const onClose = vi.fn();
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<FavouritesModal currentUser={loggedInUser} onClose={onClose} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => fireEvent.click(screen.getByText("[ CLOSE ]")));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

// 6. WATCHED MODAL

describe("WatchedModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(async () => {
    await act(async () => { vi.runAllTimers(); });
    vi.useRealTimers();
    cleanup();
  });

  describe("fetching", () => {
    test("shows loading state before data arrives", () => {
      mockSelect.mockReturnValueOnce(new Promise(() => {}));
      render(<WatchedModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      expect(screen.getByText(/loading watched films/i)).toBeInTheDocument();
    });

    test("displays fetched watched films", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWatchedItem()], error: null });
      render(<WatchedModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText("Inception")).toBeInTheDocument());
    });

    test("shows film count in heading when watched films exist", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWatchedItem(), makeWatchedItem({ id: "wat-2", movie_id: "99", movie_title: "Dune" })], error: null });
      render(<WatchedModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText(/2 films/i)).toBeInTheDocument());
    });

    test("shows empty state when no watched films exist", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<WatchedModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText(/no watched films yet/i)).toBeInTheDocument());
    });
  });

  describe("removing a film", () => {
    test("shows a remove button on each watched card", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWatchedItem()], error: null });
      render(<WatchedModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByTitle(/remove from watched/i)).toBeInTheDocument());
    });

    test("removes card from list after clicking remove", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWatchedItem()], error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<WatchedModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => fireEvent.click(screen.getByTitle(/remove from watched/i)));
      await waitFor(() => expect(screen.queryByText("Inception")).not.toBeInTheDocument());
    });

    test("calls onRemove callback with the movie_id after removal", async () => {
      const onRemove = vi.fn();
      mockSelect.mockResolvedValueOnce({ data: [makeWatchedItem()], error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<WatchedModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={onRemove} />);
      await waitFor(() => fireEvent.click(screen.getByTitle(/remove from watched/i)));
      await waitFor(() => expect(onRemove).toHaveBeenCalledWith("42"));
    });
  });

  describe("close button", () => {
    test("calls onClose when [ CLOSE ] is clicked", async () => {
      const onClose = vi.fn();
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<WatchedModal currentUser={loggedInUser} onClose={onClose} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => fireEvent.click(screen.getByText("[ CLOSE ]")));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

// 7. WISHLIST MODAL

describe("WishlistModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(async () => {
    await act(async () => { vi.runAllTimers(); });
    vi.useRealTimers();
    cleanup();
  });

  describe("fetching", () => {
    test("shows loading state before data arrives", () => {
      mockSelect.mockReturnValueOnce(new Promise(() => {}));
      render(<WishlistModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      expect(screen.getByText(/loading wishlist/i)).toBeInTheDocument();
    });

    test("displays fetched wishlist films", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWishlistItem()], error: null });
      render(<WishlistModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText("Inception")).toBeInTheDocument());
    });

    test("shows film count in heading when wishlist has films", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWishlistItem(), makeWishlistItem({ id: "wis-2", movie_id: "99", movie_title: "Dune" })], error: null });
      render(<WishlistModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText(/2 films/i)).toBeInTheDocument());
    });

    test("shows empty state when wishlist is empty", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<WishlistModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByText(/your wishlist is empty/i)).toBeInTheDocument());
    });
  });

  describe("removing a film", () => {
    test("shows a remove button on each wishlist card", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWishlistItem()], error: null });
      render(<WishlistModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => expect(screen.getByTitle(/remove from wishlist/i)).toBeInTheDocument());
    });

    test("removes card from list after clicking remove", async () => {
      mockSelect.mockResolvedValueOnce({ data: [makeWishlistItem()], error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<WishlistModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => fireEvent.click(screen.getByTitle(/remove from wishlist/i)));
      await waitFor(() => expect(screen.queryByText("Inception")).not.toBeInTheDocument());
    });

    test("calls onRemove callback with the movie_id after removal", async () => {
      const onRemove = vi.fn();
      mockSelect.mockResolvedValueOnce({ data: [makeWishlistItem()], error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<WishlistModal currentUser={loggedInUser} onClose={noop} onSelectMovie={noop} onRemove={onRemove} />);
      await waitFor(() => fireEvent.click(screen.getByTitle(/remove from wishlist/i)));
      await waitFor(() => expect(onRemove).toHaveBeenCalledWith("42"));
    });
  });

  describe("close button", () => {
    test("calls onClose when [ CLOSE ] is clicked", async () => {
      const onClose = vi.fn();
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<WishlistModal currentUser={loggedInUser} onClose={onClose} onSelectMovie={noop} onRemove={noop} />);
      await waitFor(() => fireEvent.click(screen.getByText("[ CLOSE ]")));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});