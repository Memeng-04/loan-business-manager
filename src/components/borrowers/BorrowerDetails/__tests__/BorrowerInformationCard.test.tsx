import { render, screen } from "@testing-library/react";
import BorrowerInformationCard from "../BorrowerInformationCard";

// Simple smoke tests for the information card (non-edit view)
describe("BorrowerInformationCard", () => {
  const borrower = {
    full_name: "Juan Dela Cruz",
    address: "Purok 3",
    phone: "09171234567",
    email: "juan@example.com",
    monthly_income: 18000,
    source_of_income: "Salary",
    secondary_contact_name: "Maria",
    secondary_contact_number: "09991234567",
    created_at: "2026-04-08T00:00:00.000Z",
  } as any;

  test("renders key fields and edit button", () => {
    render(
      <BorrowerInformationCard
        borrower={borrower}
        createdDate="Apr 8, 2026"
        onSave={async () => true}
        saving={false}
      />,
    );

    expect(screen.getByText(/INFORMATION/i)).toBeInTheDocument();
    expect(screen.getByText("Apr 8, 2026")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit borrower details/i }),
    ).toBeInTheDocument();
  });
});
