import type { Meta, StoryObj } from "@storybook/react";
import BorrowerProfileCard from "./BorrowerProfileCard";

const meta = {
  title: "Components/BorrowerProfileCard",
  component: BorrowerProfileCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof BorrowerProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Gian",
  },
};

export const WithViewProfile: Story = {
  args: {
    name: "Gian",
    onViewProfile: () => console.log("View Profile clicked"),
  },
};

export const WithLongName: Story = {
  args: {
    name: "Giancarlo Antonio Fernandez",
    onViewProfile: () => console.log("View Profile clicked"),
  },
};

export const WithCustomBack: Story = {
  args: {
    name: "Gian",
    onBack: () => console.log("Custom back handler"),
    onViewProfile: () => console.log("View Profile clicked"),
  },
};
