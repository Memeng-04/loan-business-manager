import {
  AbsentPaymentActionStrategy,
  AdvancePaymentActionStrategy,
  PartialPaymentActionStrategy,
} from "../PaymentActionStrategies";
import { LoanRepository } from "../../repositories/LoanRepository";
import { PaymentRepository } from "../../repositories/PaymentRepository";
import { ScheduleRepository } from "../../repositories/ScheduleRepository";

vi.mock("../../repositories/LoanRepository", () => ({
  LoanRepository: {
    getById: vi.fn(),
  },
}));

vi.mock("../../repositories/PaymentRepository", () => ({
  PaymentRepository: {
    create: vi.fn(),
  },
}));

vi.mock("../../repositories/ScheduleRepository", () => ({
  ScheduleRepository: {
    getByLoanId: vi.fn(),
    updateSchedule: vi.fn(),
    saveSchedule: vi.fn(),
  },
}));

describe("PaymentActionStrategies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("moves the remainder of a partial payment onto the next unpaid schedule", async () => {
    vi.mocked(LoanRepository.getById).mockResolvedValue({
      id: "loan-1",
      frequency: "weekly",
    } as never);
    vi.mocked(ScheduleRepository.getByLoanId).mockResolvedValue([
      {
        id: "schedule-1",
        due_date: "2026-04-26",
        amount_due: 100,
        status: "unpaid",
      },
      {
        id: "schedule-2",
        due_date: "2026-05-03",
        amount_due: 120,
        status: "unpaid",
      },
    ]);

    const strategy = new PartialPaymentActionStrategy();

    await strategy.execute({
      loanId: "loan-1",
      scheduleId: "schedule-1",
      amountPaid: 70,
      paymentDate: "2026-04-26",
    });

    expect(ScheduleRepository.updateSchedule).toHaveBeenNthCalledWith(1, "schedule-1", {
      status: "partial",
    });
    expect(PaymentRepository.create).toHaveBeenCalledWith({
      loan_id: "loan-1",
      amount_paid: 70,
      payment_date: "2026-04-26",
      schedule_id: "schedule-1",
    });
    expect(ScheduleRepository.updateSchedule).toHaveBeenNthCalledWith(2, "schedule-2", {
      amount_due: 150,
    });
    expect(ScheduleRepository.saveSchedule).not.toHaveBeenCalled();
  });

  it("applies advance overpayment starting from the last unpaid schedules", async () => {
    vi.mocked(ScheduleRepository.getByLoanId).mockResolvedValue([
      {
        id: "schedule-1",
        due_date: "2026-04-26",
        amount_due: 100,
        status: "unpaid",
      },
      {
        id: "schedule-2",
        due_date: "2026-05-03",
        amount_due: 60,
        status: "unpaid",
      },
      {
        id: "schedule-3",
        due_date: "2026-05-10",
        amount_due: 50,
        status: "unpaid",
      },
    ]);

    const strategy = new AdvancePaymentActionStrategy();

    await strategy.execute({
      loanId: "loan-2",
      scheduleId: "schedule-1",
      amountPaid: 180,
      paymentDate: "2026-04-26",
    });

    expect(ScheduleRepository.updateSchedule).toHaveBeenNthCalledWith(1, "schedule-1", {
      status: "paid",
    });
    expect(ScheduleRepository.updateSchedule).toHaveBeenNthCalledWith(2, "schedule-3", {
      status: "paid",
      amount_due: 0,
    });
    expect(ScheduleRepository.updateSchedule).toHaveBeenNthCalledWith(3, "schedule-2", {
      amount_due: 30,
    });
  });

  it("creates a penalty schedule on every third missed payment", async () => {
    vi.mocked(LoanRepository.getById).mockResolvedValue({
      id: "loan-3",
      principal: 1000,
      frequency: "weekly",
      penalty_rate: 5,
    } as never);

    vi.mocked(ScheduleRepository.getByLoanId)
      .mockResolvedValueOnce([
        {
          id: "schedule-1",
          due_date: "2026-04-26",
          amount_due: 100,
          status: "unpaid",
        },
        {
          id: "schedule-2",
          due_date: "2026-05-03",
          amount_due: 120,
          status: "unpaid",
        },
        {
          id: "schedule-old-1",
          due_date: "2026-04-12",
          amount_due: 100,
          status: "missed",
        },
        {
          id: "schedule-old-2",
          due_date: "2026-04-19",
          amount_due: 100,
          status: "missed",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "schedule-old-1",
          due_date: "2026-04-12",
          amount_due: 100,
          status: "missed",
        },
        {
          id: "schedule-old-2",
          due_date: "2026-04-19",
          amount_due: 100,
          status: "missed",
        },
        {
          id: "schedule-1",
          due_date: "2026-04-26",
          amount_due: 100,
          status: "missed",
        },
        {
          id: "schedule-2",
          due_date: "2026-05-03",
          amount_due: 220,
          status: "unpaid",
        },
      ]);

    const strategy = new AbsentPaymentActionStrategy();

    await strategy.execute({
      loanId: "loan-3",
      scheduleId: "schedule-1",
      amountPaid: 0,
      paymentDate: "2026-04-26",
    });

    expect(ScheduleRepository.updateSchedule).toHaveBeenNthCalledWith(1, "schedule-1", {
      status: "missed",
    });
    expect(ScheduleRepository.updateSchedule).toHaveBeenNthCalledWith(2, "schedule-2", {
      amount_due: 220,
    });
    expect(ScheduleRepository.saveSchedule).toHaveBeenCalledWith([
      {
        loan_id: "loan-3",
        due_date: "2026-05-10",
        amount_due: 50,
        status: "unpaid",
        is_penalty: true,
      },
    ]);
  });
});
