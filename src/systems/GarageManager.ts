import type { EconomyManager } from "./EconomyManager";
export interface BusDefinition { id: string; name: string; seats: number; maxSpeed: number; power: number; fuelRate: number; tank: number; price: number; color: string; comfort: number; handling: number }
export const BUS_CATALOG: BusDefinition[] = [
  { id: "starter", name: "Roadliner 40", seats: 40, maxSpeed: 125, power: 320, fuelRate: 23, tank: 500, price: 0, color: "#e3a83e", comfort: 65, handling: .8 },
  { id: "city", name: "MetroLink 52", seats: 52, maxSpeed: 105, power: 280, fuelRate: 26, tank: 420, price: 22000, color: "#4ca6a8", comfort: 58, handling: .9 },
  { id: "tour", name: "GrandTour 46", seats: 46, maxSpeed: 135, power: 390, fuelRate: 21, tank: 580, price: 38000, color: "#497fc0", comfort: 82, handling: .78 },
  { id: "lux", name: "Prestige 44", seats: 44, maxSpeed: 145, power: 440, fuelRate: 24, tank: 600, price: 65000, color: "#754b91", comfort: 95, handling: .82 },
  { id: "capacity", name: "HighDeck 58", seats: 58, maxSpeed: 118, power: 410, fuelRate: 29, tank: 650, price: 78000, color: "#c75d4b", comfort: 72, handling: .68 },
  { id: "electric", name: "VoltWay E", seats: 42, maxSpeed: 120, power: 360, fuelRate: 12, tank: 100, price: 92000, color: "#50a879", comfort: 88, handling: .91 }
];
export interface GarageSnapshot { ownedBusIds: string[]; currentBusId: string; paints: Record<string,string>; upgrades: Record<string,number> }
export class GarageManager {
  ownedBusIds: string[];
  currentBusId: string;
  private paints: Record<string,string>;
  private upgrades: Record<string,number>;
  constructor(snapshot?: Partial<GarageSnapshot>) {
    this.ownedBusIds = snapshot?.ownedBusIds?.length ? snapshot.ownedBusIds : ["starter"];
    this.currentBusId = snapshot?.currentBusId && this.ownedBusIds.includes(snapshot.currentBusId) ? snapshot.currentBusId : this.ownedBusIds[0];
    this.paints = snapshot?.paints ?? {};
    this.upgrades = snapshot?.upgrades ?? {};
  }
  get currentBus(): BusDefinition {
    const base = BUS_CATALOG.find(b => b.id === this.currentBusId) ?? BUS_CATALOG[0];
    const level = this.upgrades[this.currentBusId] ?? 0;
    return { ...base, color: this.paints[base.id] ?? base.color, maxSpeed: base.maxSpeed + level * 3, power: base.power + level * 20, handling: Math.min(1.2, base.handling + level * .03) };
  }
  buy(id: string, economy: EconomyManager) {
    const bus = BUS_CATALOG.find(b => b.id === id);
    if (!bus) return { ok: false, message: "Otobüs bulunamadı." };
    if (this.ownedBusIds.includes(id)) return { ok: false, message: "Bu otobüs zaten filonda." };
    if (!economy.debit(bus.price, "bus-purchase", `${bus.name} satın alındı`, `bus-purchase:${id}`)) return { ok: false, message: "Yetersiz bakiye." };
    this.ownedBusIds.push(id); this.currentBusId = id; return { ok: true, message: `${bus.name} satın alındı.` };
  }
  select(id: string) { if (this.ownedBusIds.includes(id)) this.currentBusId = id; }
  cyclePaint() {
    const colors = ["#e3a83e", "#3e8dbd", "#b84b4b", "#3f9b76", "#e3e8ec", "#714e91"];
    const current = this.currentBus.color; const index = colors.indexOf(current);
    this.paints[this.currentBusId] = colors[(index + 1 + colors.length) % colors.length];
  }
  upgrade(economy: EconomyManager) {
    const level = this.upgrades[this.currentBusId] ?? 0;
    if (level >= 5) return { ok: false, message: "Bu otobüs en yüksek seviyede." };
    const cost = 2500 * (level + 1);
    if (!economy.debit(cost, "bus-upgrade", "Otobüs yükseltmesi", `upgrade:${this.currentBusId}:${level + 1}`)) return { ok: false, message: "Yükseltme için bakiye yetersiz." };
    this.upgrades[this.currentBusId] = level + 1; return { ok: true, message: `Yükseltme seviyesi ${level + 1}.` };
  }
  snapshot(): GarageSnapshot { return { ownedBusIds: this.ownedBusIds, currentBusId: this.currentBusId, paints: this.paints, upgrades: this.upgrades }; }
}
