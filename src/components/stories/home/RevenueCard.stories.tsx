import type { Meta, StoryObj } from "@storybook/react";
import RevenueCard from "../../home/RevenueCard";

const meta = {
  title: "Components/Home/RevenueCard",
  component: RevenueCard,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof RevenueCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockData = [
  { name: "Daily", value: 5000 },
  { name: "Weekly", value: 3000 },
  { name: "Monthly", value: 8000 },
  { name: "Bi-Monthly", value: 2000 },
];

export const Default: Story = {
  args: {
    data: mockData,
    totalRevenue: 18000,
  },
};

export const NoData: Story = {
  args: {
    data: mockData,
    totalRevenue: 0,
  },
};
