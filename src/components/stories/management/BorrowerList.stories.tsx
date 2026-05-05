import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import BorrowerList from "../../../features/loans/management/BorrowerList";

const meta = {
  title: "Features/Management/BorrowerList",
  component: BorrowerList,
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
} satisfies Meta<typeof BorrowerList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockBorrowers = [
  { id: "1", full_name: "Juan Dela Cruz", phone: "09171234567" },
  { id: "2", full_name: "Maria Santos", phone: "09189876543" },
  { id: "3", full_name: "Antonio Ramos", phone: "09201112233" },
];

export const Default: Story = {
  args: {
    borrowers: mockBorrowers,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    borrowers: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    borrowers: [],
    loading: false,
  },
};
