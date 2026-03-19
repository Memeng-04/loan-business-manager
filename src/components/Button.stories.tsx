import type { Meta, StoryObj } from "@storybook/react";
import WhiteButton from "./Button";

const meta = {
  title: "Components/WhiteButton",
  component: WhiteButton,
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
  },
} satisfies Meta<typeof WhiteButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: "Get Started",
  },
};

export const WithDifferentText: Story = {
  args: {
    children: "Apply Now",
  },
};

export const WithCustomClass: Story = {
  args: {
    children: "Custom Button",
    className: "mt-8",
  },
};

export const Interactive: Story = {
  args: {
    children: "Click Me",
  },
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector("button");
    if (button) {
      button.click();
    }
  },
};
