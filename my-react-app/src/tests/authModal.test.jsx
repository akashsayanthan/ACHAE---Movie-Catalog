import React from "react";
import { render, screen, fireEvent, waitFor, act, cleanup } from "@testing-library/react";
import { vi, describe, test, expect, beforeEach, afterEach } from "vitest";
import { AuthModal } from "../components/AuthModal";

// MOCK SUPABASE 

const mockSignIn        = vi.fn();
const mockSignUp        = vi.fn();
const mockInsertProfile = vi.fn();
const mockSelectProfile = vi.fn();

vi.mock("../lib/supabaseClient", () => ({
  supabase: {
    auth: {
      signInWithPassword: (...args) => mockSignIn(...args),
      signUp:             (...args) => mockSignUp(...args),
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

// HELPERS 

const noop = () => {};

function renderAuthModal(props = {}) {
  return render(<AuthModal onClose={noop} onSuccess={noop} {...props} />);
}

// TESTS

describe("AuthModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(async () => {
    await act(async () => { vi.runAllTimers(); });
    vi.useRealTimers();
    cleanup();
  });

  // UT-04 to UT-05 - Rendering 

  describe("rendering", () => {
    test("UT-04-TB renders in login mode by default", () => {
      renderAuthModal();
      expect(screen.getByText("Welcome back.")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("you@example.com")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    });

    test("UT-05-TB shows register fields after clicking register link", () => {
      renderAuthModal();
      fireEvent.click(screen.getByText("Register here"));
      expect(screen.getByText("Join REEL.")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("your_username")).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText("••••••••")).toHaveLength(2);
    });
  });

  // UT-06 to UT-07 - switchMode

  describe("switchMode", () => {
    test("UT-06-TB clears form fields when switching to register", () => {
      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), {
        target: { value: "test@example.com" },
      });
      fireEvent.click(screen.getByText("Register here"));
      expect(screen.getByPlaceholderText("you@example.com").value).toBe("");
    });

    test("UT-07-TB switches back from register to login mode", () => {
      renderAuthModal();
      fireEvent.click(screen.getByText("Register here"));
      fireEvent.click(screen.getByText("Sign in instead"));
      expect(screen.getByText("Welcome back.")).toBeInTheDocument();
    });
  });

  // UT-08 to UT-10 - handleLogin 

  describe("handleLogin", () => {
    test("UT-08-CB calls signInWithPassword with the entered email and password", async () => {
      mockSignIn.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
      mockSelectProfile.mockResolvedValueOnce({ data: { username: "tester", role: "user" }, error: null });

      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "tester@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"),         { target: { value: "password123" } });
      fireEvent.click(screen.getByText("SIGN IN"));

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith({
          email: "tester@example.com",
          password: "password123",
        });
      });
    });

    test("UT-09-CB calls onSuccess with user object and isAdmin=false for a regular user", async () => {
      const onSuccess = vi.fn();
      mockSignIn.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
      mockSelectProfile.mockResolvedValueOnce({ data: { username: "tester", role: "user" }, error: null });

      renderAuthModal({ onSuccess });
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "tester@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"),         { target: { value: "password123" } });
      fireEvent.click(screen.getByText("SIGN IN"));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ username: "tester", role: "user" }),
          false
        );
      });
    });

    test("UT-09-CB calls onSuccess with isAdmin=true for an admin user", async () => {
      const onSuccess = vi.fn();
      mockSignIn.mockResolvedValueOnce({ data: { user: { id: "a1" } }, error: null });
      mockSelectProfile.mockResolvedValueOnce({ data: { username: "admin", role: "admin" }, error: null });

      renderAuthModal({ onSuccess });
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "admin@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"),         { target: { value: "adminpass" } });
      fireEvent.click(screen.getByText("SIGN IN"));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({ role: "admin" }),
          true
        );
      });
    });

    test("UT-10-CB displays error message when Supabase sign-in fails", async () => {
      mockSignIn.mockResolvedValueOnce({
        data: {},
        error: { message: "Invalid login credentials" },
      });

      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "bad@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"),         { target: { value: "wrongpass" } });
      fireEvent.click(screen.getByText("SIGN IN"));

      await waitFor(() => {
        expect(screen.getByText("✕ Invalid login credentials")).toBeInTheDocument();
      });
    });

    test("shows PLEASE WAIT... while request is in-flight", () => {
      mockSignIn.mockReturnValueOnce(new Promise(() => {}));

      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "tester@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"),         { target: { value: "password123" } });
      fireEvent.click(screen.getByText("SIGN IN"));

      expect(screen.getByText("PLEASE WAIT...")).toBeInTheDocument();
    });

    test("submits login when Enter is pressed in the password field", async () => {
      mockSignIn.mockResolvedValueOnce({ data: { user: { id: "u1" } }, error: null });
      mockSelectProfile.mockResolvedValueOnce({ data: { username: "tester", role: "user" }, error: null });

      renderAuthModal();
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "tester@example.com" } });
      fireEvent.change(screen.getByPlaceholderText("••••••••"),         { target: { value: "password123" } });
      fireEvent.keyDown(screen.getByPlaceholderText("••••••••"), { key: "Enter" });

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });
    });
  });

  // UT-11 to UT-14 - handleRegister 

  describe("handleRegister", () => {
    function fillRegisterForm({
      username = "newuser",
      email    = "new@example.com",
      password = "secure123",
      confirm  = "secure123",
    } = {}) {
      fireEvent.click(screen.getByText("Register here"));
      fireEvent.change(screen.getByPlaceholderText("your_username"),   { target: { value: username } });
      fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: email } });
      const pwFields = screen.getAllByPlaceholderText("••••••••");
      fireEvent.change(pwFields[0], { target: { value: password } });
      fireEvent.change(pwFields[1], { target: { value: confirm } });
    }

    test("UT-11-CB shows error if username is blank", () => {
      renderAuthModal();
      fillRegisterForm({ username: "" });
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));
      expect(screen.getByText("✕ Username is required.")).toBeInTheDocument();
    });

    test("UT-12-CB shows error if password is fewer than 6 characters", () => {
      renderAuthModal();
      fillRegisterForm({ password: "abc", confirm: "abc" });
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));
      expect(screen.getByText("✕ Password must be at least 6 characters.")).toBeInTheDocument();
    });

    test("shows error if passwords do not match", () => {
      renderAuthModal();
      fillRegisterForm({ password: "password1", confirm: "password2" });
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));
      expect(screen.getByText("✕ Passwords do not match.")).toBeInTheDocument();
    });

    test("UT-13-CB calls supabase.auth.signUp with correct credentials", async () => {
      mockSignUp.mockResolvedValueOnce({ data: { user: { id: "new-1" } }, error: null });
      mockInsertProfile.mockResolvedValueOnce({ error: null });

      renderAuthModal();
      fillRegisterForm();
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            email: "new@example.com",
            password: "secure123",
          })
        );
      });
    });

    test("inserts a profile row with role='user' after sign-up", async () => {
      mockSignUp.mockResolvedValueOnce({ data: { user: { id: "new-1" } }, error: null });
      mockInsertProfile.mockResolvedValueOnce({ error: null });

      renderAuthModal();
      fillRegisterForm({ username: "newuser" });
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));

      await waitFor(() => {
        expect(mockInsertProfile).toHaveBeenCalledWith(
          "profiles",
          [expect.objectContaining({ username: "newuser", role: "user" })]
        );
      });
    });

    test("UT-14-TB shows success message after successful registration", async () => {
      mockSignUp.mockResolvedValueOnce({ data: { user: { id: "new-1" } }, error: null });
      mockInsertProfile.mockResolvedValueOnce({ error: null });

      renderAuthModal();
      fillRegisterForm();
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));

      await waitFor(() => {
        expect(screen.getByText("✓ Account created! You can now log in.")).toBeInTheDocument();
      });
    });

    test("shows error if Supabase signUp fails", async () => {
      mockSignUp.mockResolvedValueOnce({ data: {}, error: { message: "Email already registered" } });

      renderAuthModal();
      fillRegisterForm();
      fireEvent.click(screen.getByText("CREATE ACCOUNT"));

      await waitFor(() => {
        expect(screen.getByText("✕ Email already registered")).toBeInTheDocument();
      });
    });
  });

  // UT-15 to UT-16 - onClose 

  describe("onClose", () => {
    test("UT-15-OB calls onClose when [ CLOSE ] button is clicked", () => {
      const onClose = vi.fn();
      renderAuthModal({ onClose });
      fireEvent.click(screen.getByText("[ CLOSE ]"));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("UT-16-OB calls onClose when backdrop overlay is clicked", () => {
      const onClose = vi.fn();
      const { container } = renderAuthModal({ onClose });
      fireEvent.click(container.firstChild);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    test("does NOT call onClose when modal inner content is clicked", () => {
      const onClose = vi.fn();
      renderAuthModal({ onClose });
      fireEvent.click(screen.getByText("Welcome back."));
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});