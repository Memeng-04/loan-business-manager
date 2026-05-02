import type { Meta, StoryObj } from "@storybook/react";
import Button from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <Button variant="white" size="sm">
        White
      </Button>
      <Button variant="blue" size="sm">
        Blue
      </Button>
      <Button variant="outline" size="sm">
        Outline
      </Button>
      <Button variant="back" size="sm">
        Back
      </Button>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ fontSize: 12, color: "#6b7280" }}>Stacked (example)</div>
        <Button variant="viewProfile" size="sm">
          View Profile
        </Button>
      </div>
    </div>
  ),
};

export const Back: Story = {
  args: {
    children: "Back",
    variant: "back",
    size: "sm",
  },
};

export const ViewProfile: Story = {
  args: {
    children: "View Profile",
    variant: "viewProfile",
    size: "sm",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Small
        </div>
        <Button variant="blue" size="sm">
          Button
        </Button>
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Medium
        </div>
        <Button variant="blue" size="md">
          Button
        </Button>
      </div>
      <div>
        <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
          Large
        </div>
        <Button variant="blue" size="lg">
          Button
        </Button>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    variant: "blue",
    size: "md",
    disabled: true,
  },
};
