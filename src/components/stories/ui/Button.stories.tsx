import type { Meta, StoryObj } from "@storybook/react";
import Button from "../../../components/ui/Button";

const meta = {
  title: "Components/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Button label text",
    },
    onClick: {
      action: "clicked",
      description: "Click handler callback",
    },
    className: {
      control: "text",
      description: "Additional Tailwind classes",
    },
    variant: {
      control: "select",
      options: ["white", "blue", "outline", "back"],
      description: "Visual style variant",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Button size",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WhiteVariant: Story = {
  args: {
    children: "Get Started",
    variant: "white",
    size: "lg",
  },
  render: (args) => (
    <div style={{ backgroundColor: "var(--color-main-blue)", padding: 50}}>
      <Button {...args} />  
    </div>
  ),
};

export const BlueVariant: Story = {
  args: {
    children: "Continue",
    variant: "blue",
    size: "lg",
  },
};

export const OutlineVariant: Story = {
  args: {
    children: "Learn More",
    variant: "outline",
    size: "lg",
  },
};

export const BackButton: Story = {
  args: {
    children: "Back",
    variant: "back",
    size: "lg",
  },
};

