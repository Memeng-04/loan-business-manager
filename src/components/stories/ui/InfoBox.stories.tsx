import type { Meta, StoryObj } from "@storybook/react";
import { InfoBox } from "../../../components/ui/InfoBox";

const meta = {
  title: "Components/UI/InfoBox",
  component: InfoBox,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof InfoBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "This is a default info box without an icon.",
  },
};

export const InfoVariant: Story = {
  args: {
    variant: "info",
    children: "This uses the 'info' variant style.",
  },
};

export const LightbulbVariant: Story = {
  args: {
    variant: "lightbulb",
    children: "This uses the lightbulb variant style.",
  },
};

export const LongText: Story = {
  args: {
    variant: "info",
    children:
      "This info box contains a longer piece of text to demonstrate how it handles wrapping and layout when the content exceeds the typical length.",
  },
};
