import type { Controls } from "./VehicleController";
type TouchKey = "left" | "right" | "brake" | "throttle";
export class InputController {
  private keys = new Set<string>();
  private touch: Record<TouchKey, boolean> = { left: false, right: false, brake: false, throttle: false };
  hornPressed = false;
  constructor() {
    window.addEventListener("keydown", e => { this.keys.add(e.key.toLowerCase()); if ([" ", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(e.key.toLowerCase())) e.preventDefault(); });
    window.addEventListener("keyup", e => this.keys.delete(e.key.toLowerCase()));
    window.addEventListener("blur", () => this.clear());
  }
  setTouch(key: TouchKey, active: boolean) { this.touch[key] = active; }
  read(): Controls {
    const has = (...keys: string[]) => keys.some(k => this.keys.has(k));
    this.hornPressed = has("h");
    return {
      throttle: has("w", "arrowup") || this.touch.throttle ? 1 : 0,
      brake: has("s", "arrowdown") || this.touch.brake ? 1 : 0,
      steering: (has("a", "arrowleft") || this.touch.left ? -1 : 0) + (has("d", "arrowright") || this.touch.right ? 1 : 0),
      handbrake: has(" ")
    };
  }
  clear() { this.keys.clear(); for (const k of Object.keys(this.touch) as TouchKey[]) this.touch[k] = false; }
}
