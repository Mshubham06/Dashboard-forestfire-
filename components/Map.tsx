
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { FireData, FirePoint } from '../types';
import { TILE_LAYERS } from '../constants';

interface MapProps {
  center: [number, number];
  zoom: number;
  fireData: FireData | null;
  geojson: any | null;
  visibleLayers: {
    fires: boolean; 
    burnedArea: boolean;
    wind: boolean;
    rainfall: boolean;
    temp: boolean;
    humidity: boolean;
    ndvi: boolean; 
    lulc: boolean;
    slope: boolean;
    settlement: boolean;
  };
  onFireClick: (point: FirePoint) => void;
  selectedFire: FirePoint | null;
}

const Map: React.FC<MapProps> = ({ 
  center, 
  zoom, 
  fireData, 
  geojson, 
  visibleLayers, 
  onFireClick, 
  selectedFire
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const fireLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const dataLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView(center, zoom);
    
    L.tileLayer(TILE_LAYERS.satellite, { maxZoom: 19 }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    
    mapRef.current = map;
    fireLayerGroupRef.current = L.layerGroup().addTo(map);
    dataLayerGroupRef.current = L.layerGroup().addTo(map);
    
    return () => { map.remove(); };
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom]);

  // Handle Layer Visualizations (Data overlays)
  useEffect(() => {
    if (!mapRef.current || !dataLayerGroupRef.current) return;
    dataLayerGroupRef.current.clearLayers();

    const currentData = selectedFire ? fireData?.spotAnalysis : fireData?.regionSummary;
    if (!currentData || !currentData.layerSamples) return;

    const samples = currentData.layerSamples;
    // EXPANDED CELL SIZE: significantly larger as requested
    const cellSize = selectedFire ? 0.02 : 0.45;

    const renderGrid = (dataSamples: any[] | undefined, getStyles: (val: number) => { color: string, opacity: number }) => {
      if (!dataSamples) return;
      dataSamples.forEach(s => {
        const { color, opacity } = getStyles(s.value);
        L.rectangle([[s.lat, s.lng], [s.lat + cellSize, s.lng + cellSize]], {
          color: 'transparent',
          fillColor: color,
          fillOpacity: opacity,
          interactive: false
        }).addTo(dataLayerGroupRef.current!);
      });
    };

    if (visibleLayers.ndvi && samples.ndvi) {
      renderGrid(samples.ndvi, (val) => ({
        color: val > 0.7 ? '#064e3b' : val > 0.4 ? '#10b981' : '#a7f3d0',
        opacity: 0.6
      }));
    }

    if (visibleLayers.temp && samples.temp) {
      renderGrid(samples.temp, (val) => ({
        color: val > 35 ? '#7f1d1d' : val > 25 ? '#ef4444' : '#fcd34d',
        opacity: 0.5
      }));
    }

    if (visibleLayers.rainfall && samples.rainfall) {
      renderGrid(samples.rainfall, (val) => ({
        color: val > 300 ? '#1e3a8a' : val > 100 ? '#3b82f6' : '#93c5fd',
        opacity: 0.5
      }));
    }

    if (visibleLayers.humidity && samples.humidity) {
      renderGrid(samples.humidity, (val) => ({
        color: val > 80 ? '#0891b2' : val > 50 ? '#06b6d4' : '#a5f3fc',
        opacity: 0.5
      }));
    }

    if (visibleLayers.wind && samples.wind) {
      renderGrid(samples.wind, (val) => ({
        color: '#ffffff',
        opacity: Math.min(0.4, val / 40)
      }));
    }

    // Proxy visualization for LULC, Slope, and Settlement using NDVI/Temp base data
    if (visibleLayers.lulc) {
      renderGrid(samples.ndvi, (val) => ({ color: val > 0.5 ? '#15803d' : '#ca8a04', opacity: 0.7 }));
    }
    if (visibleLayers.slope) {
      renderGrid(samples.temp, (val) => ({ color: '#475569', opacity: 0.3 }));
    }
    if (visibleLayers.settlement) {
      renderGrid(samples.wind, (val) => ({ color: '#f59e0b', opacity: 0.3 }));
    }

    if (selectedFire) {
      L.circle([selectedFire.lat, selectedFire.lng], {
        radius: 8000,
        color: '#fbbf24',
        weight: 3,
        fillOpacity: 0.1,
        dashArray: '10, 10'
      }).addTo(dataLayerGroupRef.current);
    }
  }, [fireData, selectedFire, visibleLayers]);

  // Handle Fire Points (Blinking removed)
  useEffect(() => {
    if (!mapRef.current || !fireLayerGroupRef.current) return;
    fireLayerGroupRef.current.clearLayers();
    
    if (fireData && visibleLayers.fires) {
      fireData.modisFires.forEach(fire => {
        const isSelected = selectedFire && selectedFire.lat === fire.lat && selectedFire.lng === fire.lng;
        
        const marker = L.circleMarker([fire.lat, fire.lng], {
          radius: isSelected ? 18 : 10,
          fillColor: fire.intensity > 150 ? '#ef4444' : '#fbbf24',
          color: isSelected ? '#ffffff' : 'transparent',
          weight: 4,
          fillOpacity: 1,
          className: '' // Blink removed as requested
        }).addTo(fireLayerGroupRef.current!);

        // Popup for exact location and intensity
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 140px; color: #1e293b;">
            <p style="margin: 0; font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase;">Fire Point</p>
            <hr style="margin: 6px 0; border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="margin: 2px 0; font-size: 11px;"><b>Lat:</b> ${fire.lat.toFixed(5)}</p>
            <p style="margin: 2px 0; font-size: 11px;"><b>Lng:</b> ${fire.lng.toFixed(5)}</p>
            <p style="margin: 4px 0 0 0; font-size: 13px; font-weight: 800; color: #b91c1c;">Intensity: ${fire.intensity} K</p>
          </div>
        `;
        marker.bindPopup(popupContent, { closeButton: false, offset: L.point(0, -10) });

        marker.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          marker.openPopup();
          onFireClick(fire);
        });

        if (isSelected) marker.openPopup();
      });
    }
  }, [fireData, selectedFire, visibleLayers.fires]);

  // Handle GeoJSON Boundaries
  useEffect(() => {
    if (!mapRef.current) return;
    if (geojsonLayerRef.current) mapRef.current.removeLayer(geojsonLayerRef.current);

    if (geojson) {
      geojsonLayerRef.current = L.geoJSON(geojson, { 
        style: { color: '#ffffff', weight: 4, fillOpacity: 0.1, dashArray: '10, 10' } 
      }).addTo(mapRef.current);
      
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid() && !selectedFire) {
        mapRef.current.fitBounds(bounds, { padding: [100, 100] });
      }
    }
  }, [geojson, fireData, selectedFire]);

  return <div ref={mapContainerRef} className="w-full h-full relative" />;
};

export default Map;
