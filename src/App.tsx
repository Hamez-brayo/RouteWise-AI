import { useState, useEffect } from "react";
import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radar, 
  Map as MapIcon, 
  Activity, 
  AlertTriangle, 
  Settings, 
  CloudRain, 
  Zap, 
  Wifi,
  Menu,
  ChevronLeft
} from "lucide-react";
import { ChaosMeter } from "./components/ChaosMeter";
import { SearchForm } from "./components/SearchForm";
import { ResultCard } from "./components/ResultCard";

import { ChaosPulse } from "./components/ChaosPulse";
import { subscribeToReports, IncidentReport, ensureAuth } from "./lib/firebase";
import { ReportIncident } from "./components/ReportIncident";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { RouteRenderer } from "./components/RouteRenderer";
import { PredictionData } from "./types";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
const MAP_ID = process.env.GOOGLE_MAPS_MAP_ID || "";

const NAINROBI_CENTER = { lat: -1.2921, lng: 36.8219 };

export default function App() {
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [reports, setReports] = useState<IncidentReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'professional' | 'street'>('street');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    const init = async () => {
      try {
        await ensureAuth();
        unsubscribe = subscribeToReports((data) => {
          setReports(data);
        });
      } catch (error) {
        console.error("Firebase init failed:", error);
      }
    };

    init();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const triggerPrediction = async (origin: string, destination: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination, mode, reports }),
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Tactical extraction data currently unavailable.");
      }

      setPrediction(data);
      
      // Auto-select recommended route
      const recommended = data.routes.find((r: any) => r.isRecommended) || data.routes[0];
      if (recommended) {
        setSelectedRouteId(recommended.id);
      }
    } catch (err: any) {
      console.error("Prediction failed:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden font-sans bg-zinc-950 text-zinc-100">
      {/* Sidebar - Control Center */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 420 : 0 }}
        className="glass border-r border-zinc-800 z-20 flex flex-col h-full overflow-hidden relative shadow-2xl"
      >
        <div className="p-6 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Radar className="w-6 h-6 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight">RouteWise <span className="text-zinc-500">AI</span></h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Nairobi Grid Active</span>
              </div>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-zinc-950">
          <button 
            onClick={() => setIsReportModalOpen(true)}
            className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            REPORT INCIDENT
          </button>
          
          <ChaosPulse />
          <SearchForm 
            onPredict={triggerPrediction} 
            isLoading={isLoading} 
            mode={mode} 
            setMode={setMode} 
          />

          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
            >
              <div className="flex items-center gap-2 text-red-500 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs uppercase tracking-wider">System Breach</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                {error.includes("DIRECTIONS_API_NOT_ENABLED") 
                  ? "Directions API Access Denied. You must enable 'Directions API' in your Google Cloud Console." 
                  : error}
              </p>
              {error.includes("DIRECTIONS_API_NOT_ENABLED") && (
                <a 
                  href="https://console.cloud.google.com/google/maps-apis/api-list" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-block mt-2 text-[10px] text-zinc-100 hover:underline font-mono"
                >
                  [ CLOUD CONSOLE ]
                </a>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {prediction ? (
              <div className="space-y-8 pb-10">
                <ChaosMeter score={prediction.chaosScore} />
                <ResultCard 
                  data={prediction} 
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={setSelectedRouteId}
                />
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="p-4 rounded-full bg-zinc-900 border border-zinc-800">
                  <Activity className="w-8 h-8 text-zinc-700" />
                </div>
                <div>
                  <h3 className="text-zinc-300 font-display font-medium">Ready for input</h3>
                  <p className="text-zinc-500 text-sm max-w-[200px] mx-auto mt-1">Enter your route to get real-time survival intel from the Nairobi grid.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-4 border-t border-zinc-900 bg-zinc-950/50 flex items-center justify-between">
          <div className="flex gap-4">
            <Settings className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors" />
            <AlertTriangle className="w-4 h-4 text-zinc-600 hover:text-zinc-400 cursor-pointer transition-colors" />
          </div>
          <p className="text-[10px] text-zinc-700 font-mono font-bold tracking-widest">v2.0.0-PRO</p>
        </div>
      </motion.aside>

      {/* Main Content - Map & Signals */}
      <main className="flex-1 relative bg-zinc-950">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-6 left-6 z-30 p-4 bg-zinc-100 text-zinc-950 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-bold"
          >
            <Menu className="w-6 h-6" />
            <span>OPEN COMMS</span>
          </button>
        )}

        <div className="absolute inset-0 z-0">
          {API_KEY ? (
            <APIProvider apiKey={API_KEY} version="weekly" libraries={['geometry', 'maps', 'marker']}>
              <Map
                defaultCenter={NAINROBI_CENTER}
                defaultZoom={13}
                mapId={MAP_ID}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                disableDefaultUI={true}
                gestureHandling="greedy"
              >
                <RouteRenderer 
                  routes={prediction?.routes || []} 
                  selectedRouteId={selectedRouteId}
                  onRouteClick={setSelectedRouteId}
                />

                {reports.map((report) => (
                  <AdvancedMarker
                    key={report.id}
                    position={{ lat: report.latitude, lng: report.longitude }}
                  >
                    <div className="group relative cursor-help">
                       <div className="w-4 h-4 animate-pulse bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] border-2 border-white" />
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 uppercase font-bold tracking-tighter">
                          {report.type}: {report.description}
                       </div>
                    </div>
                  </AdvancedMarker>
                ))}
              </Map>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-900/50">
               <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-3xl max-w-sm">
                  <MapIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                  <h2 className="text-zinc-300 font-display font-bold">Grid Viz Offline</h2>
                  <p className="text-zinc-500 text-sm mt-1">Maps key not detected. Intel remains tactical only.</p>
               </div>
            </div>
          )}
        </div>

        {/* Floating Signals Over Map */}
        <div className="absolute top-6 right-6 z-10 w-80 space-y-3">
          <div className="p-4 glass rounded-2xl border-l-2 border-l-blue-500 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Sky Watch</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Live</span>
            </div>
            <p className="text-xs text-zinc-300 leading-snug font-sans font-medium">Dark clouds forming over Ngong Hills. High flood risk at South C expected in 45 min.</p>
          </div>

          <div className="p-4 glass rounded-2xl border-l-2 border-l-red-500 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Alert</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">5m ago</span>
            </div>
            <p className="text-xs text-zinc-300 leading-snug font-sans font-medium">Unconfirmed social reports of gridlock on Mombasa Rd due to transit truck breakdown near Hilton Garden Inn.</p>
          </div>

          <div className="p-4 glass rounded-2xl border-l-2 border-l-amber-500 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-amber-500" />
                <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Network</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Active</span>
            </div>
            <p className="text-xs text-zinc-300 leading-snug font-sans font-medium">Network instability reported in Kasarani area. Digital payments may fail during peak commute.</p>
          </div>
        </div>

        {/* Scan Lines Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      </main>

      <ReportIncident 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}
