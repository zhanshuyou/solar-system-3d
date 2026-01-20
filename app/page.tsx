"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ArcRotateCamera, Vector3, HemisphericLight, Scene, Color4, Color3, Mesh } from "@babylonjs/core";
import SceneComponent from "@/components/SceneComponent";
import { createSolarSystem } from "@/lib/solarSystem";
import { solarSystemData } from "@/lib/planetData";

export default function Home() {
  const sceneRef = useRef<Scene | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);

  // Initialize scene only once using useCallback to prevent recreation
  const onSceneReady = useCallback((scene: Scene) => {
    sceneRef.current = scene;
    scene.clearColor = new Color4(0.05, 0.05, 0.1, 1);

    // Camera
    const camera = new ArcRotateCamera(
      "camera1",
      Math.PI / 2, // alpha
      Math.PI / 3, // beta
      200,         // radius
      Vector3.Zero(),
      scene
    );
    camera.lowerRadiusLimit = 2; 
    camera.upperRadiusLimit = 1000;
    
    const canvas = scene.getEngine().getRenderingCanvas();
    camera.attachControl(canvas, true);

    // Ambient Light
    const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
    light.intensity = 1.0; // High intensity to ensure visibility everywhere
    light.groundColor = new Color3(0.2, 0.2, 0.2); // Light up the bottom/back sides a bit

    createSolarSystem(scene);

    // Picking logic (Click on 3D object)
    scene.onPointerDown = (evt, pickResult) => {
      if (pickResult.hit && pickResult.pickedMesh) {
        const name = pickResult.pickedMesh.name;
        // Check if it's a planet (simple check against data)
        const isPlanet = solarSystemData.some(p => p.name === name) || name === "Sun";
        if (isPlanet) {
           // Simply update state, useEffect will handle the rest
           setSelectedPlanet(name);
        }
      }
    };
  }, []); // Empty dependency array ensures this is created only once!

  // React to selection changes
  useEffect(() => {
      const scene = sceneRef.current;
      // Ensure scene exists and has meshes
      if (!scene || scene.meshes.length === 0) return;
      
      const name = selectedPlanet;
      
      // Update Visibility
      updateVisibility(scene, name);

      // Update Camera Target and Position
      const camera = scene.activeCamera as ArcRotateCamera;
      if (camera) {
          if (name) {
             const mesh = scene.getMeshByName(name);
             if (mesh) {
                 // Lock target
                 camera.setTarget(mesh);
                 
                 // Adjust Zoom
                 const planetInfo = solarSystemData.find(p => p.name === name);
                 if (planetInfo) {
                    const targetRadius = planetInfo.radius * 10;
                    // Only zoom in if we are too far
                    if (camera.radius > targetRadius * 2) {
                        camera.radius = targetRadius * 2;
                    }
                 } else if (name === "Sun") {
                    camera.radius = 40;
                 }
             }
          } else {
             // Reset View
             camera.setTarget(Vector3.Zero());
             camera.radius = 200;
          }
      }
  }, [selectedPlanet]); // Re-run whenever selectedPlanet changes

  const updateVisibility = (scene: Scene, activePlanetName: string | null) => {
    scene.meshes.forEach(mesh => {
        let shouldEnable = false;
        
        // Always keep stars visible
        if (mesh.name === "stars") {
            shouldEnable = true;
        }
        // If no planet is selected, show everything
        else if (activePlanetName === null) {
            shouldEnable = true;
        }
        // If a planet is selected:
        else {
            // 1. Show the selected planet
            if (mesh.name === activePlanetName) {
                shouldEnable = true;
            }
            // 2. Show children of the selected planet (e.g. Saturn's rings)
            else if (mesh.parent && mesh.parent.name === activePlanetName) {
                 shouldEnable = true;
            }
            // 3. Hide everything else
            else {
                shouldEnable = false;
            }
        }
        
        // Apply visibility
        mesh.setEnabled(shouldEnable);
        mesh.isVisible = shouldEnable; 
    });
  };

  const handleResetView = () => {
    setSelectedPlanet(null);
  };
  
  const handlePlanetClick = (name: string) => {
      setSelectedPlanet(name);
  };

  return (
    <div className="w-full h-full relative group">
      <SceneComponent
        antialias
        onSceneReady={onSceneReady}
        id="solar-system-canvas"
        className="w-full h-full block outline-none"
      />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10 text-white pointer-events-auto">
            <h1 className="text-xl font-bold mb-2">Solar System 3D</h1>
            <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
                <button 
                    onClick={handleResetView}
                    className={`text-left px-3 py-1 rounded hover:bg-white/20 transition-colors ${!selectedPlanet ? 'bg-blue-600' : ''}`}
                >
                    Overview (Sun)
                </button>
                {solarSystemData.map(p => (
                    <button
                        key={p.name}
                        onClick={() => handlePlanetClick(p.name)}
                        className={`text-left px-3 py-1 rounded hover:bg-white/20 transition-colors ${selectedPlanet === p.name ? 'bg-blue-600' : ''}`}
                    >
                        {p.name}
                    </button>
                ))}
            </div>
        </div>

        {selectedPlanet && (
            <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg border border-white/10 text-white pointer-events-auto max-w-xs">
                <h2 className="text-lg font-bold">{selectedPlanet}</h2>
                <p className="text-sm text-gray-300">
                    {solarSystemData.find(p => p.name === selectedPlanet)?.description || "The Star of our system."}
                </p>
            </div>
        )}
      </div>
      
      <div className="absolute bottom-4 left-4 text-white/50 text-xs pointer-events-none">
        Use Mouse to Orbit/Zoom. Click on planets to focus.
      </div>
    </div>
  );
}
