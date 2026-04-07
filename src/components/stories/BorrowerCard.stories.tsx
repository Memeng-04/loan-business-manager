import type { Meta, StoryObj } from "@storybook/react";
import BorrowerCard from "../borrowers/BorrowerCard/BorrowerCard";

const meta = {
  title: "Components/BorrowerCard",
  component: BorrowerCard,
  parameters: {
    layout: "centered",
  },
  render: (args) => (
    <ul
      style={{
        width: "min(720px, 92vw)",
        listStyle: "none",
        padding: 0,
        margin: 0,
      }}
    >
      <BorrowerCard {...args} />
    </ul>
  ),
} satisfies Meta<typeof BorrowerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    borrower: {
      full_name: "Juan Dela Cruz",
      email: "juan@example.com",
      address: "Purok 3, San Jose",
      phone: "09171234567",
    },
  },
};

export const Minimal: Story = {
  args: {
    borrower: {
      full_name: "Maria Santos",
      phone: "09981234567",
    },
  },
};
