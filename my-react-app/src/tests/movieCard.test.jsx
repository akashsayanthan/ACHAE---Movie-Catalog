import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MovieCard } from "../components/MovieCard";


vi.mock("../hooks/useInView", () => ({
  useInView: () => true,
}));

//Sample Movie
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

//Test Suite
describe("MovieCard", () => {

  //Rendering
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

    test("renders the vote count in thousands format when >= 1000", () => {
      renderCard();
      // 34512 → "34.5K VOTES"
      expect(screen.getByText("34.5K VOTES")).toBeInTheDocument();
    });

    test("renders raw vote count when fewer than 1000", () => {
      renderCard({
        movie: { ...sampleMovie, reviews: 450 },
      });
      expect(screen.getByText("450 VOTES")).toBeInTheDocument();
    });

    test("renders the movie poster image with correct src", () => {
      renderCard();
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("src", "https://example.com/inception.jpg");
    });

    test("renders the movie poster image with correct alt text", () => {
      renderCard();
      const img = screen.getByRole("img");
      expect(img).toHaveAttribute("alt", "Inception");
    });

    test("renders the index stamp", () => {
      renderCard();
      expect(screen.getByText("001")).toBeInTheDocument();
    });

    test("renders a truncated synopsis", () => {
      renderCard();
      expect(
        screen.getByText("A thief who steals corporate secrets through dream-sharing technology.")
      ).toBeInTheDocument();
    });
  });

  //On Click
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

  // Hover state
  describe("hover state", () => {
    test("applies hover styles on mouse enter", () => {
      const { container } = renderCard();
      const card = container.firstChild;
      fireEvent.mouseEnter(card);
      // Card border should include the accent color on hover
      expect(card.style.border).toContain("#2E6FA3");
    });

    test("removes hover styles on mouse leave", () => {
      const { container } = renderCard();
      const card = container.firstChild;
      fireEvent.mouseEnter(card);
      fireEvent.mouseLeave(card);
      // Border should revert to the default non-accent colour
      expect(card.style.border).not.toContain("#2E6FA3");
    });
  });

  // Visibility
  describe("visibility via useInView", () => {
    test("card is visible (opacity 1) when inView is true", () => {
      // useInView is mocked to return true at the top of this file
      const { container } = renderCard();
      expect(container.firstChild.style.opacity).toBe("1");
    });

    test("card is hidden (opacity 0) when inView is false", async () => {
      vi.doMock("../hooks/useInView", () => ({
        useInView: () => false,
      }));
      const { MovieCard: FreshMovieCard } = await import("../components/MovieCard");
      const { container } = render(
        <FreshMovieCard
          movie={sampleMovie}
          rank={0}
          onClick={noop}
          isAdmin={false}
          onAdminEdit={noop}
          onAdminDelete={noop}
        />
      );
      expect(container.firstChild.style.opacity).toBe("0");
    });
  });
});
