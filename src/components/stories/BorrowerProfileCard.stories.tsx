import type { Meta, StoryObj } from "@storybook/react";
import BorrowerProfileCard from "../borrowers/BorrowerDetails/BorrowerProfileCard";

const meta = {
  title: "Components/Borrowers/BorrowerProfileCard",
  component: BorrowerProfileCard,
  parameters: {
    layout: "centered",
  },
  args: {
    name: "Juan Dela Cruz",
    onBack: () => {},
  },
} satisfies Meta<typeof BorrowerProfileCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
