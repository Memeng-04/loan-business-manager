import type { Meta, StoryObj } from "@storybook/react";
import Header from "../../../components/ui/header/Header";

const meta = {
  title: "Components/UI/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "Header Title",
  },
  argTypes: {
    onMenuClick: { action: "menu-clicked" },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const DesktopView: Story = {
  parameters: {
    viewport: {
      defaultViewport: "responsive",
    },
  },
};
