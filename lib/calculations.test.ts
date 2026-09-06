import { describe, expect, it } from "vitest";
import {
  calculateAchievement,
  calculateContribution,
  calculateExpect,
  calculateGap,
  calculateGrowth,
  calculateTargetByDay,
  daysInMonth,
  roundValue,
} from "./calculations";

describe("rumus dashboard", () => {
  it("menghitung jumlah hari termasuk tahun kabisat", () => {
    expect(daysInMonth(8, 2026)).toBe(31);
    expect(daysInMonth(2, 2028)).toBe(29);
  });

  it("cocok dengan snapshot Ahmad Agustus 2026", () => {
    const target = 479_780_455;
    const mtd = 428_085_219;
    const expectValue = calculateExpect(mtd, 31, 25);
    expect(roundValue(expectValue)).toBe(530_825_672);
    expect(roundValue(calculateAchievement(expectValue, target)!)).toBe(111);
    expect(calculateGap(target, mtd)).toBe(51_695_236);
    expect(roundValue(calculateTargetByDay(51_695_236, 31, 25)!)).toBe(8_615_873);
    expect(roundValue(calculateGrowth(expectValue, 494_526_902)!)).toBe(7);
  });

  it("cocok dengan total semua sales", () => {
    const expectValue = calculateExpect(1_718_137_587, 31, 25);
    expect(roundValue(expectValue)).toBe(2_130_490_608);
    expect(roundValue(calculateGrowth(expectValue, 2_038_674_134)!)).toBe(5);
    expect(calculateContribution(1_478_008_114, 1_718_137_587)).toBeCloseTo(86.02, 2);
  });

  it("aman untuk pembagi nol atau data bulan lalu kosong", () => {
    expect(calculateAchievement(10, 0)).toBeNull();
    expect(calculateTargetByDay(100, 31, 31)).toBeNull();
    expect(calculateGrowth(100, null)).toBeNull();
  });
});
