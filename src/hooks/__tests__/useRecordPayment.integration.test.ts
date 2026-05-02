import { act, renderHook, waitFor } from "@testing-library/react";
import { useRecordPayment } from "../useRecordPayment";
import { PaymentRepository } from "../../repositories/PaymentRepository";
import { getAccessToken } from "../../services/auth";

vi.mock("../../repositories/PaymentRepository", () => ({
  PaymentRepository: {
    create: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("../../services/auth", () => ({
  getAccessToken: vi.fn(),
}));

describe("useRecordPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("records a payment and marks the hook as successful", async () => {
    const payment = {
      id: "payment-1",
      loan_id: "loan-1",
      amount_paid: 250,
      payment_date: "2026-04-26",
      schedule_id: null,
    };

    vi.mocked(PaymentRepository.create).mockResolvedValue(payment as never);

    const { result } = renderHook(() => useRecordPayment());

    let returnedPayment = null;
    await act(async () => {
      returnedPayment = await result.current.recordPayment({
        loan_id: "loan-1",
        amount_paid: 250,
        payment_date: "2026-04-26",
      });
    });

    expect(returnedPayment).toEqual(payment);
    expect(PaymentRepository.create).toHaveBeenCalledWith({
      loan_id: "loan-1",
      amount_paid: 250,
      payment_date: "2026-04-26",
    });
    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("surfaces repository errors when payment recording fails", async () => {
    vi.mocked(PaymentRepository.create).mockRejectedValue(
      new Error("db unavailable"),
    );
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useRecordPayment());

    let returnedPayment = null;
    await act(async () => {
      returnedPayment = await result.current.recordPayment({
        loan_id: "loan-1",
        amount_paid: 250,
        payment_date: "2026-04-26",
      });
    });

    expect(returnedPayment).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("db unavailable");
    expect(result.current.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("marks an absent payment by creating it first and then updating its status", async () => {
    vi.mocked(PaymentRepository.create).mockResolvedValue({
      id: "payment-2",
    } as never);
    vi.mocked(PaymentRepository.update).mockResolvedValue({
      id: "payment-2",
      status: "absent",
    } as never);

    const { result } = renderHook(() => useRecordPayment());

    let returnedPayment = null;
    await act(async () => {
      returnedPayment = await result.current.markAbsent(
        "loan-2",
        "schedule-2",
        "2026-04-26",
      );
    });

    expect(PaymentRepository.create).toHaveBeenCalledWith({
      loan_id: "loan-2",
      amount_paid: 0,
      payment_date: "2026-04-26",
      schedule_id: "schedule-2",
    });
    expect(PaymentRepository.update).toHaveBeenCalledWith("payment-2", {
      status: "absent",
    });
    expect(returnedPayment).toEqual({
      id: "payment-2",
      status: "absent",
    });
    expect(result.current.success).toBe(true);
  });

  it("returns null and stores the backend error when allocation fails", async () => {
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Allocation crashed" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useRecordPayment());

    let allocation = null;
    await act(async () => {
      allocation = await result.current.allocatePayment(
        "loan-3",
        100,
        "schedule-3",
        "2026-04-26",
      );
    });

    expect(allocation).toBeNull();
    await waitFor(() => {
      expect(result.current.error).toBe("Allocation crashed");
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
  });

  it("treats recordPayment as failed when schedule allocation fails", async () => {
    vi.mocked(PaymentRepository.create).mockResolvedValue({
      id: "payment-3",
      loan_id: "loan-3",
      amount_paid: 100,
      payment_date: "2026-04-26",
      schedule_id: "schedule-3",
    } as never);
    vi.mocked(getAccessToken).mockResolvedValue("token-123");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({ error: "Allocation crashed" }),
    });
    vi.stubGlobal("fetch", fetchMock);
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const { result } = renderHook(() => useRecordPayment());

    let returnedPayment = null;
    await act(async () => {
      returnedPayment = await result.current.recordPayment({
        loan_id: "loan-3",
        amount_paid: 100,
        payment_date: "2026-04-26",
        schedule_id: "schedule-3",
      });
    });

    expect(returnedPayment).toBeNull();
    expect(result.current.success).toBe(false);
    expect(result.current.error).toBe("Allocation crashed");
    expect(result.current.loading).toBe(false);

    consoleErrorSpy.mockRestore();
  });
});
