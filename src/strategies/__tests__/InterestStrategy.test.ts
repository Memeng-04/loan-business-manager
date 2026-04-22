import { FixedInterestStrategy, PercentageInterestStrategy } from "../InterestStrategy";


describe("InterestStrategy", () => {
  describe("FixedInterestStrategy", () => {
    const strategy = new FixedInterestStrategy();

    it("calculates interest and properties", () => {
      const result = strategy.calculate(1000, 10, "daily", "2026-04-01", 1250);
      expect(result.interest).toBe(250);
      expect(result.interestRate).toBe(25);
      expect(result.paymentAmount).toBe(125);
      expect(result.endDate).toBe("2026-04-11");
    });
  });

  describe("PercentageInterestStrategy", () => {
    const strategy = new PercentageInterestStrategy();

    it("calculates interest and properties from percentage", () => {
      const result = strategy.calculate(2000, 10, "daily", "2026-04-01", 15);
      expect(result.interest).toBe(300);
      expect(result.totalPayable).toBe(2300);
      expect(result.paymentAmount).toBe(230);
      expect(result.endDate).toBe("2026-04-11");
    });
  });
});
