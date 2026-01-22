
import React from 'react';

export const INDIA_CENTER: [number, number] = [20.5937, 78.9629];
export const DEFAULT_ZOOM = 5;

export const TILE_LAYERS = {
  satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  terrain: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
};

// Coordinate mapping for quick flight to states
export const STATE_COORDS: Record<string, { center: [number, number], zoom: number }> = {
  "Andhra Pradesh": { center: [15.9129, 79.74], zoom: 7 },
  "Arunachal Pradesh": { center: [28.218, 94.7278], zoom: 7 },
  "Assam": { center: [26.2006, 92.9376], zoom: 7 },
  "Bihar": { center: [25.0961, 85.3131], zoom: 7 },
  "Chhattisgarh": { center: [21.2787, 81.8661], zoom: 7 },
  "Goa": { center: [15.2993, 74.124], zoom: 10 },
  "Gujarat": { center: [22.2587, 71.1924], zoom: 7 },
  "Haryana": { center: [29.0588, 76.0856], zoom: 8 },
  "Himachal Pradesh": { center: [31.1048, 77.1734], zoom: 8 },
  "Jharkhand": { center: [23.6102, 85.2799], zoom: 7 },
  "Karnataka": { center: [15.3173, 75.7139], zoom: 7 },
  "Kerala": { center: [10.8505, 76.2711], zoom: 7 },
  "Madhya Pradesh": { center: [22.9734, 78.6569], zoom: 7 },
  "Maharashtra": { center: [19.7515, 75.7139], zoom: 7 },
  "Manipur": { center: [24.6637, 93.9063], zoom: 8 },
  "Meghalaya": { center: [25.467, 91.3662], zoom: 8 },
  "Mizoram": { center: [23.1645, 92.9376], zoom: 8 },
  "Nagaland": { center: [26.1584, 94.5624], zoom: 8 },
  "Odisha": { center: [20.9517, 85.0985], zoom: 7 },
  "Punjab": { center: [31.1471, 75.3412], zoom: 8 },
  "Rajasthan": { center: [27.0238, 74.2179], zoom: 7 },
  "Sikkim": { center: [27.533, 88.5122], zoom: 9 },
  "Tamil Nadu": { center: [11.1271, 78.6569], zoom: 7 },
  "Telangana": { center: [18.1124, 79.0193], zoom: 7 },
  "Tripura": { center: [23.9408, 91.9882], zoom: 9 },
  "Uttar Pradesh": { center: [26.8467, 80.9462], zoom: 7 },
  "Uttarakhand": { center: [30.0668, 79.0193], zoom: 8 },
  "West Bengal": { center: [22.9868, 87.855], zoom: 7 }
};

export const STATES_OF_INDIA = Object.keys(STATE_COORDS);

export const Icons = {
  Fire: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.5-7 3 3 5.5 1 5.5 1s.5 1 0 5c2 1 2 3 2 4s-1.5 4-3.5 5.657zM11 15v.01M7 15v.01M13 15v.01" /></svg>,
  Wind: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>,
  Rain: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>,
  Temp: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Map: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>,
  Satellite: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
};
