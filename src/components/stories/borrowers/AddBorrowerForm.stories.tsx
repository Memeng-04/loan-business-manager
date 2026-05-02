import type { Meta, StoryObj } from "@storybook/react";
import AddBorrowerForm from "../../borrowers/AddBorrowerForm/AddBorrowerForm";

const meta = {
  title: "Components/Borrowers/AddBorrowerForm",
  component: AddBorrowerForm,
  parameters: {
    layout: "centered",
  },
  args: {
    onSubmit: async () => {},
    onCancel: () => {},
    loading: false,
    error: null,
  },
  render: (args) => (
    <div style={{ width: "min(860px, 94vw)" }}>
      <AddBorrowerForm {...args} />
    </div>
  ),
} satisfies Meta<typeof AddBorrowerForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockData: Story = {
  args: {
    initialValues: {
      full_name: "Juan Dela Cruz",
      email: "juan@example.com",
      address: "Purok 3, San Jose",
      phone: "09171234567",
      monthly_income: 18000,
      source_of_income: "Salary",
      secondary_contact_name: "Maria Dela Cruz",
      secondary_contact_number: "09991234567",
    },
  },
};

export const WithError: Story = {
  args: {
        initialValues: {
      full_name: "Juan Dela Cruz",
      email: "juan@example.com",
      address: "Purok 3, San Jose",
      phone: "09171234567",
      monthly_income: 18000,
      source_of_income: "Salary",
      secondary_contact_name: "Maria Dela Cruz",
      secondary_contact_number: "09991234567",
    },
    error: "Failed to save borrower. Please try again.",
  },
};

export const Saving: Story = {
  args: {
        initialValues: {
      full_name: "Juan Dela Cruz",
      email: "juan@example.com",
      address: "Purok 3, San Jose",
      phone: "09171234567",
      monthly_income: 18000,
      source_of_income: "Salary",
      secondary_contact_name: "Maria Dela Cruz",
      secondary_contact_number: "09991234567",
    },
    loading: true,
  },
};
