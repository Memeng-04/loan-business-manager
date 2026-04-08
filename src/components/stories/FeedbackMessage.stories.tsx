import type { Meta, StoryObj } from "@storybook/react";
import FeedbackMessage from "../feedback/FeedbackMessage";

const meta = {
  title: "Components/FeedbackMessage",
  component: FeedbackMessage,
  parameters: {
    layout: "centered",
  },
  args: {
    message: "Phone number must be numeric and 7 to 15 digits long.",
    variant: "error",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["error", "info", "success"],
    },
  },
} satisfies Meta<typeof FeedbackMessage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Error: Story = {};

export const Info: Story = {
  args: {
    variant: "info",
    message: "Borrower details are saved locally until submit.",
  },
};

export const Success: Story = {
  args: {
    variant: "success",
    message: "Borrower saved successfully.",
  },
};
