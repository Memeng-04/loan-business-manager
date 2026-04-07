import type { Meta, StoryObj } from "@storybook/react";
import Card from "../card/Card";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "subtle", "elevated"],
    },
    padding: {
      control: "select",
      options: ["none", "sm", "md", "lg"],
    },
    interactive: {
      control: "boolean",
    },
    as: {
      control: "select",
      options: ["div", "section", "article"],
    },
    className: {
      control: "text",
    },
  },
  args: {
    as: "div",
    variant: "default",
    padding: "md",
    interactive: false,
    children: "Card content",
  },
  render: (args) => (
    <div style={{ width: "min(720px, 92vw)" }}>
      <Card {...args}>
        <h3 style={{ fontWeight: 700, color: "#0f172a" }}>Card Title</h3>
        <p style={{ marginTop: "0.5rem", color: "#475569" }}>
          Shared card surface for borrower cards, forms, and detail panels.
        </p>
      </Card>
    </div>
  ),
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseArgs = {
  as: "div",
  variant: "default",
  padding: "md",
  interactive: false,
  children: "Card content",
} as const;

export const Default: Story = {
  args: baseArgs,
};

export const Interactive: Story = {
  args: {
    ...baseArgs,
    interactive: true,
  },
};

export const SubtleLargePadding: Story = {
  args: {
    ...baseArgs,
    variant: "subtle",
    padding: "lg",
  },
};
