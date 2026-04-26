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
      options: ["white", "blue", "outline", "outlineWhiteText", "back", "ViewProfile"],
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

export const Primary: Story = {
  args: {
    children: "Get Started",
    variant: "white",
    size: "lg",
  },
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

export const ViewProfile: Story = {
  args: {
    children: "View Profile",
    variant: "ViewProfile",
    size: "lg",
  },
};


export const MediumSize: Story = {
  args: {
    children: "Medium Button",
    variant: "white",
    size: "md",
  },
};


export const OutlineWhiteText: Story = {
  parameters: {
    layout: "fullscreen",
    backgrounds: {
      default: "main-blue",
      values: [
        {
          name: "main-blue",
          value: "#012a6a",
        },
      ],
    },
  },
  args: {
    children: "Outline White Text",
    variant: "outlineWhiteText",
    size: "lg",
  },
  render: (args) => (
    <div
      style={{
        justifyContent: "center",
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        padding: "2rem",
      }}
    >
      <Button {...args} />
    </div>
  ),
};
