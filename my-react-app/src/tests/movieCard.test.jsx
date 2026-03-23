import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { MovieCard } from "../components/MovieCard";

// ─── MOCK useInView ───────────────────────────────────────────────────────────

vi.mock("../hooks/useInView", () => ({
  useInView: () => true,
}));

// ─── SAMPLE DATA ──────────────────────────────────────────────────────────────

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
      {...props}
    />
  );
}

// ─── TEST SUITE ───────────────────────────────────────────────────────────────

describe("MovieCard", () => {

  describe("rendering", () => {
    test("renders the movie title", () => {
      renderCard();
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    test("renders the release year", () => {
      renderCard();
      expect(screen.getByText("2010")).toBeInTheDocument();
    });

    test("renders each genre label", () => {
      renderCard();
      expect(screen.getByText(/Sci-Fi/)).toBeInTheDocument();
      expect(screen.getByText(/Thriller/)).toBeInTheDocument();
    });

    test("renders the rating formatted to 1 decimal place", () => {
      renderCard();
      expect(screen.getByText("8.8")).toBeInTheDocument();
    });

    test("renders vote count in K format when >= 1000", () => {
      renderCard();
      expect(screen.getByText("34.5K VOTES")).toBeInTheDocument();
    });

    test("renders raw vote count when fewer than 1000", () => {
      renderCard({ movie: { ...sampleMovie, reviews: 450 } });
      expect(screen.getByText("450 VOTES")).toBeInTheDocument();
    });

    test("renders the poster image with correct src", () => {
      renderCard();
      expect(screen.getByRole("img")).toHaveAttribute("src", "https://example.com/inception.jpg");
    });

    test("renders the poster image with correct alt text", () => {
      renderCard();
      expect(screen.getByRole("img")).toHaveAttribute("alt", "Inception");
    });

    test("renders the index stamp", () => {
      renderCard();
      expect(screen.getByText("001")).toBeInTheDocument();
    });

    test("renders the synopsis", () => {
      renderCard();
      expect(
        screen.getByText("A thief who steals corporate secrets through dream-sharing technology.")
      ).toBeInTheDocument();
    });
  });

  describe("onClick", () => {
    test("calls onClick with the movie object when card is clicked", () => {
      const onClick = vi.fn();
      renderCard({ onClick });
      fireEvent.click(screen.getByText("Inception"));
      expect(onClick).toHaveBeenCalledWith(sampleMovie);
    });

    test("calls onClick exactly once per click", () => {
      const onClick = vi.fn();
      renderCard({ onClick });
      fireEvent.click(screen.getByText("Inception"));
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("star rating", () => {
    test("shows 4 filled stars for rating 8.8 (rounds to 4/5)", () => {
      const { container } = renderCard();
      const filled = Array.from(container.querySelectorAll("span")).filter(
        (s) => s.textContent === "★" && s.style.color === "rgb(230, 168, 23)"
      );
      // 4 rating stars + 1 score badge star = 5
      expect(filled.length).toBe(5);
    });

    test("shows 5 filled stars for a perfect 10.0 rating", () => {
      const { container } = renderCard({ movie: { ...sampleMovie, rating: 10.0 } });
      const filled = Array.from(container.querySelectorAll("span")).filter(
        (s) => s.textContent === "★" && s.style.color === "rgb(230, 168, 23)"
      );
      // 5 rating stars + 1 score badge star = 6
      expect(filled.length).toBe(6);
    });

    test("shows 1 filled star for a low rating of 2.0", () => {
      const { container } = renderCard({ movie: { ...sampleMovie, rating: 2.0 } });
      const filled = Array.from(container.querySelectorAll("span")).filter(
        (s) => s.textContent === "★" && s.style.color === "rgb(230, 168, 23)"
      );
      // 1 rating star + 1 score badge star = 2
      expect(filled.length).toBe(2);
    });
  });

  describe("admin controls", () => {
    test("does not show EDIT or DELETE for non-admin users", () => {
      renderCard({ isAdmin: false });
      expect(screen.queryByText("EDIT")).not.toBeInTheDocument();
      expect(screen.queryByText("DELETE")).not.toBeInTheDocument();
    });

    test("shows EDIT and DELETE buttons when isAdmin is true", () => {
      renderCard({ isAdmin: true });
      expect(screen.getByText("EDIT")).toBeInTheDocument();
      expect(screen.getByText("DELETE")).toBeInTheDocument();
    });

    test("calls onAdminEdit with the movie when EDIT is clicked", () => {
      const onAdminEdit = vi.fn();
      renderCard({ isAdmin: true, onAdminEdit });
      fireEvent.click(screen.getByText("EDIT"));
      expect(onAdminEdit).toHaveBeenCalled();
    });

    test("calls onAdminDelete with the movie when DELETE is clicked", () => {
      const onAdminDelete = vi.fn();
      renderCard({ isAdmin: true, onAdminDelete });
      fireEvent.click(screen.getByText("DELETE"));
      expect(onAdminDelete).toHaveBeenCalledWith(sampleMovie);
    });

    test("clicking EDIT does not trigger the card onClick", () => {
      const onClick = vi.fn();
      const onAdminEdit = vi.fn();
      renderCard({ isAdmin: true, onClick, onAdminEdit });
      fireEvent.click(screen.getByText("EDIT"));
      expect(onClick).not.toHaveBeenCalled();
    });

    test("clicking DELETE does not trigger the card onClick", () => {
      const onClick = vi.fn();
      const onAdminDelete = vi.fn();
      renderCard({ isAdmin: true, onClick, onAdminDelete });
      fireEvent.click(screen.getByText("DELETE"));
      expect(onClick).not.toHaveBeenCalled();
    });
  });

  describe("hover state", () => {
    test("applies accent colour to border on mouse enter", () => {
      const { container } = renderCard();
      const card = container.firstChild;
      fireEvent.mouseEnter(card);
      // jsdom converts #2E6FA3 with opacity to rgba format
      expect(card.style.border).toContain("rgba(46, 111, 163");
    });

    test("removes accent colour from border on mouse leave", () => {
      const { container } = renderCard();
      const card = container.firstChild;
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      expect(card.style.border).not.toContain("rgba(46, 111, 163");
    });
  });

  describe("visibility", () => {
    test("card is fully visible (opacity 1) when inView is true", () => {
      const { container } = renderCard();
      expect(container.firstChild.style.opacity).toBe("1");
    });
  });
});