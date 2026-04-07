import type { Meta, StoryObj } from "@storybook/react";
import LoadingState from "../LoadingState";

const meta = {
  title: "Components/LoadingState",
  component: LoadingState,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    message: "Loading session...",
  },
} satisfies Meta<typeof LoadingState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithCustomMessage: Story = {
  args: {
    message: "Loading your data...",
  },
};

export const Authenticating: Story = {
  args: {
    message: "Authenticating...",
  },
};

export const Saving: Story = {
  args: {
    message: "Saving changes...",
  },
};
