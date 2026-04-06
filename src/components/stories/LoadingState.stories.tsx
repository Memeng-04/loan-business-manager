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

export const WhiteBackground: Story = {
  args: {
    message: "Loading with white background...",
    fullScreen: false,
  },
  render: (args) => (
    <div style={{ backgroundColor: "#ffffff", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <LoadingState {...args} />
    </div>
  ),
};
