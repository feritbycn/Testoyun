import type { EconomyManager } from "./EconomyManager";
export interface Mission { id: string; titleKey: string; target: number; progress: number; reward: number; claimed: boolean; event: string }
const BASE: Mission[] = [
  { id: "first-trip", titleKey: "missionFirstTrip", target: 1, progress: 0, reward: 1000, claimed: false, event: "trip" },
  { id: "distance", titleKey: "missionDistance", target: 100, progress: 0, reward: 1500, claimed: false, event: "distance" },
  { id: "five-trips", titleKey: "missionFiveTrips", target: 5, progress: 0, reward: 4000, claimed: false, event: "trip" }
];
export class MissionManager {
  items: Mission[];
  constructor(snapshot?: Mission[]) { this.items = snapshot ?? BASE.map(m => ({ ...m })); }
  get completedCount() { return this.items.filter(m => m.progress >= m.target).length; }
  record(event: string, amount: number) { for (const m of this.items) if (m.event === event && !m.claimed) m.progress = Math.min(m.target, m.progress + amount); }
  claim(id: string, economy: EconomyManager) {
    const m = this.items.find(x => x.id === id);
    if (!m || m.claimed || m.progress < m.target) return { ok: false, message: "Görev henüz tamamlanmadı." };
    if (!economy.credit(m.reward, "mission-reward", `Görev: ${m.titleKey}`, `mission:${id}`)) return { ok: false, message: "Görev ödülü zaten işlendi." };
    m.claimed = true; return { ok: true, message: "Görev ödülü alındı." };
  }
  snapshot() { return this.items.map(m => ({ ...m })); }
}
