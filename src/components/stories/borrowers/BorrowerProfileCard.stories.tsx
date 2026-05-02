import type { Meta, StoryObj } from "@storybook/react";
import BorrowerProfileCard from "../../borrowers/BorrowerDetails/BorrowerProfileCard";

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

export const Default: Story = {
  args: {},
  render: (args) => 
  <div style={{ width: "min(800px, 92vw)" }}>
    <BorrowerProfileCard {...args} />
  </div>,
};

export const WithViewProfile: Story = {
  args: {
    onViewProfile: () => console.log("View Profile clicked"),
  },
  render: (args) =>  <div style={{ width: "min(800px, 92vw)" }}>
    <BorrowerProfileCard {...args} />
  </div>,
};
