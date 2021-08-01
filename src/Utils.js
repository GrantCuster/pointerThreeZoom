import State from "./State";

export const getHeightFromZ = (z) => {
  return 2 * Math.tan((State.camera.fov * Math.PI) / 360) * z;
};

export const getWorldPixelAtZ = (z) => {
  const visibleHeight = getHeightFromZ(z);
  return visibleHeight / window.innerHeight;
};

export const getZForHeight = (worldHeight) => {
  return worldHeight / (2 * Math.tan((State.camera.fov * Math.PI) / 360));
};
