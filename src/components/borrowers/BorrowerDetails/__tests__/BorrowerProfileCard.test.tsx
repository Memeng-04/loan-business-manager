import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import BorrowerProfileCard from "../BorrowerProfileCard";

// Simple component test: ensure text renders and callbacks are wired
describe("BorrowerProfileCard", () => {
  test("renders borrower name and view profile button calls handler", () => {
    const onView = vi.fn();
    render(
      <BorrowerProfileCard name="Juan Dela Cruz" onViewProfile={onView} onBack={() => {}} />,
    );

    expect(screen.getByText("Juan Dela Cruz")).toBeInTheDocument();

    // Click the view profile button (text is 'View Profile' in the component)
    fireEvent.click(screen.getByRole("button", { name: /view profile/i }));
    expect(onView).toHaveBeenCalled();
  });

  test("back button calls onBack", () => {
    const onBack = vi.fn();
    render(<BorrowerProfileCard name="Juan" onBack={onBack} />);

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
