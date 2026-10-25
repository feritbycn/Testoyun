import * as THREE from "three";
export class TrafficManager {
  private cars: THREE.Group[] = [];
  constructor(private scene: THREE.Scene) {
    for (let i = 0; i < 7; i++) {
      const car = new THREE.Group();
      const paint = new THREE.MeshStandardMaterial({ color: ["#d7e0e4", "#547a9a", "#c66a4b", "#d8c57a"][i % 4], metalness: 0.2, roughness: 0.45 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(1.55, 1.05, 3.1), paint); body.position.y = 0.85; body.castShadow = true; car.add(body);
      const glass = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.52, 1.2), new THREE.MeshStandardMaterial({ color: "#253e4c", metalness: 0.35, roughness: 0.2 })); glass.position.set(0, 1.55, -0.25); car.add(glass);
      car.position.set(i % 2 === 0 ? -3.2 : 3.2, 0, -28 - i * 28);
      this.cars.push(car); scene.add(car);
    }
  }
  update(dt: number, busPosition: THREE.Vector3) {
    for (const [i, car] of this.cars.entries()) {
      car.position.z += dt * (6 + i % 3 * 2);
      if (car.position.z > busPosition.z + 45) car.position.z = busPosition.z - 200 - i * 12;
      if (Math.abs(car.position.z - busPosition.z) < 3.8 && Math.abs(car.position.x - busPosition.x) < 2.25) {
        car.position.z -= dt * 8;
      }
    }
  }
}
