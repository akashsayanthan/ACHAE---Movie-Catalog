import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { MovieCard } from "../components/MovieCard";

// MOCK useInView 

vi.mock("../hooks/useInView", () => ({
  useInView: () => true,
}));

//  SAMPLE DATA 

const sampleMovie = {
  id: 1,
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

const loggedInUser = { id: "user-123", username: "akash", role: "user" };

const noop = () => {};

// renderCard passes all required props including the list props added in Iteration 3.
// currentUser defaults to null so list buttons are hidden unless explicitly set.
function renderCard(props = {}) {
  return render(
    <MovieCard
      movie={sampleMovie}
      rank={0}
      onClick={noop}
      isAdmin={false}
      onAdminEdit={noop}
      onAdminDelete={noop}
      currentUser={null}
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

// TESTS 

describe("MovieCard", () => {

  beforeEach(() => { vi.clearAllMocks(); });

  // UT-17 to UT-26 - Rendering 

  describe("rendering", () => {
    test("UT-17-TB renders the movie title", () => {
      renderCard();
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    test("UT-18-TB renders the release year", () => {
      renderCard();
      expect(screen.getByText("2010")).toBeInTheDocument();
    });

    test("UT-19-TB renders each genre label", () => {
      renderCard();
      expect(screen.getByText(/Sci-Fi/)).toBeInTheDocument();
      expect(screen.getByText(/Thriller/)).toBeInTheDocument();
    });

    test("UT-20-TB renders the rating formatted to 1 decimal place", () => {
      renderCard();
      expect(screen.getByText("8.8")).toBeInTheDocument();
    });

    test("UT-21-TB renders vote count in K format when >= 1000", () => {
      renderCard();
      expect(screen.getByText("34.5K VOTES")).toBeInTheDocument();
    });

    test("UT-22-TB renders raw vote count when fewer than 1000", () => {
      renderCard({ movie: { ...sampleMovie, reviews: 450 } });
      expect(screen.getByText("450 VOTES")).toBeInTheDocument();
    });

    test("UT-23-TB renders the poster image with correct src", () => {
      renderCard();
      expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/inception.jpg");
    });

    test("UT-24-TB renders the poster image with correct alt text", () => {
      renderCard();
      expect(screen.getByRole("img")).toHaveAttribute("alt", "Inception");
    });

    test("UT-25-TB renders the index stamp", () => {
      renderCard();
      expect(screen.getByText("001")).toBeInTheDocument();
    });

    test("UT-26-TB renders the synopsis", () => {
      renderCard();
      expect(
        screen.getByText("A thief who steals corporate secrets through dream-sharing technology.")
      ).toBeInTheDocument();
    });
  });

  // UT-27 to UT-28 - onClick 

  describe("onClick", () => {
    test("UT-27-CB calls onClick with the movie object when card is clicked", () => {
      const onClick = vi.fn();
      renderCard({ onClick });
      fireEvent.click(screen.getByText("Inception"));
      expect(onClick).toHaveBeenCalledWith(sampleMovie);
    });

    test("UT-28-CB calls onClick exactly once per click", () => {
      const onClick = vi.fn();
      renderCard({ onClick });
      fireEvent.click(screen.getByText("Inception"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  // UT-29 to UT-31 - Star rating

  describe("star rating", () => {
    test("UT-29-CB shows 5 gold spans for rating 8.8 (4 rating stars + 1 score badge)", () => {
      const { container } = renderCard();
      const filled = Array.from(container.querySelectorAll("span")).filter(
        (s) => s.textContent === "★" && s.style.color === "rgb(230, 168, 23)"
      );
      expect(filled.length).toBe(5);
    });

    test("UT-30-CB shows 6 gold spans for a perfect 10.0 rating (5 rating stars + 1 score badge)", () => {
      const { container } = renderCard({ movie: { ...sampleMovie, rating: 10.0 } });
      const filled = Array.from(container.querySelectorAll("span")).filter(
        (s) => s.textContent === "★" && s.style.color === "rgb(230, 168, 23)"
      );
      expect(filled.length).toBe(6);
    });

    test("UT-31-CB shows 2 gold spans for a low rating of 2.0 (1 rating star + 1 score badge)", () => {
      const { container } = renderCard({ movie: { ...sampleMovie, rating: 2.0 } });
      const filled = Array.from(container.querySelectorAll("span")).filter(
        (s) => s.textContent === "★" && s.style.color === "rgb(230, 168, 23)"
      );
      expect(filled.length).toBe(2);
    });
  });

  // UT-32 to UT-35 - Admin controls

  describe("admin controls", () => {
    test("UT-32-CB does not show EDIT or DELETE for non-admin users", () => {
      renderCard({ isAdmin: false });
      expect(screen.queryByText("EDIT")).not.toBeInTheDocument();
      expect(screen.queryByText("DELETE")).not.toBeInTheDocument();
    });

    test("UT-33-TB shows EDIT and DELETE buttons when isAdmin is true", () => {
      renderCard({ isAdmin: true });
      expect(screen.getByText("EDIT")).toBeInTheDocument();
      expect(screen.getByText("DELETE")).toBeInTheDocument();
    });

    test("UT-34-CB calls onAdminEdit with the movie when EDIT is clicked and does not trigger card onClick", () => {
      const onClick = vi.fn();
      const onAdminEdit = vi.fn();
      renderCard({ isAdmin: true, onClick, onAdminEdit });
      fireEvent.click(screen.getByText("EDIT"));
      expect(onAdminEdit).toHaveBeenCalled();
      expect(onClick).not.toHaveBeenCalled();
    });

    test("UT-35-CB calls onAdminDelete with the movie when DELETE is clicked and does not trigger card onClick", () => {
      const onClick = vi.fn();
      const onAdminDelete = vi.fn();
      renderCard({ isAdmin: true, onClick, onAdminDelete });
      fireEvent.click(screen.getByText("DELETE"));
      expect(onAdminDelete).toHaveBeenCalledWith(sampleMovie);
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // UT-36 to UT-37 - Hover state

  describe("hover state", () => {
    test("UT-36-OB applies accent colour to border on mouse enter", () => {
      const { container } = renderCard();
      const card = container.firstChild;
      fireEvent.mouseEnter(card);
      // jsdom converts #2E6FA3 with 55 opacity suffix to rgba format
      expect(card.style.border).toContain("rgba(46, 111, 163");
    });

    test("UT-37-OB removes accent colour from border on mouse leave", () => {
      const { container } = renderCard();
      const card = container.firstChild;
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      expect(card.style.border).not.toContain("rgba(46, 111, 163");
    });
  });

  // UT-38 - Visibility 

  describe("visibility", () => {
    test("UT-38-OB card is fully visible (opacity 1) when inView is true", () => {
      const { container } = renderCard();
      expect(container.firstChild.style.opacity).toBe("1");
    });
  });

  // UT-39 to UT-44 - Favourites button 

  describe("favourites button — UT-39 to UT-44", () => {
    test("UT-39-OB shows heart button when currentUser is logged in", () => {
      renderCard({ currentUser: loggedInUser, isFavourited: false });
      expect(
        screen.getByRole("button", { name: /add to favourites/i })
      ).toBeInTheDocument();
    });

    test("UT-40-OB does not show heart button when currentUser is null", () => {
      renderCard({ currentUser: null });
      expect(
        screen.queryByRole("button", { name: /favourites/i })
      ).not.toBeInTheDocument();
    });

    test("UT-41-CB calls onToggleFavourite with the movie when unfavourited heart is clicked", async () => {
      const onToggleFavourite = vi.fn().mockResolvedValue(undefined);
      renderCard({ currentUser: loggedInUser, isFavourited: false, onToggleFavourite });
      fireEvent.click(screen.getByRole("button", { name: /add to favourites/i }));
      await waitFor(() => expect(onToggleFavourite).toHaveBeenCalledWith(sampleMovie));
    });

    test("UT-42-CB calls onToggleFavourite with the movie when favourited heart is clicked", async () => {
      const onToggleFavourite = vi.fn().mockResolvedValue(undefined);
      renderCard({ currentUser: loggedInUser, isFavourited: true, onToggleFavourite });
      fireEvent.click(screen.getByRole("button", { name: /remove from favourites/i }));
      await waitFor(() => expect(onToggleFavourite).toHaveBeenCalledWith(sampleMovie));
    });

    test("UT-43-TB shows filled heart (aria-label: Remove from favourites) when isFavourited is true", () => {
      renderCard({ currentUser: loggedInUser, isFavourited: true });
      expect(
        screen.getByRole("button", { name: /remove from favourites/i })
      ).toBeInTheDocument();
    });

    test("UT-44-TB shows empty heart (aria-label: Add to favourites) when isFavourited is false", () => {
      renderCard({ currentUser: loggedInUser, isFavourited: false });
      expect(
        screen.getByRole("button", { name: /add to favourites/i })
      ).toBeInTheDocument();
    });

    test("clicking heart does not trigger card onClick", async () => {
      const onClick = vi.fn();
      const onToggleFavourite = vi.fn().mockResolvedValue(undefined);
      renderCard({ currentUser: loggedInUser, isFavourited: false, onClick, onToggleFavourite });
      fireEvent.click(screen.getByRole("button", { name: /add to favourites/i }));
      await waitFor(() => expect(onToggleFavourite).toHaveBeenCalled());
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  // Watched & Wishlist buttons 

  describe("watched button", () => {
    test("shows watched button when currentUser is logged in", () => {
      renderCard({ currentUser: loggedInUser });
      expect(
        screen.getByRole("button", { name: /mark as watched/i })
      ).toBeInTheDocument();
    });

    test("does not show watched button when currentUser is null", () => {
      renderCard({ currentUser: null });
      expect(
        screen.queryByRole("button", { name: /watched/i })
      ).not.toBeInTheDocument();
    });

    test("shows Remove from watched label when isWatched is true", () => {
      renderCard({ currentUser: loggedInUser, isWatched: true });
      expect(
        screen.getByRole("button", { name: /remove from watched/i })
      ).toBeInTheDocument();
    });

    test("calls onToggleWatched with the movie when clicked", async () => {
      const onToggleWatched = vi.fn().mockResolvedValue(undefined);
      renderCard({ currentUser: loggedInUser, onToggleWatched });
      fireEvent.click(screen.getByRole("button", { name: /mark as watched/i }));
      await waitFor(() => expect(onToggleWatched).toHaveBeenCalledWith(sampleMovie));
    });

    test("clicking watched does not trigger card onClick", async () => {
      const onClick = vi.fn();
      const onToggleWatched = vi.fn().mockResolvedValue(undefined);
      renderCard({ currentUser: loggedInUser, onClick, onToggleWatched });
      fireEvent.click(screen.getByRole("button", { name: /mark as watched/i }));
      await waitFor(() => expect(onToggleWatched).toHaveBeenCalled());
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("wishlist button", () => {
    test("shows wishlist button when currentUser is logged in", () => {
      renderCard({ currentUser: loggedInUser });
      expect(
        screen.getByRole("button", { name: /add to wishlist/i })
      ).toBeInTheDocument();
    });

    test("does not show wishlist button when currentUser is null", () => {
      renderCard({ currentUser: null });
      expect(
        screen.queryByRole("button", { name: /wishlist/i })
      ).not.toBeInTheDocument();
    });

    test("shows Remove from wishlist label when isWishlisted is true", () => {
      renderCard({ currentUser: loggedInUser, isWishlisted: true });
      expect(
        screen.getByRole("button", { name: /remove from wishlist/i })
      ).toBeInTheDocument();
    });

    test("calls onToggleWishlist with the movie when clicked", async () => {
      const onToggleWishlist = vi.fn().mockResolvedValue(undefined);
      renderCard({ currentUser: loggedInUser, onToggleWishlist });
      fireEvent.click(screen.getByRole("button", { name: /add to wishlist/i }));
      await waitFor(() => expect(onToggleWishlist).toHaveBeenCalledWith(sampleMovie));
    });

    test("clicking wishlist does not trigger card onClick", async () => {
      const onClick = vi.fn();
      const onToggleWishlist = vi.fn().mockResolvedValue(undefined);
      renderCard({ currentUser: loggedInUser, onClick, onToggleWishlist });
      fireEvent.click(screen.getByRole("button", { name: /add to wishlist/i }));
      await waitFor(() => expect(onToggleWishlist).toHaveBeenCalled());
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("all three list buttons together", () => {
    test("all three buttons are visible simultaneously when logged in", () => {
      renderCard({ currentUser: loggedInUser });
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
      renderCard({ currentUser: loggedInUser, onToggleFavourite, onToggleWatched, onToggleWishlist });

      fireEvent.click(screen.getByRole("button", { name: /add to favourites/i }));
      await waitFor(() => expect(onToggleFavourite).toHaveBeenCalledTimes(1));
      expect(onToggleWatched).not.toHaveBeenCalled();
      expect(onToggleWishlist).not.toHaveBeenCalled();
    });
  });
});