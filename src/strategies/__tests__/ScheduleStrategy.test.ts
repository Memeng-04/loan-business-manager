import { StandardScheduleStrategy } from "../ScheduleStrategy";

describe("ScheduleStrategy", () => {
  const strategy = new StandardScheduleStrategy();

  it("generates daily schedule entries for each day in term", () => {
    const schedule = strategy.generate("2026-04-01", 100, "daily", 4);

    expect(schedule).toHaveLength(4);
    expect(schedule).toEqual([
      { due_date: "2026-04-02", amount_due: 25, status: "unpaid" },
      { due_date: "2026-04-03", amount_due: 25, status: "unpaid" },
      { due_date: "2026-04-04", amount_due: 25, status: "unpaid" },
      { due_date: "2026-04-05", amount_due: 25, status: "unpaid" },
    ]);
  });

  it("uses ceiling division for weekly schedules", () => {
    const schedule = strategy.generate("2026-04-01", 1000, "weekly", 10);

    expect(schedule).toHaveLength(2);
    expect(schedule[0]).toEqual({
      due_date: "2026-04-08",
      amount_due: 500,
      status: "unpaid",
    });
    expect(schedule[1]).toEqual({
      due_date: "2026-04-15",
      amount_due: 500,
      status: "unpaid",
    });
  });

  it("uses 15-day intervals for bi-monthly schedules", () => {
    const schedule = strategy.generate("2026-04-01", 900, "bi-monthly", 31);

    expect(schedule).toHaveLength(3);
    expect(schedule[0].due_date).toBe("2026-04-16");
    expect(schedule[1].due_date).toBe("2026-05-01");
    expect(schedule[2].due_date).toBe("2026-05-16");
    expect(schedule[0].amount_due).toBeCloseTo(300);
    expect(schedule[1].amount_due).toBeCloseTo(300);
    expect(schedule[2].amount_due).toBeCloseTo(300);
  });
});
