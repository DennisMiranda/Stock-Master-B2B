export function normalizeGeometry(osrmGeometry: any): string {
  const normalized = {
    type: "LineString",
    coordinates: Array.from(osrmGeometry.coordinates).map(
      (coord: any) => [Number(coord[0]), Number(coord[1])]
    ),
  };
  
  return JSON.stringify(normalized);
}

export function parseGeometry(geometryString: string): {
  type: "LineString";
  coordinates: [number, number][];
} | null {
  try {
    return JSON.parse(geometryString);
  } catch (error) {
    console.error("Error parsing geometry:", error);
    return null;
  }
}