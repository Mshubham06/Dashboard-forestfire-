
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Map from './components/Map';
import IndicatorCard from './components/IndicatorCard';
import { fetchFireAnalysis } from './services/geminiService';
import { FireData, FirePoint, EnvironmentalData } from './types';
import { INDIA_CENTER, DEFAULT_ZOOM, STATE_COORDS, Icons } from './constants';
import L from 'leaflet';
// @ts-ignore
import shp from 'shpjs';

const App: React.FC = () => {
  const [center, setCenter] = useState<[number, number]>(INDIA_CENTER);
  const [zoom, setZoom] = useState<number>(DEFAULT_ZOOM);
  const [fireData, setFireData] = useState<FireData | null>(null);
  const [currentRegion, setCurrentRegion] = useState<string>('National Overview');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isClipping, setIsClipping] = useState<boolean>(false);
  const [geojson, setGeojson] = useState<any | null>(null);
  const [selectedFire, setSelectedFire] = useState<FirePoint | null>(null);
  
  const [layers, setLayers] = useState({
    fires: true,
    burnedArea: false,
    wind: false,
    rainfall: false,
    temp: false,
    humidity: false,
    ndvi: true,
    lulc: false,
    slope: false,
    settlement: false
  });

  useEffect(() => { handleAnalyze('India'); }, []);

  const handleAnalyze = async (region: string, bounds?: string) => {
    setIsAnalyzing(true);
    setSelectedFire(null);
    try {
      const data = await fetchFireAnalysis(region, bounds);
      setFireData(data);
    } catch (error) { 
      console.error("Analysis Error:", error); 
    } finally { 
      setIsAnalyzing(false); 
    }
  };

  const onStateSelect = (state: string) => {
    if (!state) return;
    setCurrentRegion(state);
    setGeojson(null);
    setSelectedFire(null);

    const coords = STATE_COORDS[state];
    if (coords) {
      setCenter(coords.center);
      setZoom(coords.zoom);
    }
    
    handleAnalyze(state);
  };

  const handlePointClick = async (lat: number, lng: number, intensity: number = 0) => {
    setIsClipping(true);
    const point = { lat, lng, intensity };
    setSelectedFire(point);
    try {
      const data = await fetchFireAnalysis(currentRegion, undefined, point);
      if (data.spotAnalysis) {
        setFireData(prev => ({ ...(prev || data), spotAnalysis: data.spotAnalysis }));
      }
    } catch (error) { 
      console.error("Clip Error:", error); 
    } finally { 
      setIsClipping(false); 
    }
  };

  const handleLayerDownload = (layerId: string, layerLabel: string) => {
    if (!fireData) return;
    const activeData = selectedFire ? fireData.spotAnalysis : fireData.regionSummary;
    let dataToExport: any;

    if (layerId === 'fires') {
      dataToExport = fireData.modisFires;
    } else {
      dataToExport = (activeData?.layerSamples as any)?.[layerId] || { message: "Detailed samples unavailable for this layer in current view." };
    }

    const blob = new Blob([JSON.stringify({
      layer: layerLabel,
      region: currentRegion,
      timestamp: new Date().toISOString(),
      data: dataToExport
    }, null, 2)], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GIS_${layerLabel.replace(/\s/g, '_')}_${currentRegion.replace(/\s/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLayerClip = (layerId: string) => {
    // Re-analyzing with current settings to "clip" the data view
    handleAnalyze(currentRegion);
  };

  const onDownloadData = () => {
    if (!fireData) return;
    const activeMetrics = selectedFire ? fireData.spotAnalysis : fireData.regionSummary;
    
    // Comprehensive report including all right-panel information
    const exportData = {
      reportHeader: {
        region: currentRegion,
        generatedAt: new Date().toISOString(),
        analysisMode: selectedFire ? 'Spot Analysis' : 'Regional Survey'
      },
      indicators: {
        ndvi: activeMetrics?.ndvi,
        surfaceTemperature: activeMetrics?.weather.temp,
        windVelocity: activeMetrics?.windSpeed,
        rainfall: activeMetrics?.weather.rainfall,
        humidity: activeMetrics?.weather.relativeHumidity,
        terrainSlope: activeMetrics?.topography.slope,
        landClassification: activeMetrics?.lulc,
        distanceToSettlement: activeMetrics?.distanceToSettlement
      },
      thermalAnomalies: fireData.modisFires,
      gridSamples: activeMetrics?.layerSamples
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Full_GIS_Report_${currentRegion.replace(/\s/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onDownloadScript = () => {
    const script = `
/**
 * FireWatch India - GEE Analysis Script
 * Region: ${currentRegion}
 */
var region = ${selectedFire ? `ee.Geometry.Point([${selectedFire.lng}, ${selectedFire.lat}]).buffer(5000)` : `ee.FeatureCollection("FAO/GAUL/2015/level1").filter(ee.Filter.eq('ADM1_NAME', '${currentRegion}'))`};
var fire = ee.ImageCollection("MODIS/061/MOD14A1").filterBounds(region).filterDate('2024-01-01', '2025-12-31').max();
var ndvi = ee.ImageCollection("COPERNICUS/S2_SR").filterBounds(region).median().normalizedDifference(['B8', 'B4']);
Map.centerObject(region, 9);
Map.addLayer(ndvi, {min: 0, max: 0.8, palette: ['brown', 'yellow', 'green']}, 'NDVI');
Map.addLayer(fire.select('FireMask'), {min: 0, max: 9, palette: ['white', 'red']}, 'Thermal Anomalies');
    `.trim();

    const blob = new Blob([script], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GEE_Script_${currentRegion.replace(/\s/g, '_')}.js`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeData: EnvironmentalData | undefined = selectedFire ? fireData?.spotAnalysis : fireData?.regionSummary;

  return (
    <div className="flex h-screen w-full font-sans text-slate-200 bg-slate-950 overflow-hidden">
      <Sidebar 
        onStateSelect={onStateSelect}
        onFileUpload={async (f) => {
          setIsAnalyzing(true);
          try {
            const buffer = await f.arrayBuffer();
            const data = await shp(buffer);
            setGeojson(data);
            const layer = L.geoJSON(data);
            const centerPoint = layer.getBounds().getCenter();
            setCenter([centerPoint.lat, centerPoint.lng]);
            setZoom(10);
            handleAnalyze(f.name);
          } catch (e) { 
            alert("Invalid Shapefile Zip"); 
            setIsAnalyzing(false); 
          }
        }}
        isAnalyzing={isAnalyzing}
        onToggleLayer={(l, v) => setLayers(p => ({ ...p, [l]: v }))}
        layers={layers}
        onDownloadScript={onDownloadScript}
        onDownloadData={onDownloadData}
        onLayerDownload={handleLayerDownload}
        onLayerClip={handleLayerClip}
      />
      
      <main className="flex-1 relative border-r border-slate-800">
        <Map 
          center={center} 
          zoom={zoom} 
          fireData={fireData} 
          geojson={geojson} 
          visibleLayers={layers} 
          onFireClick={(p) => handlePointClick(p.lat, p.lng, p.intensity)}
          selectedFire={selectedFire}
        />
      </main>

      <section className="w-[420px] bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl shrink-0 overflow-hidden">
        <header className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
          <div>
            <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {selectedFire ? 'POINT CLIP ANALYSIS' : 'REGIONAL INDICATORS'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-tight">{currentRegion}</p>
          </div>
          <div className="flex gap-2">
            {selectedFire && (
              <button onClick={() => setSelectedFire(null)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-700 transition-all">Reset</button>
            )}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide relative">
          {isClipping && (
            <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex flex-col items-center justify-center gap-4 text-orange-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <p className="text-[10px] font-black uppercase tracking-widest">Processing Satellite Clip...</p>
            </div>
          )}

          {activeData ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <IndicatorCard label="NDVI index" value={activeData.ndvi.toFixed(4)} icon={<Icons.Map />} color="text-emerald-500" />
                <IndicatorCard label="Surface Temp" value={activeData.weather.temp} unit="°C" icon={<Icons.Temp />} color="text-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <IndicatorCard label="Wind Velocity" value={activeData.windSpeed} unit="m/s" icon={<Icons.Wind />} color="text-sky-400" />
                <IndicatorCard label="Rainfall Sum" value={activeData.weather.rainfall} unit="mm" icon={<Icons.Rain />} color="text-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <IndicatorCard label="Rel Humidity" value={activeData.weather.relativeHumidity} unit="%" icon={<Icons.Rain />} color="text-cyan-400" />
                <IndicatorCard label="Terrain Slope" value={activeData.topography.slope} unit="°" icon={<Icons.Map />} color="text-slate-400" />
              </div>
              
              <div className="p-5 bg-slate-800/40 border border-slate-700 rounded-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Land Classification</p>
                  <div className="p-2 bg-slate-950 rounded-lg text-purple-400 border border-slate-800"><Icons.Map /></div>
                </div>
                <p className="text-sm font-black text-white uppercase tracking-tight leading-none mb-1">{activeData.lulc || 'Analyzing...'}</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase">ESA WorldCover 10m Dataset</p>
              </div>

              <div className="mt-6 p-5 bg-slate-950/50 border border-slate-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                   <span className="text-[10px] text-slate-500 font-black uppercase">Live GEE Sync</span>
                   <div className="flex items-center gap-1.5">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                     <span className="text-[9px] text-emerald-500 font-black uppercase">Online</span>
                   </div>
                </div>
                <div className="space-y-1 mt-3">
                   <div className="flex justify-between text-[9px] font-bold uppercase text-slate-600">
                     <span>Fires in View</span>
                     <span className="text-red-500">{fireData?.modisFires.length || 0} Points</span>
                   </div>
                   <div className="flex justify-between text-[9px] font-bold uppercase text-slate-600">
                     <span>Last Update</span>
                     <span>{new Date().toLocaleTimeString()}</span>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center px-10 gap-6">
               <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-700 shadow-inner">
                 <Icons.Satellite />
               </div>
               <div>
                 <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Ready for Analysis</h3>
                 <p className="text-[10px] text-slate-500 font-medium leading-relaxed uppercase tracking-tighter font-black">
                   Search for a region or select an active fire point on the map to begin multispectral indicators extraction.
                 </p>
               </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default App;
