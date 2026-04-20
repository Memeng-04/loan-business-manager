import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import DueCard from "../../home/DueCard";

const meta = {
  title: "Components/Home/DueCard",
  component: DueCard,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof DueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockItems = [
  { borrowerName: "Juan Dela Cruz", amountDue: 2500 },
  { borrowerName: "Maria Santos", amountDue: 5000 },
  { borrowerName: "Antonio Ramos", amountDue: 3200 },
];

export const Default: Story = {
  args: {
    items: mockItems,
  },
};

export const Empty: Story = {
  args: {
    items: [],
  },
};

export const ManyItems: Story = {
  args: {
    items: [
      { borrowerName: "Juan Dela Cruz", amountDue: 2500 },
      { borrowerName: "Maria Santos", amountDue: 5000 },
      { borrowerName: "Antonio Ramos", amountDue: 3200 },
      { borrowerName: "Pedro Lopez", amountDue: 1500 },
      { borrowerName: "Carmen Rodriguez", amountDue: 4000 },
    ],
  },
};
