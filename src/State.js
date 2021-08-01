import * as THREE from "three";

const State = {
  pointers: [],
  selected: [],
  downCamera: new THREE.Vector3(),
  midpoint: null,
  cube: null,
  zoomData: {
    mouse: new THREE.Vector2(),
    clip: new THREE.Vector3(),
    ray: new THREE.Vector3(),
  },
};

export default State;
