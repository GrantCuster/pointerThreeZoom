import React, { useEffect, useRef } from "react";
import State from "./State";
import * as THREE from "three";
import { getWorldPixelAtZ } from "./Utils";
import {
  getPointerById,
  initScene,
  makePointerData,
  removePointer,
  updatePointer,
  updateAllOrder,
  updateAllDown,
  makeMidpoint,
  removeMidpoint,
  updateMidpoint,
  setDownCamera,
  setRayFromMouse,
} from "./Actions";

function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    const pointerDown = (e) => {
      const activePointer = makePointerData(e);
      State.pointers.push(activePointer);

      setDownCamera();

      updateAllOrder(State.pointers);
      updateAllDown(State.pointers);

      if (State.pointers.length > 1) {
        removeMidpoint();
        makeMidpoint();
      }

      canvas.setPointerCapture(e.pointerId);
    };

    const pointerMove = (e) => {
      if (State.pointers.length > 0) {
        const activePointer = getPointerById(e.pointerId);
        updatePointer(activePointer, e);

        if (State.midpoint !== null) {
          const midpoint = State.midpoint;
          updateMidpoint();

          // Directed zoom
          const zoomData = State.zoomData;
          const ratio = midpoint.distance / midpoint.down.distance;
          const newZ = Math.max(
            0.1,
            Math.min(30, State.downCamera.position.z / ratio)
          );
          zoomData.mouse.copy(midpoint.mouse);
          setRayFromMouse(zoomData, newZ, State.downCamera);

          // Apply pan on top of ray
          const worldPixel = getWorldPixelAtZ(State.downCamera.position.z);
          const diffx = midpoint.mouse.x - midpoint.down.mouse.x;
          const diffy = midpoint.mouse.y - midpoint.down.mouse.y;
          State.camera.position.x = zoomData.ray.x - diffx * worldPixel;
          State.camera.position.y = zoomData.ray.y + diffy * worldPixel;
          State.camera.position.z = zoomData.ray.z;
        }
      }
    };

    const pointerUp = (e) => {
      removePointer(e);

      setDownCamera();

      updateAllOrder(State.pointers);
      updateAllDown(State.pointers);

      removeMidpoint();
      if (State.pointers.length > 1) {
        makeMidpoint();
      }

      canvas.releasePointerCapture(e.pointerId);
    };

    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointermove", pointerMove);
    canvas.addEventListener("pointerup", pointerUp);
    canvas.addEventListener("pointercancel", pointerUp);
    return () => {
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointermove", pointerMove);
      canvas.removeEventListener("pointercancel", pointerUp);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    State.canvas = canvas;
    initScene();
  }, [canvasRef]);

  useEffect(() => {
    const handleResize = () => {
      State.camera.aspect = window.innerWidth / window.innerHeight;
      State.camera.updateProjectionMatrix();
      State.renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}

export default App;
