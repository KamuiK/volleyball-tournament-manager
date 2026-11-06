import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import Home from "@/app/page";

test("renders the application name and purpose", () => {
  render(<Home />);

  expect(
    screen.getByRole("heading", { level: 1, name: "Volleyball Tournament Manager" })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/Manage teams, courts, results, standings/i)
  ).toBeInTheDocument();
});
