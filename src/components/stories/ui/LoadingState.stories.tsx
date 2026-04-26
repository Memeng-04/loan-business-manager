import type { Meta, StoryObj } from "@storybook/react";
import LoadingState from "../../../components/ui/LoadingState";

const meta = {
  title: "Components/UI/LoadingState",
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
    message: "Loading data...",
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

export const blueBackground: Story = {
  args: {
    variant: "blueBackground",
    message: "Loading data in blue background...",
  },
};

export const Compact: Story = {
  args: {
    variant: "compact",
    message: "Fetching records...",
  },
};

export const Inline: Story = {
  args: {
    variant: "inline",
    message: "Updating status...",
  },
};

export const ErrorState: Story = {
  args: {
    variant: "error",
    message: "Failed to load session.",
    fullScreen: false,
    actionLabel: "Try Again",
  },
};
