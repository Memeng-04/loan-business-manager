import type { Meta, StoryObj } from "@storybook/react";
import BorrowerInformationCard from "../borrowers/BorrowerDetails/BorrowerInformationCard";

const meta = {
  title: "Components/Borrowers/BorrowerInformationCard",
  component: BorrowerInformationCard,
  parameters: {
    layout: "centered",
  },
  args: {
    borrower: {
      full_name: "Juan Dela Cruz",
      email: "juan@example.com",
      address: "Purok 3, San Jose",
      phone: "09171234567",
      monthly_income: 18000,
      source_of_income: "Salary",
      secondary_contact_name: "Maria Dela Cruz",
      secondary_contact_number: "09991234567",
      created_at: "2026-04-08T00:00:00.000Z",
    },
    createdDate: "Apr 8, 2026",
    onSave: async () => true,
    saving: false,
    saveError: null,
  },
  render: (args) => (
    <div style={{ width: "min(960px, 94vw)" }}>
      <BorrowerInformationCard {...args} />
    </div>
  ),
} satisfies Meta<typeof BorrowerInformationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    saveError: "Failed to save borrower. Please try again.",
  },
};

export const Saving: Story = {
  args: {
    saving: true,
  },
};
