import { render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
vi.mock("@/src/auth", () => ({ signIn: vi.fn(), signOut: vi.fn() }));
import LoginPage from "@/app/login/page";

it("shows a labeled GitHub sign-in control and safe error feedback", async () => {
  const page = await LoginPage({
    searchParams: Promise.resolve({
      error: "AccessDenied",
      callbackUrl: "https://outside.example",
    }),
  });
  render(page);

  expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Continue with GitHub" })).toBeInTheDocument();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "This GitHub account is not authorized for organizer access.",
  );
  expect(screen.queryByText("https://outside.example")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Return to public page" })).toHaveAttribute("href", "/");
});
