import type { Meta, StoryObj } from "@storybook/react";
import Header from "../header/Header";

const meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    title: "Dashboard",
  },
  argTypes: {
    onMenuClick: { action: "menu-clicked" },
  },
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSubtitle: Story = {
  args: {
    subtitle: "Overview coming soon",
  },
};

export const MobileView: Story = {
  args: {
    subtitle: "Mobile layout",
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const DesktopView: Story = {
  args: {
    subtitle: "Desktop layout",
  },
  parameters: {
    viewport: {
      defaultViewport: "responsive",
    },
  },
};