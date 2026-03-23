import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";

// ─── MOCK SUPABASE ────────────────────────────────────────────────────────────
// These will handle the favorites table calls once the feature is built.

const mockInsertFavorite = vi.fn();
const mockDeleteFavorite = vi.fn();
const mockSelectFavorites = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: (table) => ({
      insert: (rows) => mockInsertFavorite(table, rows),
      delete: () => ({
        eq: (col, val) => mockDeleteFavorite(table, col, val),
      }),
      select: () => ({
        eq: (col, val) => mockSelectFavorites(table, col, val),
      }),
    }),
  },
}));

import { MovieCard } from "../components/MovieCard";

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

const sampleMovie = {
  id: 42,
  title: "Inception",
  year: "2010",
  genre: ["Sci-Fi", "Thriller"],
  rating: 8.8,
  reviews: 34512,
  synopsis: "A thief who steals corporate secrets through dream-sharing technology.",
  poster: "https://example.com/inception.jpg",
  accent: "#2E6FA3",
  index: "001",
};

const loggedInUser = { id: "user-123", username: "testuser", role: "user" };

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
      {...props}
    />
  );
}

// ─── FAVORITES TEST SUITE ─────────────────────────────────────────────────────
// USER STORY: As a registered user, I want to save movies to a favorites list,
// so that I can access them later.
//
// STATUS: RED — feature not yet implemented.
// These tests are expected to FAIL until the feature is built.

describe("Favorites feature (TDD - Red phase)", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  describe("favorites button rendering", () => {
    test("shows a favorites button on the card when a user is logged in", () => {
      renderCard({ currentUser: loggedInUser });
      // Expecting a button with accessible label or text indicating favorites
      expect(screen.getByRole("button", { name: /add to favorites/i })).toBeInTheDocument();
    });
  });

  // ── Adding to favorites ────────────────────────────────────────────────────

  describe("adding a movie to favorites", () => {
    test("calls supabase insert when the favorites button is clicked", async () => {
      mockInsertFavorite.mockResolvedValueOnce({ error: null });

      renderCard({ currentUser: loggedInUser, isFavorited: false });
      fireEvent.click(screen.getByRole("button", { name: /add to favorites/i }));

      await waitFor(() => {
        expect(mockInsertFavorite).toHaveBeenCalledWith(
          "favorites",
          expect.arrayContaining([
            expect.objectContaining({
              user_id: "user-123",
              movie_id: 42,
            }),
          ])
        );
      });
    });
  });

  // ── Favorites list page ────────────────────────────────────────────────────

  describe("favorites list", () => {
    test("fetches the user's favorites from Supabase on load", async () => {
      mockSelectFavorites.mockResolvedValueOnce({
        data: [{ movie_id: 42 }, { movie_id: 7 }],
        error: null,
      });

      // FavoritesPage component does not exist yet
      const { FavoritesPage } = await import("../components/FavoritesPage");
      render(<FavoritesPage currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(mockSelectFavorites).toHaveBeenCalledWith(
          "favorites",
          "user_id",
          "user-123"
        );
      });
    });
  });
});