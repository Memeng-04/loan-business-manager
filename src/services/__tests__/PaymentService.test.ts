import { PaymentService } from "../PaymentService";
import { PaymentActionFactory } from "../../factories/PaymentActionFactory";
import { ScheduleRepository } from "../../repositories/ScheduleRepository";

vi.mock("../../factories/PaymentActionFactory", () => ({
  PaymentActionFactory: {
    createStrategy: vi.fn(),
  },
}));

vi.mock("../../repositories/ScheduleRepository", () => ({
  ScheduleRepository: {
    getByLoanId: vi.fn(),
  },
}));

describe("PaymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the overpayment advance strategy when advance payment exceeds the scheduled amount", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);

    vi.mocked(ScheduleRepository.getByLoanId).mockResolvedValue([
      {
        id: "schedule-1",
        due_date: "2026-04-27",
        amount_due: 100,
        status: "unpaid",
      },
    ]);
    vi.mocked(PaymentActionFactory.createStrategy).mockReturnValue({
      execute,
    });

    await PaymentService.processPaymentAction({
      loanId: "loan-1",
      scheduleId: "schedule-1",
      amountPaid: 150,
      paymentDate: "2026-04-26",
      status: "advance",
    });

    expect(ScheduleRepository.getByLoanId).toHaveBeenCalledWith("loan-1");
    expect(PaymentActionFactory.createStrategy).toHaveBeenCalledWith(
      "advance",
      true,
    );
    expect(execute).toHaveBeenCalledWith({
      loanId: "loan-1",
      scheduleId: "schedule-1",
      amountPaid: 150,
      paymentDate: "2026-04-26",
      penaltyPercentage: undefined,
    });
  });

  it("skips schedule lookup for non-advance payments and executes the resolved strategy", async () => {
    const execute = vi.fn().mockResolvedValue(undefined);

    vi.mocked(PaymentActionFactory.createStrategy).mockReturnValue({
      execute,
    });

    await PaymentService.processPaymentAction({
      loanId: "loan-2",
      scheduleId: "schedule-2",
      amountPaid: 75,
      paymentDate: "2026-04-26",
      status: "paid",
    });

    expect(ScheduleRepository.getByLoanId).not.toHaveBeenCalled();
    expect(PaymentActionFactory.createStrategy).toHaveBeenCalledWith(
      "paid",
      false,
    );
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
