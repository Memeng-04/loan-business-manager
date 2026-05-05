import type { Meta, StoryObj } from "@storybook/react";
import StatusBadge from "../../../components/ui/status-badge/StatusBadge";

const meta = {
  title: "Components/UI/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
    },
    tone: {
      control: "select",
      options: ["active", "done", "unpaid", "paid", "partial", "missed"],
    },
  },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  args: {
    label: "ACTIVE",
    tone: "active",
  },
};

export const Done: Story = {
  args: {
    label: "DONE",
    tone: "done",
  },
};

export const Unpaid: Story = {
  args: {
    label: "UNPAID",
    tone: "unpaid",
  },
};

export const Paid: Story = {
  args: {
    label: "PAID",
    tone: "paid",
  },
};

export const Partial: Story = {
  args: {
    label: "PARTIAL",
    tone: "partial",
  },
};

export const Missed: Story = {
  args: {
    label: "MISSED",
    tone: "missed",
  },
};

