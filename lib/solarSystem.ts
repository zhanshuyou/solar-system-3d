import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Color4,
  Vector3,
  Mesh,
  Scalar,
  Texture,
  GlowLayer,
  ShadowGenerator,
  SolidParticleSystem,
  PointLight,
  PBRMaterial,
  CubeTexture,
  Texture as BabylonTexture
} from "@babylonjs/core";
import { NoiseProceduralTexture } from "@babylonjs/core";
import { solarSystemData, sunData, PlanetType, PlanetData } from "./planetData";

// Global time multiplier for animation
let time = 0;
const TIME_SPEED = 0.01; // Speed of simulation

interface PlanetMesh extends Mesh {
  orbitData?: {
    distance: number;
    period: number;
    speed: number;
    angle: number;
  };
}

export function createSolarSystem(scene: Scene) {
  // 1. Setup Environment & Glow
  const gl = new GlowLayer("glow", scene);
  gl.intensity = 1.2;

  // 2. Create Sun
  // Using StandardMaterial for Sun as it needs to be purely emissive
  const sunMat = new StandardMaterial("sunMat", scene);
  const sunTexture = new Texture(sunData.textureUrl, scene);
  sunMat.emissiveTexture = sunTexture;
  sunMat.diffuseColor = Color3.Black();
  sunMat.specularColor = Color3.Black();
  sunMat.emissiveColor = Color3.White();
  sunMat.disableLighting = true;

  const sun = MeshBuilder.CreateSphere(
    "Sun",
    { diameter: sunData.radius * 2, segments: 64 },
    scene
  );
  sun.material = sunMat;

  // Light emitted by Sun
  const sunLight = new PointLight(
    "sunLight",
    Vector3.Zero(),
    scene
  );
  sunLight.intensity = 2.0; // Strong sunlight
  sunLight.range = 5000;
  sunLight.diffuse = new Color3(1, 0.95, 0.9); // Slightly warm
  sunLight.specular = new Color3(1, 1, 1);
  
  // Shadows (Optional, enabled for realism)
  const shadowGenerator = new ShadowGenerator(2048, sunLight); 
  shadowGenerator.useBlurExponentialShadowMap = true;
  shadowGenerator.blurKernel = 32;
  shadowGenerator.bias = 0.00005;

  const planets: PlanetMesh[] = [];

  solarSystemData.forEach((data) => {
    // PBR Material for Planets
    const planetMat = createPlanetPBRMaterial(data, scene);

    const planet = MeshBuilder.CreateSphere(
      data.name,
      { diameter: data.radius * 2, segments: 128 },
      scene
    ) as PlanetMesh;
    planet.material = planetMat;
    
    // Rotate texture to correct orientation usually requires some rotation
    planet.rotation.z = Math.PI; // Flip if needed, usually textures are equirectangular

    // Initialize position
    const startAngle = Scalar.RandomRange(0, Math.PI * 2);

    planet.orbitData = {
      distance: data.distance,
      period: data.period,
      speed: (1.0 / data.period) * TIME_SPEED,
      angle: startAngle,
    };

    // Initial position
    planet.position.x = data.distance * Math.cos(startAngle);
    planet.position.z = data.distance * Math.sin(startAngle);

    // Orbital Trail
    createOrbitLine(scene, data.distance, data.name);

    // Shadows
    shadowGenerator.addShadowCaster(planet);
    planet.receiveShadows = true; // Re-enable shadows as we trust PBR + Light

    planets.push(planet);
    
    // Saturn Rings
    if (data.name === "Saturn") {
        createSaturnRings(scene, planet, data.radius, shadowGenerator);
    }
  });

  // Starfield
  createStarfield(scene);

  // Animation Loop
  scene.onBeforeRenderObservable.add(() => {
    planets.forEach((p) => {
      if (p.orbitData) {
        p.orbitData.angle += p.orbitData.speed * scene.getAnimationRatio(); 

        p.position.x = p.orbitData.distance * Math.cos(p.orbitData.angle);
        p.position.z = p.orbitData.distance * Math.sin(p.orbitData.angle);
        
        // Self rotation
        p.rotation.y += dataToRotationSpeed(p.name) * 0.01; 
      }
    });
    
    // Sun rotation
    sun.rotation.y += 0.002;
  });
}

function dataToRotationSpeed(name: string): number {
    const p = solarSystemData.find(x => x.name === name);
    return p ? p.rotationSpeed : 1;
}

function createPlanetPBRMaterial(data: PlanetData, scene: Scene): PBRMaterial {
    const mat = new PBRMaterial(data.name + "Mat", scene);
    
    // Albedo (Diffuse)
    const texture = new Texture(data.textureUrl, scene);
    mat.albedoTexture = texture;
    mat.albedoColor = Color3.White(); // Base multiplier

    // PBR Properties
    mat.metallic = 0; // Planets are generally non-metallic
    mat.roughness = 0.7; // Default rocky roughness

    if (data.type === "Gas") {
        // Gas giants are matte/dull usually, but with atmosphere scattering
        mat.roughness = 0.8;
        mat.metallic = 0;
    } else if (data.name === "Earth") {
        // Earth has water (specular) and land (rough)
        // Ideally we use a roughness map (specular map in green channel usually)
        // But for now, let's make it slightly shiny
        mat.roughness = 0.6;
        mat.metallic = 0.1;
    }

    // Bump Map? (Ideally we have one)
    // We can try to load a normal map if we had the URL, but we don't.
    // So we skip bump or use noise?
    // Let's NOT use noise as bump, it breaks lighting as discovered.
    
    // Lighting setup
    mat.usePhysicalLightFalloff = false; // Easier to control
    
    return mat;
}

function createOrbitLine(scene: Scene, radius: number, name: string) {
  const points = [];
  const steps = 256; 
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    points.push(new Vector3(radius * Math.cos(angle), 0, radius * Math.sin(angle)));
  }
  
  const line = MeshBuilder.CreateLines("orbit_" + name, { points: points }, scene);
  line.color = new Color3(0.3, 0.3, 0.3);
  line.isPickable = false; 
}

function createSaturnRings(scene: Scene, parent: Mesh, planetRadius: number, shadowGenerator: ShadowGenerator) {
    // URL for ring texture
    const RING_URL = "/textures/2k_saturn_ring_alpha.png";
    
    // Create a ground plane for rings (better UV mapping for rings than Torus)
    const ringRadius = planetRadius * 2.5;
    const innerRadius = planetRadius * 1.2;
    
    // We can use a Disc or a Tube.
    // Let's use CreateDisc but we need to handle the hole.
    // Actually, simple plane with alpha texture is best.
    
    const ringMesh = MeshBuilder.CreateDisc("saturnRing", {
        radius: ringRadius,
        tessellation: 64
    }, scene);
    
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.parent = parent;
    
    const mat = new StandardMaterial("ringMat", scene);
    const tex = new Texture(RING_URL, scene);
    mat.diffuseTexture = tex;
    mat.opacityTexture = tex; // Alpha channel handles the hole
    mat.backFaceCulling = false; // Show both sides
    mat.specularColor = Color3.Black();
    
    ringMesh.material = mat;
    ringMesh.receiveShadows = true;
    shadowGenerator.addShadowCaster(ringMesh);
}

function createStarfield(scene: Scene) {
    const sps = new SolidParticleSystem("stars", scene);
    const sphere = MeshBuilder.CreateSphere("s", { diameter: 1 }, scene);
    
    sps.addShape(sphere, 3000); 
    sphere.dispose();
    
    const mesh = sps.buildMesh();
    mesh.name = "stars"; 
    mesh.material = new StandardMaterial("starMat", scene);
    (mesh.material as StandardMaterial).emissiveColor = Color3.White();
    (mesh.material as StandardMaterial).disableLighting = true; 
    mesh.isPickable = false;

    sps.initParticles = () => {
        for (let p = 0; p < sps.nbParticles; p++) {
            const particle = sps.particles[p];
            const radius = Scalar.RandomRange(500, 900);
            const phi = Scalar.RandomRange(0, Math.PI);
            const theta = Scalar.RandomRange(0, Math.PI * 2);
            
            particle.position.x = radius * Math.sin(phi) * Math.cos(theta);
            particle.position.y = radius * Math.sin(phi) * Math.sin(theta);
            particle.position.z = radius * Math.cos(phi);
            
            const scale = Scalar.RandomRange(0.2, 0.6);
            particle.scale = new Vector3(scale, scale, scale);
            
            if (Math.random() > 0.8) {
                 particle.color = new Color4(0.8, 0.8, 1, 1);
            } else if (Math.random() > 0.8) {
                 particle.color = new Color4(1, 0.9, 0.8, 1);
            } else {
                 particle.color = new Color4(1, 1, 1, 1);
            }
        }
    };
    
    sps.initParticles();
    sps.setParticles();
}
