import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import LoadingState from "../LoadingState";

describe("LoadingState", () => {
  test("renders compact variant message", () => {
    render(<LoadingState variant="compact" message="Fetching records..." />);
    expect(screen.getByText(/Fetching records.../i)).toBeInTheDocument();
  });

  test("error variant shows action button and calls onAction", () => {
    const onAction = vi.fn();
    render(
      <LoadingState
        fullScreen={true}
        variant="error"
        message="Failed"
        actionLabel="Retry"
        onAction={onAction}
      />,
    );

    const btn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(btn);
    expect(onAction).toHaveBeenCalled();
  });
});
