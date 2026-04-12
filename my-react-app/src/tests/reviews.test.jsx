import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach } from "vitest";
import { ReviewModal } from "../components/ReviewModal";
import { ReviewsList } from "../components/ReviewsList";

// MOCK SUPABASE

const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockDelete = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: () => ({
      insert: (rows) => mockInsert(rows),
      select: () => ({
        eq: () => ({
          order: () => mockSelect(),
        }),
      }),
      delete: () => ({
        eq: (col, val) => mockDelete(col, val),
      }),
    }),
  },
}));

// SAMPLE DATA

const sampleMovie = {
  id: 42,
  title: "War Machine",
  year: "2026",
};

const loggedInUser = {
  id: "user-123",
  username: "akash",
  email: "akash@example.com",
  role: "user",
};

const adminUser = {
  id: "admin-001",
  username: "admin",
  email: "admin@example.com",
  role: "admin",
};

const sampleReviews = [
  {
    id: "r1",
    user_id: "user-123",
    movie_id: "42",
    movie_title: "War Machine",
    rating: 3,
    review_text: "Mid Movie Don't watch",
    username: "akash",
    created_at: "2026-03-24T15:07:33.465491+00:00",
  },
  {
    id: "r2",
    user_id: "user-456",
    movie_id: "42",
    movie_title: "War Machine",
    rating: 5,
    review_text: "Absolutely loved every minute of it.",
    username: "elias",
    created_at: "2026-03-25T10:00:00.000000+00:00",
  },
];

const noop = () => {};

// REVIEW MODAL — UT-45 to UT-67

describe("ReviewModal", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  // UT-45 to UT-50 - Rendering

  describe("rendering", () => {
    test("UT-45-TB renders the movie title in the heading", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      expect(screen.getByText("War Machine")).toBeInTheDocument();
    });

    test("UT-46-TB renders 5 star buttons", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      const stars = screen.getAllByRole("button", { name: /star/i });
      expect(stars).toHaveLength(5);
    });

    test("UT-47-TB renders the review textarea", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      expect(screen.getByPlaceholderText(/write your review/i)).toBeInTheDocument();
    });

    test("UT-48-TB renders the SUBMIT REVIEW button", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      expect(screen.getByRole("button", { name: /submit review/i })).toBeInTheDocument();
    });

    test("UT-49-TB renders a close button", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      expect(screen.getAllByRole("button", { name: /close/i }).length).toBeGreaterThan(0);
    });

    test("UT-50-CB shows character count as user types", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      const textarea = screen.getByPlaceholderText(/write your review/i);
      fireEvent.change(textarea, { target: { value: "Great film!" } });
      expect(screen.getByText("11 chars")).toBeInTheDocument();
    });
  });

  // UT-51 to UT-53 - Star rating 

  describe("star rating", () => {
    test("UT-51-CB all stars start unselected (aria-pressed false)", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      const stars = screen.getAllByRole("button", { name: /star/i });
      stars.forEach((star) => {
        expect(star).toHaveAttribute("aria-pressed", "false");
      });
    });

    test("UT-52-CB clicking a star sets it to aria-pressed true", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      const stars = screen.getAllByRole("button", { name: /star/i });
      fireEvent.click(stars[2]); // 3rd star
      expect(stars[2]).toHaveAttribute("aria-pressed", "true");
    });

    test("UT-53-CB clicking a different star updates the selection", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      const stars = screen.getAllByRole("button", { name: /star/i });
      fireEvent.click(stars[1]); // 2 stars
      fireEvent.click(stars[4]); // change to 5 stars
      expect(stars[4]).toHaveAttribute("aria-pressed", "true");
      expect(stars[1]).toHaveAttribute("aria-pressed", "false");
    });
  });

  // UT-54 to UT-57 - Validation

  describe("validation", () => {
    test("UT-54-CB shows error when submitting with no star rating selected", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      fireEvent.change(screen.getByPlaceholderText(/write your review/i), {
        target: { value: "Great film to watch!" },
      });
      fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
      expect(screen.getByText("✕ Please select a star rating.")).toBeInTheDocument();
    });

    test("UT-55-CB shows error when submitting with empty review text", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      const stars = screen.getAllByRole("button", { name: /star/i });
      fireEvent.click(stars[4]);
      fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
      expect(screen.getByText("✕ Review cannot be empty.")).toBeInTheDocument();
    });

    test("UT-56-CB shows error when review text is under 10 characters", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      const stars = screen.getAllByRole("button", { name: /star/i });
      fireEvent.click(stars[2]);
      fireEvent.change(screen.getByPlaceholderText(/write your review/i), {
        target: { value: "Too short" },
      });
      fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
      expect(screen.getByText("✕ Review must be at least 10 characters.")).toBeInTheDocument();
    });

    test("UT-57-CB does not call Supabase insert when validation fails", () => {
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
      expect(mockInsert).not.toHaveBeenCalled();
    });
  });

  // UT-58 to UT-64 - handleSubmit 

  describe("handleSubmit", () => {
    function fillAndSubmit(text = "Mid Movie Don't watch it.") {
      const stars = screen.getAllByRole("button", { name: /star/i });
      fireEvent.click(stars[2]); // 3 stars
      fireEvent.change(screen.getByPlaceholderText(/write your review/i), {
        target: { value: text },
      });
      fireEvent.click(screen.getByRole("button", { name: /submit review/i }));
    }

    test("UT-58-CB calls Supabase insert with correct fields including username", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      fillAndSubmit();

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({
            user_id: "user-123",
            movie_id: "42",
            movie_title: "War Machine",
            rating: 3,
            review_text: "Mid Movie Don't watch it.",
            username: "akash",
          }),
        ]);
      });
    });

    test("UT-59-CB uses email as username fallback when username is missing", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      const userWithoutUsername = { ...loggedInUser, username: undefined };
      render(<ReviewModal movie={sampleMovie} currentUser={userWithoutUsername} onClose={noop} onSave={noop} />);
      fillAndSubmit();

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({ username: "akash@example.com" }),
        ]);
      });
    });

    test("UT-60-CB stores movie_id as a string", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      fillAndSubmit();

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({ movie_id: "42" }),
        ]);
      });
    });

    test("UT-61-CB calls onSave after successful submit", async () => {
      const onSave = vi.fn();
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={onSave} />);
      fillAndSubmit();

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });
    });

    test("UT-62-TB shows SUBMITTING... on button while request is in flight", () => {
      mockInsert.mockReturnValueOnce(new Promise(() => {}));
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      fillAndSubmit();
      expect(screen.getByText("SUBMITTING...")).toBeInTheDocument();
    });

    test("UT-63-CB shows error message if Supabase insert fails", async () => {
      mockInsert.mockResolvedValueOnce({ error: { message: "DB connection failed" } });
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      fillAndSubmit();

      await waitFor(() => {
        expect(screen.getByText("✕ DB connection failed")).toBeInTheDocument();
      });
    });

    test("UT-64-CB trims whitespace from review text before saving", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={noop} onSave={noop} />);
      fillAndSubmit("   Great film overall!   ");

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({ review_text: "Great film overall!" }),
        ]);
      });
    });
  });

  // UT-65 to UT-67 - onClose

  describe("onClose", () => {
    test("UT-65-OB calls onClose when CANCEL button is clicked", () => {
      const onClose = vi.fn();
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={onClose} onSave={noop} />);
      fireEvent.click(screen.getByText("CANCEL"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("UT-66-OB calls onClose when [ CLOSE ] button is clicked", () => {
      const onClose = vi.fn();
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={onClose} onSave={noop} />);
      fireEvent.click(screen.getByText("[ CLOSE ]"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("UT-67-OB does NOT call onClose when modal inner content is clicked", () => {
      const onClose = vi.fn();
      render(<ReviewModal movie={sampleMovie} currentUser={loggedInUser} onClose={onClose} onSave={noop} />);
      fireEvent.click(screen.getByText("War Machine"));
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});


// REVIEWS LIST — UT-68 to UT-81

describe("ReviewsList", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  // UT-68 to UT-73 - Fetching reviews

  describe("fetching reviews", () => {
    test("UT-68-TB shows loading state initially", () => {
      mockSelect.mockReturnValueOnce(new Promise(() => {}));
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);
      expect(screen.getByText("LOADING REVIEWS...")).toBeInTheDocument();
    });

    test("UT-69-TB displays all fetched reviews", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(screen.getByText("Mid Movie Don't watch")).toBeInTheDocument();
        expect(screen.getByText("Absolutely loved every minute of it.")).toBeInTheDocument();
      });
    });

    test("UT-70-CB displays review usernames from the username field", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(screen.getByText("akash")).toBeInTheDocument();
        expect(screen.getByText("elias")).toBeInTheDocument();
      });
    });

    test("UT-71-CB shows Anonymous when username field is null", async () => {
      const reviewWithoutUsername = [{ ...sampleReviews[0], username: null }];
      mockSelect.mockResolvedValueOnce({ data: reviewWithoutUsername, error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(screen.getByText("Anonymous")).toBeInTheDocument();
      });
    });

    test("UT-72-OB shows empty message when no reviews exist", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(
          screen.getByText("No reviews yet. Be the first to share your thoughts.")
        ).toBeInTheDocument();
      });
    });

    test("UT-73-TB shows review count in header when reviews exist", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(screen.getByText(/REVIEWS \(2\)/)).toBeInTheDocument();
      });
    });
  });

  // UT-74 to UT-76 - Write a Review button

  describe("write a review button", () => {
    test("UT-74-OB shows the button when a user is logged in", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /write a review/i })).toBeInTheDocument();
      });
    });

    test("UT-75-OB hides the button when no user is logged in", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={null} />);

      await waitFor(() => {
        expect(screen.queryByRole("button", { name: /write a review/i })).not.toBeInTheDocument();
      });
    });

    test("UT-76-TB opens ReviewModal when Write a Review is clicked", async () => {
      mockSelect.mockResolvedValueOnce({ data: [], error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /write a review/i }));
      });

      expect(screen.getByPlaceholderText(/write your review/i)).toBeInTheDocument();
    });
  });

  // UT-77 to UT-81 - Deleting reviews

  describe("deleting reviews", () => {
    test("UT-77-CB shows DELETE button only on the current user's own reviews", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        // user-123 owns r1 only — exactly one DELETE button visible
        const deleteBtns = screen.getAllByRole("button", { name: /delete review/i });
        expect(deleteBtns).toHaveLength(1);
      });
    });

    test("UT-78-CB shows DELETE button only on r2 when logged in as user-456", async () => {
      const otherUser = { ...loggedInUser, id: "user-456", username: "elias" };
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={otherUser} />);

      await waitFor(() => {
        const deleteBtns = screen.getAllByRole("button", { name: /delete review/i });
        expect(deleteBtns).toHaveLength(1);
      });
    });

    test("UT-79-CB calls Supabase delete with the correct review id", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /delete review/i }));
      });

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith("id", "r1");
      });
    });

    test("UT-80-TB removes the deleted review from the list immediately", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        expect(screen.getByText("Mid Movie Don't watch")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: /delete review/i }));

      await waitFor(() => {
        expect(screen.queryByText("Mid Movie Don't watch")).not.toBeInTheDocument();
      });
    });

    test("UT-81-TB keeps other reviews visible after one is deleted", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={loggedInUser} />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole("button", { name: /delete review/i }));
      });

      await waitFor(() => {
        expect(screen.getByText("Absolutely loved every minute of it.")).toBeInTheDocument();
      });
    });

    test("admin can see DELETE button on all reviews regardless of ownership", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={adminUser} />);

      await waitFor(() => {
        // Admin owns neither r1 nor r2 but should see DELETE on both
        const deleteBtns = screen.getAllByRole("button", { name: /delete review/i });
        expect(deleteBtns).toHaveLength(2);
      });
    });

    test("admin DELETE calls Supabase delete with the correct review id", async () => {
      mockSelect.mockResolvedValueOnce({ data: sampleReviews, error: null });
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<ReviewsList movie={sampleMovie} currentUser={adminUser} />);

      await waitFor(() => {
        const deleteBtns = screen.getAllByRole("button", { name: /delete review/i });
        fireEvent.click(deleteBtns[0]); // click delete on r1
      });

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith("id", "r1");
      });
    });
  });
});