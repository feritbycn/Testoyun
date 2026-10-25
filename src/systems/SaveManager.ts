import type { WalletSnapshot } from "./EconomyManager";
import type { GarageSnapshot } from "./GarageManager";
import type { RouteSnapshot } from "./RouteManager";
import type { Mission } from "./MissionManager";
export const SAVE_KEY = "roadmaster-save-v1";
export interface SavePayload { wallet: Partial<WalletSnapshot>; garage: Partial<GarageSnapshot>; route: Partial<RouteSnapshot>; missions: Mission[]; language: string; settings: Record<string, unknown> }
export class SaveManager {
  save(data: SavePayload) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, savedAt: Date.now(), data })); }
    catch (error) { console.warn("RoadMaster save failed", error); }
  }
  load(): (SavePayload & { version?: number }) | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.version !== 1 || !parsed.data || typeof parsed.data !== "object") return null;
      return parsed.data as SavePayload;
    } catch (error) { console.warn("RoadMaster save corrupted; starting safely", error); return null; }
  }
  clear() { localStorage.removeItem(SAVE_KEY); }
}
