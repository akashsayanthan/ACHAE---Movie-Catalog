import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import { AdminMovieModal } from "../components/AdminMovieModal";
import { DeleteConfirmModal } from "../components/DeleteConfirmModal";

// MOCK SUPABASE 

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    from: () => ({
      insert: (rows) => mockInsert(rows),
      update: (data) => ({
        eq: (col, val) => mockUpdate(data, col, val),
      }),
      delete: () => ({
        eq: (col, val) => mockDelete(col, val),
      }),
    }),
  },
}));

// SAMPLE DATA 

const noop = () => {};

const editMovieFixture = {
  supabaseId: "abc-123",
  tmdbId: null,
  title: "Inception",
  year: "2010",
  genre: ["Sci-Fi", "Thriller"],
  synopsis: "A thief who steals corporate secrets.",
  poster: "https://example.com/inception.jpg",
  rating: 8.8,
};

const tmdbMovieFixture = {
  id: 42,
  title: "War Machine",
  year: "2026",
  genre: ["Action", "Sci-Fi"],
  synopsis: "A soldier fights a machine.",
  poster: "https://example.com/warmachine.jpg",
  fromSupabase: false,
};

const supabaseMovieFixture = {
  id: "sb-abc",
  supabaseId: "abc",
  title: "War Machine",
  year: "2026",
  genre: ["Action", "Sci-Fi"],
  synopsis: "A soldier fights a machine.",
  poster: "https://example.com/warmachine.jpg",
  fromSupabase: true,
};

// ADMIN MOVIE MODAL — UT-82 to UT-91

describe("AdminMovieModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(async () => {
    await act(async () => { vi.runAllTimers(); });
    vi.useRealTimers();
    cleanup();
  });

  // UT-82 to UT-83 - Rendering 

  describe("rendering", () => {
    test("UT-82-TB shows 'Add New Film' heading and empty fields when no editMovie prop", () => {
      render(<AdminMovieModal onClose={noop} onSave={noop} />);
      expect(screen.getByText("Add New Film")).toBeInTheDocument();
      // Title and year inputs should be empty
      expect(screen.getByPlaceholderText("Movie title").value).toBe("");
      expect(screen.getByPlaceholderText("e.g. 2024").value).toBe("");
    });

    test("UT-83-TB shows 'Editing: Inception' heading and pre-filled fields when editMovie is provided", () => {
      render(<AdminMovieModal editMovie={editMovieFixture} onClose={noop} onSave={noop} />);
      expect(screen.getByText("Editing: Inception")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Movie title").value).toBe("Inception");
      expect(screen.getByPlaceholderText("e.g. 2024").value).toBe("2010");
    });
  });

  // UT-84 to UT-85 - Validation 

  describe("validation", () => {
    test("UT-84-CB shows error when title is blank", async () => {
      render(<AdminMovieModal onClose={noop} onSave={noop} />);
      // Leave title empty, fill year so only title fails
      fireEvent.change(screen.getByPlaceholderText("e.g. 2024"), { target: { value: "2024" } });
      fireEvent.click(screen.getByText("ADD FILM"));
      await waitFor(() => {
        expect(screen.getByText("✕ Title is required.")).toBeInTheDocument();
      });
    });

    test("UT-85-CB shows error when year is not a valid number", async () => {
      render(<AdminMovieModal onClose={noop} onSave={noop} />);
      fireEvent.change(screen.getByPlaceholderText("Movie title"), { target: { value: "Inception" } });
      fireEvent.change(screen.getByPlaceholderText("e.g. 2024"), { target: { value: "notayear" } });
      fireEvent.click(screen.getByText("ADD FILM"));
      await waitFor(() => {
        expect(screen.getByText("✕ Valid year is required.")).toBeInTheDocument();
      });
    });

    test("does not call Supabase when validation fails", async () => {
      render(<AdminMovieModal onClose={noop} onSave={noop} />);
      fireEvent.click(screen.getByText("ADD FILM"));
      await waitFor(() => {
        expect(screen.getByText("✕ Title is required.")).toBeInTheDocument();
      });
      expect(mockInsert).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  // UT-86 to UT-88 - handleSave

  describe("handleSave", () => {
    function fillForm({ title = "Inception", year = "2010", genre = "" } = {}) {
      fireEvent.change(screen.getByPlaceholderText("Movie title"), { target: { value: title } });
      fireEvent.change(screen.getByPlaceholderText("e.g. 2024"),   { target: { value: year } });
      if (genre) {
        fireEvent.change(screen.getByPlaceholderText("e.g. Action, Drama"), { target: { value: genre } });
      }
    }

    test("UT-86-CB insert called with genre split into array on add", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<AdminMovieModal onClose={noop} onSave={noop} />);
      fillForm({ genre: "Action, Drama" });
      fireEvent.click(screen.getByText("ADD FILM"));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({ genre: ["Action", "Drama"] }),
        ]);
      });
    });

    test("UT-87-CB update called with supabaseId on edit; insert NOT called", async () => {
      mockUpdate.mockResolvedValueOnce({ error: null });
      render(<AdminMovieModal editMovie={editMovieFixture} onClose={noop} onSave={noop} />);
      fireEvent.click(screen.getByText("SAVE CHANGES"));

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({ title: "Inception" }),
          "id",
          "abc-123"
        );
      });
      expect(mockInsert).not.toHaveBeenCalled();
    });

    test("UT-88-CB title is trimmed before saving", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<AdminMovieModal onClose={noop} onSave={noop} />);
      fillForm({ title: "  Inception  " });
      fireEvent.click(screen.getByText("ADD FILM"));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({ title: "Inception" }),
        ]);
      });
    });

    test("UT-89-TB calls onSave once after a successful insert", async () => {
      const onSave = vi.fn();
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<AdminMovieModal onClose={noop} onSave={onSave} />);
      fillForm();
      fireEvent.click(screen.getByText("ADD FILM"));

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledTimes(1);
      });
    });

    test("UT-90-TB button shows SAVING... while request is in flight", () => {
      mockInsert.mockReturnValueOnce(new Promise(() => {}));
      render(<AdminMovieModal onClose={noop} onSave={noop} />);
      fillForm();
      fireEvent.click(screen.getByText("ADD FILM"));
      expect(screen.getByText("SAVING...")).toBeInTheDocument();
    });
  });

  // UT-91 - onClose

  describe("onClose", () => {
    test("UT-91-OB calls onClose when CANCEL button is clicked", () => {
      const onClose = vi.fn();
      render(<AdminMovieModal onClose={onClose} onSave={noop} />);
      fireEvent.click(screen.getByText("CANCEL"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});

// DELETE CONFIRM MODAL — UT-92 to UT-98

describe("DeleteConfirmModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(async () => {
    await act(async () => { vi.runAllTimers(); });
    vi.useRealTimers();
    cleanup();
  });

  // UT-92 - Rendering 

  describe("rendering", () => {
    test("UT-92-TB shows Remove heading with the movie title", () => {
      render(<DeleteConfirmModal movie={supabaseMovieFixture} onClose={noop} onConfirm={noop} />);
      // Component renders: Remove "{movie.title}"?
      expect(screen.getByText(`Remove "${supabaseMovieFixture.title}"?`)).toBeInTheDocument();
    });
  });

  // UT-93 to UT-97  handleDelete 

  describe("handleDelete", () => {
    test("UT-93-CB calls Supabase delete with supabaseId for a Supabase film", async () => {
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<DeleteConfirmModal movie={supabaseMovieFixture} onClose={noop} onConfirm={noop} />);
      fireEvent.click(screen.getByText("YES, DELETE"));

      await waitFor(() => {
        expect(mockDelete).toHaveBeenCalledWith("id", "abc");
      });
    });

    test("UT-94-CB calls Supabase insert with tmdb_id and deleted:true for a TMDB film", async () => {
      mockInsert.mockResolvedValueOnce({ error: null });
      render(<DeleteConfirmModal movie={tmdbMovieFixture} onClose={noop} onConfirm={noop} />);
      fireEvent.click(screen.getByText("YES, DELETE"));

      await waitFor(() => {
        expect(mockInsert).toHaveBeenCalledWith([
          expect.objectContaining({ tmdb_id: 42, deleted: true }),
        ]);
      });
    });

    test("UT-95-CB calls onConfirm with the movie object after successful delete", async () => {
      const onConfirm = vi.fn();
      mockDelete.mockResolvedValueOnce({ error: null });
      render(<DeleteConfirmModal movie={supabaseMovieFixture} onClose={noop} onConfirm={onConfirm} />);
      fireEvent.click(screen.getByText("YES, DELETE"));

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledWith(supabaseMovieFixture);
      });
    });

    test("UT-96-TB button shows DELETING... while request is in flight", () => {
      mockDelete.mockReturnValueOnce(new Promise(() => {}));
      render(<DeleteConfirmModal movie={supabaseMovieFixture} onClose={noop} onConfirm={noop} />);
      fireEvent.click(screen.getByText("YES, DELETE"));
      expect(screen.getByText("DELETING...")).toBeInTheDocument();
    });

    test("UT-97-CB shows error message and does NOT call onConfirm when Supabase returns error", async () => {
      const onConfirm = vi.fn();
      mockDelete.mockResolvedValueOnce({ error: { message: "Delete failed" } });
      render(<DeleteConfirmModal movie={supabaseMovieFixture} onClose={noop} onConfirm={onConfirm} />);
      fireEvent.click(screen.getByText("YES, DELETE"));

      await waitFor(() => {
        expect(screen.getByText("✕ Delete failed")).toBeInTheDocument();
      });
      expect(onConfirm).not.toHaveBeenCalled();
    });
  });

  // UT-98 - onClose 

  describe("onClose", () => {
    test("UT-98-OB calls onClose when CANCEL button is clicked", () => {
      const onClose = vi.fn();
      render(<DeleteConfirmModal movie={supabaseMovieFixture} onClose={onClose} onConfirm={noop} />);
      fireEvent.click(screen.getByText("CANCEL"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});