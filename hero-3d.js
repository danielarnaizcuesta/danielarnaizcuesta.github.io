import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

const stage = document.getElementById("workbench-stage");
const canvas = document.getElementById("hero-canvas");

if (!stage || !canvas) {
  return;
}

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
camera.position.set(0, 0.3, 8.4);

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const group = new THREE.Group();
scene.add(group);

const ambient = new THREE.AmbientLight(0xffffff, 1.25);
scene.add(ambient);

const key = new THREE.DirectionalLight(0xeafff6, 1.8);
key.position.set(5, 4, 7);
scene.add(key);

const rim = new THREE.PointLight(0x42d7ab, 2.1, 26, 2);
rim.position.set(-4, -1, 4);
scene.add(rim);

const fill = new THREE.PointLight(0xffffff, 1.1, 18, 2);
fill.position.set(3, 2, 2);
scene.add(fill);

const sphereGeometry = new THREE.IcosahedronGeometry(1.22, 32);
const sphereMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1c9f76,
  metalness: 0.18,
  roughness: 0.18,
  transmission: 0.12,
  clearcoat: 1,
  clearcoatRoughness: 0.12,
  sheen: 0.4,
  sheenColor: new THREE.Color(0xc6fff0),
  emissive: new THREE.Color(0x0e4736),
  emissiveIntensity: 0.18,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
group.add(sphere);

const innerCoreGeometry = new THREE.SphereGeometry(0.56, 32, 32);
const innerCoreMaterial = new THREE.MeshBasicMaterial({
  color: 0x7cf1cf,
  transparent: true,
  opacity: 0.28,
});
const innerCore = new THREE.Mesh(innerCoreGeometry, innerCoreMaterial);
group.add(innerCore);

const ringMaterialA = new THREE.MeshPhysicalMaterial({
  color: 0xe8fff7,
  transparent: true,
  opacity: 0.74,
  metalness: 0.25,
  roughness: 0.15,
});
const ringMaterialB = new THREE.MeshPhysicalMaterial({
  color: 0x79e7c5,
  transparent: true,
  opacity: 0.42,
  metalness: 0.2,
  roughness: 0.24,
});

const ringA = new THREE.Mesh(new THREE.TorusGeometry(2.15, 0.018, 24, 220), ringMaterialA);
ringA.rotation.x = 1.2;
group.add(ringA);

const ringB = new THREE.Mesh(new THREE.TorusGeometry(1.82, 0.026, 24, 200), ringMaterialB);
ringB.rotation.y = 1.05;
ringB.rotation.x = 0.28;
group.add(ringB);

const ringC = new THREE.Mesh(new THREE.TorusGeometry(2.55, 0.014, 18, 180), ringMaterialA.clone());
ringC.material.opacity = 0.24;
ringC.rotation.z = 0.64;
ringC.rotation.x = 1.42;
group.add(ringC);

const particlesCount = 900;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particlesCount * 3);
const particleSizes = new Float32Array(particlesCount);

for (let i = 0; i < particlesCount; i += 1) {
  const radius = 2.8 + Math.random() * 2.6;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta) * 0.62;
  const z = radius * Math.cos(phi);

  particlePositions[i * 3] = x;
  particlePositions[i * 3 + 1] = y;
  particlePositions[i * 3 + 2] = z;
  particleSizes[i] = 0.4 + Math.random() * 1.4;
}

particlesGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
particlesGeometry.setAttribute("size", new THREE.BufferAttribute(particleSizes, 1));

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xd6fff1,
  size: 0.036,
  transparent: true,
  opacity: 0.84,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
group.add(particles);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(3.8, 64),
  new THREE.MeshBasicMaterial({
    color: 0xdff7ef,
    transparent: true,
    opacity: 0.12,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.95;
scene.add(floor);

const targetRotation = { x: 0, y: 0 };
const currentRotation = { x: 0, y: 0 };

function resize() {
  const rect = stage.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}

resize();
window.addEventListener("resize", resize);

if (window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    const rect = stage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    targetRotation.y = x * 0.34;
    targetRotation.x = y * -0.22;
  });
}

let rafId = 0;
const clock = new THREE.Clock();

function animate() {
  rafId = window.requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.045;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.045;

  group.rotation.x = currentRotation.x + Math.sin(t * 0.45) * 0.04;
  group.rotation.y = currentRotation.y + t * 0.18;
  group.rotation.z = Math.sin(t * 0.22) * 0.05;

  sphere.rotation.x = t * 0.42;
  sphere.rotation.y = t * 0.5;
  innerCore.rotation.y = -t * 0.7;
  ringA.rotation.z = t * 0.28;
  ringB.rotation.x = 0.28 + t * 0.24;
  ringB.rotation.z = t * 0.2;
  ringC.rotation.y = t * 0.16;
  particles.rotation.y = -t * 0.05;
  particles.rotation.z = Math.sin(t * 0.18) * 0.18;

  renderer.render(scene, camera);
}

animate();

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.cancelAnimationFrame(rafId);
  } else {
    clock.getDelta();
    animate();
  }
});
