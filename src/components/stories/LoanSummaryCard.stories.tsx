import type { Meta, StoryObj } from "@storybook/react";
import LoanSummaryCard from "../borrowers/BorrowerDetails/LoanSummaryCard";

const meta = {
  title: "Components/LoanSummaryCard",
  component: LoanSummaryCard,
  parameters: {
    layout: "centered",
  },
  args: {
    loanError: null,
    totalLoans: 4,
    activeLoans: 2,
    doneLoans: 2,
    totalPrincipal: "₱72,000",
    totalPayable: "₱82,800",
    averageLoanAmount: "₱18,000",
    latestLoan: {
      borrower_id: "borrower-1",
      principal: 24000,
      total_payable: 27600,
      interest: 3600,
      interest_rate: 15,
      frequency: "monthly",
      payment_amount: 9200,
      start_date: "2026-04-01",
      end_date: "2026-06-30",
      status: "active",
      penalty_rate: 5,
      created_at: "2026-04-08T00:00:00.000Z",
    },
    latestLoanAmount: "₱24,000",
    latestLoanCreatedAt: "Apr 8, 2026",
    onSeeLoans: () => {},
  },
  render: (args) => (
    <div style={{ width: "min(560px, 94vw)" }}>
      <LoanSummaryCard {...args} />
    </div>
  ),
} satisfies Meta<typeof LoanSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithError: Story = {
  args: {
    loanError: "Failed to load loan summary.",
  },
};
