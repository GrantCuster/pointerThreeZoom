import State from "./State";
import * as THREE from "three";

export const initScene = async () => {
  const canvas = State.canvas;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  State.scene = scene;
  State.camera = camera;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas });
  State.renderer = renderer;
  renderer.setSize(window.innerWidth, window.innerHeight);

  const loader = new THREE.TextureLoader();
  const promiseLoader = (url) => {
    return new Promise((resolve, reject) => {
      loader.load(url, (data) => resolve(data), null, reject);
    });
  };

  const src = "grant_gracus-1573758087479.png";
  const texture = await promiseLoader(src);

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });
  const cube = new THREE.Mesh(geometry, material);

  State.cube = cube;
  scene.add(cube);

  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
};

export const setRayFromMouse = (pointerData, projectZ, camera) => {
  const { clip, ray } = pointerData;
  clip.set(
    (pointerData.mouse.x / window.innerWidth) * 2 - 1,
    -(pointerData.mouse.y / window.innerHeight) * 2 + 1,
    0.5
  );
  clip.unproject(camera);
  clip.sub(camera.position).normalize();
  const distance = (projectZ - camera.position.z) / clip.z;
  ray.copy(camera.position).add(clip.multiplyScalar(distance));
};

export const getOpenSlot = () => {
  // Find order for new pointer
  // This method preserves continuous touches
  const orders = State.pointers.map((pointer) => pointer.order);
  const maxCurrent = Math.max(...orders, -1);
  return maxCurrent + 1;
};

export const setPointerDownData = (pointerData) => {
  // Save down
  const downMouse = new THREE.Vector2();
  const downClip = new THREE.Vector3();
  const downRay = new THREE.Vector3();
  downMouse.copy(pointerData.mouse);
  downClip.copy(pointerData.clip);
  downRay.copy(pointerData.ray);
  pointerData.down = {
    mouse: downMouse,
    clip: downClip,
    ray: downRay,
  };
};

export const makePointerData = (e) => {
  // Copy only the event properties we need
  const newPointer = {
    order: State.pointers.length,
    id: e.pointerId,
    mouse: new THREE.Vector2(e.clientX, e.clientY),
    clip: new THREE.Vector3(),
    ray: new THREE.Vector3(),
  };
  setRayFromMouse(newPointer, 0, State.camera);

  setPointerDownData(newPointer);

  const pointerDiv = document.createElement("div");
  pointerDiv.className = "pointer p" + State.pointers.length;
  document.body.appendChild(pointerDiv);
  newPointer.el = pointerDiv;
  newPointer.el.style.transform = `translate(${newPointer.mouse.x}px, ${newPointer.mouse.y}px)`;

  return newPointer;
};

export const makeMidpoint = () => {
  const first = State.pointers[0];
  const second = State.pointers[1];

  const distance = first.mouse.distanceTo(second.mouse);

  const midpointMouse = new THREE.Vector2();
  midpointMouse.subVectors(second.mouse, first.mouse);
  midpointMouse.normalize();
  midpointMouse.multiplyScalar(distance / 2);
  midpointMouse.add(first.mouse);

  const midpointData = {
    mouse: midpointMouse,
    clip: new THREE.Vector3(),
    ray: new THREE.Vector3(),
    distance,
  };
  setRayFromMouse(midpointData, 0, State.camera);
  setPointerDownData(midpointData);
  midpointData.down.distance = distance;

  const midpointDiv = document.createElement("div");
  midpointDiv.className = "pointer m0";
  midpointData.el = midpointDiv;
  midpointData.el.style.transform = `translate(${midpointData.mouse.x}px, ${midpointData.mouse.y}px)`;
  document.body.appendChild(midpointDiv);

  State.midpoint = midpointData;
};

export const removeMidpoint = () => {
  if (State.midpoint !== null) {
    State.midpoint.el.remove();
    State.midpoint = null;
  }
};

export const updateAllDown = (pointers) => {
  for (let i = 0; i < pointers.length; i++) {
    const pointer = pointers[i];
    setPointerDownData(pointer);
  }
};

export const getPointerById = (id) => {
  const pointerIds = State.pointers.map((pointer) => pointer.id);
  const index = pointerIds.indexOf(id);
  return State.pointers[index];
};

export const removePointer = (e) => {
  const pointerIds = State.pointers.map((pointer) => pointer.id);
  const index = pointerIds.indexOf(e.pointerId);
  if (index !== -1) {
    State.pointers[index].el.remove();
    State.pointers.splice(index, 1);
  }
};

export const updatePointer = (activePointer, e) => {
  activePointer.mouse.x = e.clientX;
  activePointer.mouse.y = e.clientY;
  setRayFromMouse(activePointer, State.camera.position.z, State.camera);
  activePointer.el.style.transform = `translate(${activePointer.mouse.x}px, ${activePointer.mouse.y}px)`;
};

export const updateMidpoint = () => {
  // TODO factor this a different way
  const midpoint = State.midpoint;

  const first = State.pointers[0];
  const second = State.pointers[1];

  const distance = first.mouse.distanceTo(second.mouse);

  const midpointMouse = new THREE.Vector2();
  midpointMouse.subVectors(second.mouse, first.mouse);
  midpointMouse.normalize();
  midpointMouse.multiplyScalar(distance / 2);
  midpointMouse.add(first.mouse);

  midpoint.mouse.x = midpointMouse.x;
  midpoint.mouse.y = midpointMouse.y;
  midpoint.distance = distance;
  setRayFromMouse(midpoint, 0, State.camera);

  midpoint.el.style.transform = `translate(${midpoint.mouse.x}px, ${midpoint.mouse.y}px)`;
};

export const updateAllOrder = (pointers) => {
  for (let i = 0; i < pointers.length; i++) {
    const pointer = pointers[i];
    pointer.order = i;
    pointer.el.className = "pointer p" + i;
  }
};

export const setDownCamera = () => {
  State.downCamera = State.camera.clone();
};
