import type { Meta, StoryObj } from "@storybook/react";
import ScheduleList from "../../../features/loans/management/ScheduleList";

const meta = {
  title: "Features/Management/ScheduleList",
  component: ScheduleList,
  parameters: {
    layout: "padded",
  },
  args: {
    onScheduleClick: () => console.log("Schedule clicked"),
  },
  argTypes: {
    onScheduleClick: { action: "onScheduleClick" },
  },
} satisfies Meta<typeof ScheduleList>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockSchedules = [
  {
    id: "1",
    due_date: "2026-05-01T00:00:00Z",
    amount_due: 1500,
    status: "unpaid",
    loan_id: "loan_abc123",
    loan: {
      borrower: {
        full_name: "Juan Dela Cruz",
      },
    },
  },
  {
    id: "2",
    due_date: "2026-04-20T00:00:00Z",
    amount_due: 2000,
    status: "missed",
    loan_id: "loan_def456",
    loan: {
      borrower: {
        full_name: "Maria Santos",
      },
    },
  },
  {
    id: "3",
    due_date: "2026-04-15T00:00:00Z",
    amount_due: 3000,
    status: "paid",
    loan_id: "loan_ghi789",
    loan: {
      borrower: {
        full_name: "Antonio Ramos",
      },
    },
  },
  {
    id: "4",
    due_date: "2026-04-25T00:00:00Z",
    amount_due: 1000,
    status: "partial",
    loan_id: "loan_jkl012",
    loan: {
      borrower: {
        full_name: "Pedro Lopez",
      },
    },
  },
];

export const Default: Story = {
  args: {
    schedules: mockSchedules as any,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    schedules: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    schedules: [],
    loading: false,
  },
};
