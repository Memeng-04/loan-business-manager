import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import AddBorrowerForm from "../AddBorrowerForm";

// Basic form behaviour: missing required fields should show error
describe("AddBorrowerForm", () => {
  test("shows validation error when required fields are empty", async () => {
    const onSubmit = vi.fn();
    const onCancel = vi.fn();

    render(<AddBorrowerForm onSubmit={onSubmit} onCancel={onCancel} />);

    // Submit the form programmatically to ensure the component's onSubmit handler runs
    const saveBtn = screen.getByRole("button", { name: /save/i });
    const form = saveBtn.closest("form") as HTMLFormElement | null;
    if (!form) throw new Error("form element not found");
    fireEvent.submit(form);

    // Component sets a formError string when required fields are missing
    expect(
      await screen.findByText(/Name, address, and phone number are required./i),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
