import type { Meta, StoryObj } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../navigation/Navbar";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    isOpen: false,
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MobileFooterOnly: Story = {
  name: "MobileFooter",
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const DesktopClosed: Story = {
  parameters: {
    viewport: {
      defaultViewport: "responsive",
    },
  },
};

export const DesktopOpen: Story = {
  args: {
    isOpen: true,
  },
  parameters: {
    viewport: {
      defaultViewport: "responsive",
    },
  },
};
