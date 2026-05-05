import type { Meta, StoryObj } from "@storybook/react";
import BalanceCard from "../../home/BalanceCard";

const meta = {
  title: "Components/Home/BalanceCard",
  component: BalanceCard,
  parameters: {
    layout: "padded",
  },
  args: {
    onManageFunds: () => alert("Manage Funds clicked"),
  },
} satisfies Meta<typeof BalanceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    outstandingBalance: 5000,
    initialCapital: 50000,
    initialProfit: 15000,
  },
};

export const LowBalance: Story = {
  args: {
    outstandingBalance: 1000,
    initialCapital: 50000,
    initialProfit: 15000,
  },
};

export const HighBalance: Story = {
  args: {
    outstandingBalance: 60000,
    initialCapital: 50000,
    initialProfit: 15000,
  },
};

export const ReadOnly: Story = {
  args: {
    outstandingBalance: 5000,
    initialCapital: 50000,
    initialProfit: 15000,
    onManageFunds: undefined,
  },
};

export const Loading: Story = {
  args: {
    outstandingBalance: 5000,
    initialCapital: 50000,
    initialProfit: 15000,
    isLoading: true,
  },
};
