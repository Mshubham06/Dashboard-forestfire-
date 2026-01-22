
import { GoogleGenAI, Type } from "@google/genai";
import { FireData, FirePoint } from "../types";

export async function fetchFireAnalysis(
  regionName: string, 
  bounds?: string, 
  targetPoint?: FirePoint
): Promise<FireData> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isSpot = !!targetPoint;
  
  const prompt = `Act as an expert Earth Engine Developer. 
  Task: ${isSpot ? 'POINT_CLIP_ANALYSIS' : 'REGIONAL_SURVEY'}.
  Location: ${isSpot ? `Latitude ${targetPoint.lat}, Longitude ${targetPoint.lng}` : regionName}.

  Generate a JSON response that precisely fills the provided schema. 
  IMPORTANT FOR VISUALIZATION: 
  The 'layerSamples' field MUST contain a 10x10 grid (100 coordinate points) covering the ${isSpot ? '5km buffer' : 'entire region of ' + regionName}.
  - ndvi: 0.1 to 0.9
  - temp: 20 to 45 (Celsius)
  - wind: 1 to 20 (m/s)
  - rainfall: 0 to 500 (mm)
  - humidity: 10 to 100 (%)

  The coordinates in layerSamples must be spread across the bounding box of the target area to create a visible grid overlay on the map.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          modisFires: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
                intensity: { type: Type.NUMBER }
              },
              required: ["lat", "lng", "intensity"]
            }
          },
          regionSummary: {
            type: Type.OBJECT,
            properties: {
              windSpeed: { type: Type.NUMBER },
              topography: {
                type: Type.OBJECT,
                properties: { slope: { type: Type.NUMBER }, aspect: { type: Type.NUMBER } }
              },
              weather: {
                type: Type.OBJECT,
                properties: { rainfall: { type: Type.NUMBER }, temp: { type: Type.NUMBER }, relativeHumidity: { type: Type.NUMBER } },
              },
              ndvi: { type: Type.NUMBER },
              lulc: { type: Type.STRING },
              layerSamples: {
                type: Type.OBJECT,
                properties: {
                  ndvi: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  temp: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  wind: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  rainfall: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  humidity: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } }
                }
              }
            }
          },
          spotAnalysis: {
            type: Type.OBJECT,
            properties: {
              windSpeed: { type: Type.NUMBER },
              topography: {
                type: Type.OBJECT,
                properties: { slope: { type: Type.NUMBER }, aspect: { type: Type.NUMBER } }
              },
              ndvi: { type: Type.NUMBER },
              lulc: { type: Type.STRING },
              weather: {
                type: Type.OBJECT,
                properties: { rainfall: { type: Type.NUMBER }, temp: { type: Type.NUMBER }, relativeHumidity: { type: Type.NUMBER } }
              },
              layerSamples: {
                type: Type.OBJECT,
                properties: {
                  ndvi: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  temp: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  wind: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  rainfall: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } },
                  humidity: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, value: { type: Type.NUMBER } } } }
                }
              }
            }
          },
          suggestedBounds: {
            type: Type.ARRAY,
            items: { type: Type.ARRAY, items: { type: Type.NUMBER } }
          }
        },
        required: ["modisFires", "suggestedBounds"]
      }
    }
  });

  return JSON.parse(response.text);
}
