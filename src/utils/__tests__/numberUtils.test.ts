import { sanitizeNumber } from "../numberUtils";

describe("sanitizeNumber", () => {
  it("preserves empty input and a standalone decimal point for typing flow", () => {
    expect(sanitizeNumber("")).toBe("");
    expect(sanitizeNumber(".")).toBe("0.");
  });

  it("removes non-numeric characters and keeps only one decimal point", () => {
    expect(sanitizeNumber("abc12.3x4")).toBe("12.34");
    expect(sanitizeNumber("1.2.3.4")).toBe("1.23");
  });

  it("limits decimal places to two", () => {
    expect(sanitizeNumber("99.9999")).toBe("99.99");
  });

  it("caps the value at the provided maximum", () => {
    expect(sanitizeNumber("1500", 1000)).toBe("1000");
  });
});
