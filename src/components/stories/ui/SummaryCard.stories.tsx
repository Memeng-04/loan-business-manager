import type { Meta, StoryObj } from "@storybook/react";
import { DollarSign, FileText } from "lucide-react";
import { SummaryCard } from "../../../components/ui/SummaryCard";

const meta = {
  title: "Components/UI/SummaryCard",
  component: SummaryCard,
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof SummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Loan Details",
    icon: <FileText size={18} />,
    items: [
      { label: "Borrower", value: "Juan Dela Cruz" },
      { label: "Principal", value: "₱10,000" },
      { label: "Interest Rate", value: "5%" },
    ],
  },
};

export const WithTotal: Story = {
  args: {
    title: "Payment Summary",
    icon: <DollarSign size={18} />,
    items: [
      { label: "Principal", value: "₱10,000" },
      { label: "Interest", value: "₱500" },
      { label: "Total Payable", value: "₱10,500", isTotal: true },
    ],
  },
};

export const PaymentVariant: Story = {
  args: {
    title: "Current Payment",
    variant: "payment",
    icon: <DollarSign size={18} />,
    items: [
      { label: "Amount Due", value: "₱500" },
      { label: "Late Fee", value: "₱50" },
      { label: "Total Payment", value: "₱550", isTotal: true },
    ],
  },
};
