import React from "react";
import { render, screen } from "@testing-library/react";

// Mock Supabase so the session check in MovieCatalog doesn't cause
// state-update-outside-act warnings when App renders.
jest.mock("./lib/supabaseClient", () => ({
  supabase: {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },
    from: () => ({
      select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null }) }) }),
    }),
  },
}));

// Mock TMDB fetch so no real network calls are made
beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          results: [],
          total_pages: 1,
        }),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

import App from "./App";

test("renders the REEL masthead", async () => {
  render(<App />);
  // The main heading "REEL" should always be present
  expect(await screen.findByText("REEL")).toBeInTheDocument();
});

test("renders the Sign In button when no user is logged in", async () => {
  render(<App />);
  expect(await screen.findByText("SIGN IN")).toBeInTheDocument();
});

test("renders the film catalog subtitle", async () => {
  render(<App />);
  expect(await screen.findByText("A FILM CATALOG")).toBeInTheDocument();
});