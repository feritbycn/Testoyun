import { describe, expect, it } from "vitest";
import { EconomyManager } from "../src/systems/EconomyManager";
describe("EconomyManager", () => {
  it("does not allow a balance to go negative", () => {
    const economy = new EconomyManager({ balance: 100, gold: 0 });
    expect(economy.debit(101, "test", "overspend", "overspend")).toBe(false);
    expect(economy.balance).toBe(100);
  });
  it("does not process the same transaction id twice", () => {
    const economy = new EconomyManager({ balance: 10, gold: 0 });
    expect(economy.credit(50, "test", "reward", "unique")).toBe(true);
    expect(economy.credit(50, "test", "reward", "unique")).toBe(false);
    expect(economy.balance).toBe(60);
  });
  it("records a ledger entry", () => {
    const economy = new EconomyManager({ balance: 100, gold: 0 });
    economy.debit(25, "fuel", "fuel", "fuel-1");
    expect(economy.ledger[0].before).toBe(100);
    expect(economy.ledger[0].after).toBe(75);
    expect(economy.ledger[0].amount).toBe(-25);
  });
});