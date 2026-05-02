import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import Button from "../Button";

describe("Button", () => {
  test("renders children and responds to click", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);

    const btn = screen.getByRole("button", { name: /click me/i });
    expect(btn).toBeInTheDocument();
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  test("back variant renders an icon before the label", () => {
    const { container } = render(<Button variant="back">Back</Button>);
    // back variant renders a lucide icon (svg) before text
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(screen.getByText(/back/i)).toBeInTheDocument();
  });
});
