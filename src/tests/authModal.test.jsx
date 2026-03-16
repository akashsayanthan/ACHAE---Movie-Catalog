import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthModal } from "../components/AuthModal";

//mock supabase
const mockSignIn = jest.fn();
const mockSignUp = jest.fn();
const mockInsertProfile = jest.fn();
const mockSelectProfile = jest.fn();

jest.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args) => mockSignIn(...args),
      signUp: (...args) => mockSignUp(...args),
    },
    from: (table) => ({
      insert: (rows) => mockInsertProfile(table, rows),
      select: () => ({
        eq: () => ({
          single: () => mockSelectProfile(table),
        }),
      }),
    }),
  },
}));

//helpers

const noop = () => {};

function renderAuthModal(props = {}) {
  return render(<AuthModal onClose={noop} onSuccess={noop} {...props} />);
}

// test Suite
describe("AuthModal", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Rendering

  describe("rendering", () => {
    test("renders in login mode by default", () => {
      renderAuthModal();
      expect(screen.getByText("Welcome back.")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    test("shows register fields after clicking register link", () => {
      renderAuthModal();
      fireEvent.click(screen.getByText("Register here"));
      expect(screen.getByText("Join REEL.")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("your_username")).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2);
    });
  });

  //switchMode

  describe("switchMode", () => {
    test("clears form fields when switching to register", () => {
      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "test@example.com" },
      });
      fireEvent.click(screen.getByText("Register here"));
      expect(screen.getByPlaceholderText("you@example.com").value).toBe("");
    });

    test("switches back from register to login mode", () => {
      renderAuthModal();
      fireEvent.click(screen.getByText("Register here"));
      fireEvent.click(screen.getByText("Sign in instead"));
      expect(screen.getByText("Welcome back.")).toBeInTheDocument();
    });
  });

  //handleLogin

  describe("handleLogin", () => {
    test("calls signInWithPassword with the entered email and password", async () => {
      mockSignIn.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
      mockSelectProfile.mockResolvedValueOnce({ data: { username: "tester", role: "user" }, error: null });

      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "tester@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("SIGN IN"));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: "tester@example.com",
          password: "password123",
        });
      });
    });

    test("calls onSuccess with user and isAdmin=false for a regular user", async () => {
      const onSuccess = jest.fn();
      mockSignIn.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
      mockSelectProfile.mockResolvedValueOnce({ data: { username: "tester", role: "user" }, error: null });

      renderAuthModal({ onSuccess });
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "tester@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "password123" },
      });
      fireEvent.click(screen.getByText("SIGN IN"));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ username: "tester", role: "user" }),
          false
        );
      });
    });

    test("displays error message when Supabase sign-in fails", async () => {
      mockSignIn.mockResolvedValueOnce({
        data: {},
        error: { message: "Invalid login credentials" },
      });

      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "bad@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("••••••••"), {
        target: { value: "wrongpass" },
      });
      fireEvent.click(screen.getByText("SIGN IN"));

      await waitFor(() => {
        expect(screen.getByText("✕ Invalid login credentials")).toBeInTheDocument();
      });
    });
  });

  // handleRegister 

  describe("handleRegister", () => {
    function fillRegisterForm({
      username = "newuser",
      email = "new@example.com",
      password = "secure123",
      confirm = "secure123",
    } = {}) {
      fireEvent.click(screen.getByText("Register here"));
      fireEvent.change(screen.getByPlaceholderText("your_username"), {
        target: { value: username },
      });
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: email },
      });
      const pwFields = screen.getAllByPlaceholderText("••••••••");
      fireEvent.change(pwFields[0], { target: { value: password } });
      fireEvent.change(pwFields[1], { target: { value: confirm } });
    }

    test("shows error if username is blank", () => {
      renderAuthModal();
      fillRegisterForm({ username: "" });
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));
      expect(screen.getByText("✕ Username is required.")).toBeInTheDocument();
    });

    test("shows error if password is fewer than 6 characters", () => {
      renderAuthModal();
      fillRegisterForm({ password: "abc", confirm: "abc" });
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));
      expect(screen.getByText("✕ Password must be at least 6 characters.")).toBeInTheDocument();
    });

    });


    test("shows success message after successful registration", async () => {
      mockSignUp.mockResolvedValueOnce({ data: { user: { id: "new-1" } }, error: null });
      mockInsertProfile.mockResolvedValueOnce({ error: null });

      renderAuthModal();
      fillRegtest("calls supabase.auth.signUp with correct credentials", async () => {
      mockSignUp.mockResolvedValueOnce({ data: { user: { id: "new-1" } }, error: null });
      mocisterForm();
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));

      await waitFor(() => {
        expect(screen.getByText("✓ Account created! You can now log in.")).toBeInTheDocument();
      });
    });
  });

  //onClose
  describe("onClose", () => {
    test("calls onClose when [ CLOSE ] button is clicked", () => {
      const onClose = jest.fn();
      renderAuthModal({ onClose });
      fireEvent.click(screen.getByText("[ CLOSE ]"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("calls onClose when backdrop overlay is clicked", () => {
      const onClose = jest.fn();
      const { container } = renderAuthModal({ onClose });
      fireEvent.click(container.firstChild);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});