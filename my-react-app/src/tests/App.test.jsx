import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import App from "../App";

// MOCK SUPABASE 
// Prevents state-update-outside-act warnings when App renders and

vi.mock("./lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null }),
        }),
      }),
    }),
  },
}));

// MOCK TMDB FETCH

beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ results: [], total_pages: 1 }),
    })
  );
});

afterEach(() => {
  vi.resetAllMocks();
});

// TESTS 
describe("App", () => {
  test("UT-01-TB renders the REEL masthead", async () => {
    render(<App />);
    expect(await screen.findByText("REEL")).toBeInTheDocument();
  });

  test("UT-02-TB renders the Sign In button when no user is logged in", async () => {
    render(<App />);
    expect(await screen.findByText("SIGN IN")).toBeInTheDocument();
  });

  test("UT-03-TB renders the film catalog subtitle", async () => {
    render(<App />);
    expect(await screen.findByText("A FILM CATALOG")).toBeInTheDocument();
  });
});