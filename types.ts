
export interface FirePoint {
  lat: number;
  lng: number;
  intensity: number;
  timestamp?: string;
}

export interface LayerSample {
  lat: number;
  lng: number;
  value: number;
}

export interface EnvironmentalData {
  windSpeed: number;
  burnedArea: number;
  topography: {
    slope: number;
    aspect: number;
  };
  weather: {
    rainfall: number;
    temp: number;
    relativeHumidity: number;
  };
  ndvi: number;
  lulc: string;
  distanceToSettlement: number;
  // Grid data for map visualization
  layerSamples?: {
    ndvi: LayerSample[];
    temp: LayerSample[];
    wind: LayerSample[];
    rainfall: LayerSample[];
    humidity: LayerSample[];
  };
}

export interface FireData {
  modisFires: FirePoint[];
  regionSummary?: EnvironmentalData;
  spotAnalysis?: EnvironmentalData & { 
    targetPoint: FirePoint;
  };
  suggestedBounds?: [[number, number], [number, number]];
}
