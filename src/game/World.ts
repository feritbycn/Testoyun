import * as THREE from "three";

export function createWorld(scene: THREE.Scene) {
  const hemi = new THREE.HemisphereLight(0xd7efff, 0x536044, 2.0);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffe7c2, 3.2);
  sun.position.set(-35, 65, 28); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -55; sun.shadow.camera.right = 55;
  sun.shadow.camera.top = 55; sun.shadow.camera.bottom = -55;
  scene.add(sun);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(700, 700), new THREE.MeshStandardMaterial({ color: "#66875b", roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.14; ground.receiveShadow = true; scene.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({ color: "#343b44", roughness: 0.92 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(16, 520), roadMat);
  road.rotation.x = -Math.PI / 2; road.position.y = -0.08; road.receiveShadow = true; scene.add(road);
  const lineMat = new THREE.MeshStandardMaterial({ color: "#e6e5d7", emissive: "#292929" });
  for (let z = -250; z < 260; z += 13) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 6.5), lineMat);
    dash.rotation.x = -Math.PI / 2; dash.position.set(0, -0.055, z); scene.add(dash);
  }
  for (const x of [-7.6, 7.6]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 520), new THREE.MeshStandardMaterial({ color: "#f4d68b" }));
    edge.rotation.x = -Math.PI / 2; edge.position.set(x, -0.052, 0); scene.add(edge);
  }

  const bus = makeBus("#e3a83e");
  bus.position.set(0, 0, 12); scene.add(bus);

  // Repeating roadside trees and simple building silhouettes create a coherent 3D test route.
  const treeGeo = new THREE.ConeGeometry(1.25, 4.4, 7);
  const trunkGeo = new THREE.CylinderGeometry(0.22, 0.32, 1.3, 6);
  const treeMat = new THREE.MeshStandardMaterial({ color: "#2f6849", roughness: 1 });
  const trunkMat = new THREE.MeshStandardMaterial({ color: "#72503a" });
  for (let z = -245; z < 270; z += 18) {
    for (const side of [-1, 1]) {
      const x = side * (12 + (Math.abs(z) % 3));
      const trunk = new THREE.Mesh(trunkGeo, trunkMat); trunk.position.set(x, 0.55, z); trunk.castShadow = true; scene.add(trunk);
      const crown = new THREE.Mesh(treeGeo, treeMat); crown.position.set(x, 3.1, z); crown.castShadow = true; scene.add(crown);
      if (z % 54 === 0) {
        const w = 4 + (Math.abs(z) % 4), h = 4 + (Math.abs(z) % 7);
        const building = new THREE.Mesh(new THREE.BoxGeometry(w, h, 5), new THREE.MeshStandardMaterial({ color: side < 0 ? "#9caaa8" : "#c3a58b", roughness: 0.9 }));
        building.position.set(side * 22, h / 2 - 0.1, z - 7); building.castShadow = true; building.receiveShadow = true; scene.add(building);
      }
    }
  }
  const lampMat = new THREE.MeshStandardMaterial({ color: "#4b5358", metalness: 0.55, roughness: 0.5 });
  for (let z = -230; z < 260; z += 38) {
    for (const side of [-1, 1]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 7, 7), lampMat);
      pole.position.set(side * 9.1, 3.5, z); scene.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.08, 0.08), lampMat);
      arm.position.set(side * 8.6, 6.8, z); scene.add(arm);
    }
  }
  const lights = new THREE.Group();
  for (const x of [-0.82, 0.82]) {
    const light = new THREE.SpotLight(0xffe6a1, 0, 42, Math.PI / 8, 0.5, 1.5);
    light.position.set(x, 1.65, -2.2); light.target.position.set(x, 0, -23); lights.add(light, light.target);
  }
  bus.add(lights);
  return { bus, setLights: (on: boolean) => lights.children.forEach(o => { if ((o as THREE.SpotLight).isSpotLight) (o as THREE.SpotLight).intensity = on ? 28 : 0; }) };
}

function makeBus(color: string) {
  const bus = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color, metalness: 0.24, roughness: 0.42 });
  const darkMat = new THREE.MeshStandardMaterial({ color: "#152631", metalness: 0.35, roughness: 0.25 });
  const glassMat = new THREE.MeshStandardMaterial({ color: "#4d788b", metalness: 0.45, roughness: 0.18 });
  const tireMat = new THREE.MeshStandardMaterial({ color: "#171b20", roughness: 0.92 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.1, 3.35, 8.4), bodyMat);
  body.position.y = 2.1; body.castShadow = true; body.receiveShadow = true; bus.add(body);
  const lower = new THREE.Mesh(new THREE.BoxGeometry(3.18, 0.62, 8.35), darkMat);
  lower.position.set(0, 0.75, 0); bus.add(lower);
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.68, 1.1, 0.08), glassMat);
  windshield.position.set(0, 2.72, -4.22); windshield.rotation.x = -0.1; bus.add(windshield);
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.85, 0.08), glassMat);
  rearGlass.position.set(0, 2.65, 4.22); bus.add(rearGlass);
  for (let side of [-1, 1]) {
    for (let z = -2.9; z <= 2.9; z += 1.25) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 0.96), glassMat);
      win.position.set(side * 1.57, 2.72, z); bus.add(win);
    }
    for (const z of [-2.7, 2.7]) {
      const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.57, 0.57, 0.34, 18), tireMat);
      wheel.rotation.z = Math.PI / 2; wheel.position.set(side * 1.62, 0.64, z); wheel.castShadow = true; bus.add(wheel);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.36, 14), new THREE.MeshStandardMaterial({ color: "#aab3ba", metalness: 0.8, roughness: 0.25 }));
      hub.rotation.z = Math.PI / 2; hub.position.set(side * 1.64, 0.64, z); bus.add(hub);
    }
  }
  for (const x of [-1.05, 1.05]) {
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.22, 0.1), new THREE.MeshStandardMaterial({ color: "#fff1bd", emissive: "#f7d98c", emissiveIntensity: 0.25 }));
    head.position.set(x, 1.45, -4.26); bus.add(head);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.1), new THREE.MeshStandardMaterial({ color: "#d83332", emissive: "#9c1616", emissiveIntensity: 0.3 }));
    tail.position.set(x, 1.45, 4.26); bus.add(tail);
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.1, 6.8), new THREE.MeshStandardMaterial({ color: "#f1f0e9", roughness: 0.6 }));
  roof.position.y = 3.82; bus.add(roof);
  return bus;
}
