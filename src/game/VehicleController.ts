import * as THREE from "three";
import type { BusDefinition } from "../systems/GarageManager";

export interface Controls { throttle: number; brake: number; steering: number; handbrake: boolean }
const DEFAULT_BUS: BusDefinition = { id: "starter", name: "Roadliner 40", seats: 40, maxSpeed: 125, power: 320, fuelRate: 23, tank: 500, price: 0, color: "#e3a83e", comfort: 65, handling: 0.8 };

export class VehicleController {
  speed = 0;
  fuel = 100;
  damage = 0;
  private busSpec: BusDefinition = DEFAULT_BUS;
  private lateralVelocity = 0;
  constructor(private readonly mesh: THREE.Group) {}
  setBus(bus: BusDefinition) {
    this.busSpec = bus;
    const body = this.mesh.children.find(c => c instanceof THREE.Mesh && (c as THREE.Mesh).geometry instanceof THREE.BoxGeometry) as THREE.Mesh | undefined;
    if (body && body.material instanceof THREE.MeshStandardMaterial) body.material.color.set(bus.color);
  }
  update(dt: number, controls: Controls, lights = false) {
    const spec = this.busSpec;
    const throttle = Math.max(0, Math.min(1, controls.throttle));
    const brake = Math.max(0, Math.min(1, controls.brake));
    if (this.fuel <= 0) { this.speed = Math.max(0, this.speed - 12 * dt); }
    else this.speed += throttle * (spec.power / 320) * 19 * dt;
    this.speed -= brake * 33 * dt;
    this.speed -= (0.8 + this.speed * 0.035) * dt;
    if (controls.handbrake) this.speed -= 45 * dt;
    this.speed = THREE.MathUtils.clamp(this.speed, 0, spec.maxSpeed);
    const steer = THREE.MathUtils.clamp(controls.steering, -1, 1);
    this.lateralVelocity += steer * (0.8 + this.speed / 65) * spec.handling * dt;
    this.lateralVelocity *= Math.exp(-dt * 1.8);
    this.mesh.position.x += this.lateralVelocity * dt * Math.max(0.4, this.speed / 15);
    this.mesh.position.x = THREE.MathUtils.clamp(this.mesh.position.x, -5.9, 5.9);
    const turn = steer * Math.min(0.32, this.speed / 1200) * 8;
    this.mesh.rotation.y = THREE.MathUtils.lerp(this.mesh.rotation.y, -turn, 1 - Math.exp(-dt * 3));
    this.mesh.rotation.z = THREE.MathUtils.lerp(this.mesh.rotation.z, -steer * Math.min(0.055, this.speed / 800), 1 - Math.exp(-dt * 4));
    this.mesh.position.z -= this.speed * dt * 0.12;
    if (this.mesh.position.z < -180) this.mesh.position.z = 45;
    if (this.mesh.position.x < -5.6 || this.mesh.position.x > 5.6) this.damage = Math.min(100, this.damage + dt * Math.max(0.5, this.speed * 0.06));
    if (throttle > 0 && this.speed > 2) this.fuel = Math.max(0, this.fuel - dt * this.speed * spec.fuelRate / 36000);
    // Gentle body roll conveys weight without pretending to be a full tire/rigid-body solver.
    if (lights) this.mesh.traverse(o => { if (o instanceof THREE.SpotLight) o.intensity = 28; });
  }
  coast(dt: number) { this.speed = Math.max(0, this.speed - 5 * dt); }
  refuel(value: number) { this.fuel = Math.min(100, Math.max(this.fuel, value)); }
  repair() { this.damage = 0; }
  resetDamageIfRepaired() { /* damage persists until repaired */ }
  get position() { return this.mesh.position; }
}
