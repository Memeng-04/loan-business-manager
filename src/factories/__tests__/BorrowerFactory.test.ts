import { BorrowerFactory } from "../BorrowerFactory";
import type { CreateBorrowerInput } from "../../types/borrowers";

describe("BorrowerFactory", () => {
  it("trims full_name and normalizes empty optional text fields to null", () => {
    const input: CreateBorrowerInput = {
      full_name: "  Jane Doe  ",
      phone: "   ",
      email: "   ",
      address: "",
      source_of_income: "  ",
      secondary_contact_name: "",
      secondary_contact_number: " ",
    };

    const payload = BorrowerFactory.create(input);

    expect(payload).toEqual({
      full_name: "Jane Doe",
      phone: null,
      email: null,
      address: null,
      monthly_income: null,
      source_of_income: null,
      secondary_contact_name: null,
      secondary_contact_number: null,
    });
  });

  it("keeps non-empty values and monthly_income", () => {
    const input: CreateBorrowerInput = {
      full_name: " John Smith ",
      phone: " 08012345678 ",
      email: " john@example.com ",
      address: " 12 Main St ",
      monthly_income: 4500,
      source_of_income: " Salary ",
      secondary_contact_name: " Mary ",
      secondary_contact_number: " 09099999999 ",
    };

    const payload = BorrowerFactory.create(input);

    expect(payload).toEqual({
      full_name: "John Smith",
      phone: "08012345678",
      email: "john@example.com",
      address: "12 Main St",
      monthly_income: 4500,
      source_of_income: "Salary",
      secondary_contact_name: "Mary",
      secondary_contact_number: "09099999999",
    });
  });
});
