export type PlanetType = "Rocky" | "Gas";

export interface PlanetData {
  name: string;
  type: PlanetType;
  radius: number;
  distance: number;
  period: number;
  color: string;
  rotationSpeed: number;
  description: string;
  textureUrl: string;
}

const TEXTURE_BASE = "/textures/";

export const solarSystemData: PlanetData[] = [
  {
    name: "Mercury",
    type: "Rocky",
    radius: 0.38 * 0.5,
    distance: 0.39 * 20,
    period: 0.24,
    color: "#A5A5A5",
    rotationSpeed: 0.01,
    description: "The smallest planet in our solar system.",
    textureUrl: TEXTURE_BASE + "2k_mercury.jpg",
  },
  {
    name: "Venus",
    type: "Rocky",
    radius: 0.95 * 0.5,
    distance: 0.72 * 20,
    period: 0.62,
    color: "#E3BB76",
    rotationSpeed: -0.004,
    description: "Second planet from the Sun.",
    textureUrl: TEXTURE_BASE + "2k_venus.jpg",
  },
  {
    name: "Earth",
    type: "Rocky",
    radius: 1.0 * 0.5,
    distance: 1.0 * 20,
    period: 1.0,
    color: "#22A6B3",
    rotationSpeed: 1,
    description: "Our home planet.",
    textureUrl: TEXTURE_BASE + "2k_earth.jpg",
  },
  {
    name: "Mars",
    type: "Rocky",
    radius: 0.53 * 0.5,
    distance: 1.52 * 20,
    period: 1.88,
    color: "#DD4C3A",
    rotationSpeed: 0.9,
    description: "The dusty, cold, desert world.",
    textureUrl: TEXTURE_BASE + "2k_mars.jpg",
  },
  {
    name: "Jupiter",
    type: "Gas",
    radius: 11.2 * 0.5 * 0.4,
    distance: 5.2 * 20,
    period: 11.86,
    color: "#D9A066",
    rotationSpeed: 2.4,
    description: "The largest planet.",
    textureUrl: TEXTURE_BASE + "2k_jupiter.jpg",
  },
  {
    name: "Saturn",
    type: "Gas",
    radius: 9.45 * 0.5 * 0.4,
    distance: 9.58 * 20,
    period: 29.45,
    color: "#EAD6B8",
    rotationSpeed: 2.2,
    description: "Adorned with a dazzling system of icy rings.",
    textureUrl: TEXTURE_BASE + "2k_saturn.jpg",
  },
  {
    name: "Uranus",
    type: "Gas",
    radius: 4.0 * 0.5 * 0.6,
    distance: 19.2 * 20 * 0.7,
    period: 84,
    color: "#D1F2F8",
    rotationSpeed: -1.4,
    description: "It rotates at a nearly 90-degree angle.",
    textureUrl: TEXTURE_BASE + "2k_uranus.jpg",
  },
  {
    name: "Neptune",
    type: "Gas",
    radius: 3.88 * 0.5 * 0.6,
    distance: 30.05 * 20 * 0.6,
    period: 164.8,
    color: "#4b70dd",
    rotationSpeed: 1.5,
    description: "The first planet located through mathematical calculations.",
    textureUrl: TEXTURE_BASE + "2k_neptune.jpg",
  },
];

export const sunData = {
  name: "Sun",
  radius: 109 * 0.5 * 0.05,
  color: "#FDB813",
  emissive: "#FDB813",
  textureUrl: TEXTURE_BASE + "2k_sun.jpg",
};