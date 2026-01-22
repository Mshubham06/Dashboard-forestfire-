
import React, { useRef, useState } from 'react';
import { STATES_OF_INDIA, Icons } from './constants';

interface SidebarProps {
  onStateSelect: (state: string) => void;
  onFileUpload: (file: File) => void;
  isAnalyzing: boolean;
  onToggleLayer: (layer: string, visible: boolean) => void;
  onDownloadScript: () => void;
  onDownloadData: () => void;
  layers: { 
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
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onStateSelect, 
  onFileUpload, 
  isAnalyzing, 
  onToggleLayer, 
  onDownloadScript,
  onDownloadData,
  layers
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedState, setSelectedState] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const layerConfigs = [
    { id: 'fires', label: 'MODIS Fire Points', color: 'bg-red-500' },
    { id: 'ndvi', label: 'NDVI (Vegetation)', color: 'bg-emerald-500' },
    { id: 'temp', label: 'Surface Temperature', color: 'bg-orange-500' },
    { id: 'rainfall', label: 'Rainfall (CHIRPS)', color: 'bg-blue-600' },
    { id: 'humidity', label: 'Relative Humidity', color: 'bg-cyan-400' },
    { id: 'wind', label: 'Wind Simulation', color: 'bg-sky-400' },
    { id: 'lulc', label: 'LULC (ESA WorldCover)', color: 'bg-purple-500' },
    { id: 'burnedArea', label: 'Burned Area Extent', color: 'bg-stone-700' },
    { id: 'slope', label: 'Terrain Slope', color: 'bg-slate-400' },
    { id: 'settlement', label: 'Settlement Distance', color: 'bg-amber-400' },
  ];

  const handleRunAnalysis = () => {
    if (selectedState) {
      onStateSelect(selectedState);
    }
  };

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full z-20 shadow-2xl">
      <div className="p-6 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20">
            <Icons.Fire />
          </div>
          <h1 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">GISEngine</h1>
        </div>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Earth Engine GIS Analytics</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
        <section>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Region Selection</h2>
          <div className="space-y-3">
            <select 
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-widest focus:ring-1 focus:ring-orange-500 appearance-none cursor-pointer transition-all hover:bg-slate-700"
            >
              <option value="">Search Region...</option>
              {STATES_OF_INDIA.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            
            <button 
              onClick={handleRunAnalysis}
              disabled={!selectedState || isAnalyzing}
              className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-[11px] uppercase tracking-[0.2em] py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {isAnalyzing ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div> : <Icons.Satellite />}
              Run Analysis
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-800/50 grid grid-cols-2 gap-2">
            <button 
              onClick={onDownloadScript}
              className="flex flex-col items-center justify-center p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group"
            >
              <div className="text-blue-400 mb-1 group-hover:scale-110 transition-transform"><Icons.Upload /></div>
              <span className="text-[8px] font-black text-slate-500 uppercase">Script (.js)</span>
            </button>
            <button 
              onClick={onDownloadData}
              className="flex flex-col items-center justify-center p-3 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-all group"
            >
              <div className="text-emerald-400 mb-1 group-hover:scale-110 transition-transform"><Icons.Upload /></div>
              <span className="text-[8px] font-black text-slate-500 uppercase">Data (.json)</span>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">GIS Layer Manager</h2>
          <div className="space-y-1.5">
            {layerConfigs.map(layer => (
              <label key={layer.id} className="flex items-center gap-3 group cursor-pointer bg-slate-800/20 p-2.5 rounded-xl border border-transparent hover:border-slate-700 transition-all">
                <div className="relative flex items-center">
                  <input 
                    type="checkbox"
                    checked={layers[layer.id as keyof typeof layers]}
                    onChange={(e) => onToggleLayer(layer.id, e.target.checked)}
                    className="peer hidden" 
                  />
                  <div className="w-4 h-4 rounded border border-slate-700 bg-slate-900 peer-checked:bg-orange-600 peer-checked:border-orange-600 flex items-center justify-center transition-all">
                    <svg className="w-2.5 h-2.5 text-white opacity-0 peer-checked:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-200 transition-colors flex-1 uppercase tracking-tight">{layer.label}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${layer.color} shadow-[0_0_8px_rgba(0,0,0,0.3)]`}></div>
              </label>
            ))}
          </div>
        </section>
      </div>

      {isAnalyzing && (
        <div className="p-4 bg-orange-600/10 border-t border-orange-500/20">
          <div className="flex items-center gap-3 text-orange-400 animate-pulse">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-orange-500"></div>
            <span className="text-[10px] font-black uppercase tracking-widest leading-none">Scanning Data Cubes...</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
