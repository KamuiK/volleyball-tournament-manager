import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/app/organizer/actions", () => ({ createTournamentAction: vi.fn() }));
vi.mock("@/app/login/actions", () => ({ signOutOrganizer: vi.fn() }));

import { SetupEmpty } from "@/app/organizer/setup-empty";

describe("organizer setup empty state", () => {
  it("offers explicit tournament creation when no current tournament exists", () => {
    render(<SetupEmpty />);
    expect(screen.getByRole("heading", { name: "No current tournament" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create tournament" })).toBeInTheDocument();
  });

  it("offers recovery for an existing current tournament missing fixed groups", () => {
    render(<SetupEmpty recovering />);
    expect(screen.getByRole("heading", { name: "Finish tournament setup" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Complete tournament setup" })).toBeInTheDocument();
  });
});
