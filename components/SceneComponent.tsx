"use client";

import { useEffect, useRef } from "react";
import { Engine, Scene } from "@babylonjs/core";

interface SceneComponentProps {
  antialias?: boolean;
  engineOptions?: any;
  adaptToDeviceRatio?: boolean;
  sceneOptions?: any;
  onSceneReady: (scene: Scene) => void;
  onRender?: (scene: Scene) => void;
  id?: string;
  className?: string;
}

export default function SceneComponent({
  antialias,
  engineOptions,
  adaptToDeviceRatio,
  sceneOptions,
  onSceneReady,
  onRender,
  id,
  className,
}: SceneComponentProps) {
  const reactCanvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!reactCanvas.current) return;

    const engine = new Engine(
      reactCanvas.current,
      antialias,
      { ...engineOptions, preserveDrawingBuffer: true }, // Force preserveDrawingBuffer for testing
      adaptToDeviceRatio
    );
    const scene = new Scene(engine, sceneOptions);

    if (scene.isReady()) {
      onSceneReady(scene);
    } else {
      scene.onReadyObservable.addOnce((scene) => onSceneReady(scene));
    }

    engine.runRenderLoop(() => {
      if (typeof onRender === "function") onRender(scene);
      scene.render();
    });

    const resize = () => {
      scene.getEngine().resize();
    };

    if (window) {
      window.addEventListener("resize", resize);
    }

    return () => {
      scene.getEngine().dispose();

      if (window) {
        window.removeEventListener("resize", resize);
      }
    };
  }, [antialias, engineOptions, adaptToDeviceRatio, sceneOptions, onSceneReady, onRender]);

  return <canvas ref={reactCanvas} id={id} className={className} />;
}
