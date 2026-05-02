import type { Meta, StoryObj } from "@storybook/react";
import { Info as InfoIcon, AlertCircle } from "lucide-react";
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

export const WithIcon: Story = {
  args: {
    icon: <InfoIcon size={20} />,
    children: "This info box includes an icon to grab attention.",
  },
};

export const InfoVariant: Story = {
  args: {
    variant: "info",
    icon: <AlertCircle size={20} />,
    children: "This uses the 'info' variant style.",
  },
};
