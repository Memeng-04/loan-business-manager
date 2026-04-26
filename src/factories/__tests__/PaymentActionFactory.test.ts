import { PaymentActionFactory } from "../PaymentActionFactory";
import {
  AbsentPaymentActionStrategy,
  AdvancePaymentActionStrategy,
  FullPaymentActionStrategy,
  PartialPaymentActionStrategy,
} from "../../strategies/PaymentActionStrategies";

describe("PaymentActionFactory", () => {
  it("returns an advance strategy only for true advance overpayments", () => {
    expect(
      PaymentActionFactory.createStrategy("advance", true),
    ).toBeInstanceOf(AdvancePaymentActionStrategy);
    expect(
      PaymentActionFactory.createStrategy("advance", false),
    ).toBeInstanceOf(FullPaymentActionStrategy);
  });

  it("returns the partial, absent, and full strategies for their statuses", () => {
    expect(
      PaymentActionFactory.createStrategy("partial"),
    ).toBeInstanceOf(PartialPaymentActionStrategy);
    expect(
      PaymentActionFactory.createStrategy("absent"),
    ).toBeInstanceOf(AbsentPaymentActionStrategy);
    expect(
      PaymentActionFactory.createStrategy("paid"),
    ).toBeInstanceOf(FullPaymentActionStrategy);
  });
});
