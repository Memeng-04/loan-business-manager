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
      options: ["active", "done"],
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

