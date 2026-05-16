import { motion } from "motion/react";
import { Info, AlertTriangle, ChevronRight } from "lucide-react";
import { PredictionData } from "../types";

interface ResultCardProps {
  data: PredictionData;
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
}

export const ResultCard = ({ data, selectedRouteId, onSelectRoute }: ResultCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8"
    >
      {/* Verdict Section */}
      <div className="p-6 rounded-2xl glass border-l-4 border-l-zinc-100 bg-zinc-900/40">
        <h3 className="text-zinc-400 text-[10px] font-mono tracking-[0.2em] uppercase mb-3 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-100" />
          Tactical Analysis
        </h3>
        <p className="text-2xl font-display font-medium leading-snug tracking-tight text-white italic">
          "{data.streetVoice}"
        </p>
      </div>

      {/* Recommended Routes List */}
      <div className="space-y-4">
         <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] ml-1">Detected Extraction Paths</h3>
         <div className="space-y-3">
            {data.routes.map((route) => (
              <button
                key={route.id}
                onClick={() => onSelectRoute(route.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                  selectedRouteId === route.id 
                    ? 'bg-zinc-100 border-zinc-100 text-zinc-950 scale-[1.02] shadow-xl' 
                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                }`}
              >
                {route.isRecommended && (
                  <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-mono font-bold uppercase ${
                    selectedRouteId === route.id ? 'bg-zinc-950 text-white' : 'bg-emerald-500 text-zinc-950'
                  }`}>
                    AI Choice
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${
                      selectedRouteId === route.id ? 'text-zinc-950' : 'text-zinc-200'
                    }`}>
                      {route.summary}
                      {route.trafficSeverity === 'Extreme' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                    </div>
                    <div className="text-[10px] font-mono mt-0.5 opacity-60">
                      {route.distance} • {route.duration}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono opacity-80 uppercase">Chaos</div>
                    <div className="text-lg font-display font-bold">{route.chaosScore}%</div>
                  </div>
                </div>

                <p className={`text-[11px] leading-relaxed font-medium italic ${
                  selectedRouteId === route.id ? 'text-zinc-800' : 'text-zinc-500'
                }`}>
                  "{route.recommendationReason}"
                </p>

                {selectedRouteId !== route.id && (
                  <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </button>
            ))}
         </div>
      </div>

      {/* Intelligence Feed */}
      <div className="space-y-4 pt-4 border-t border-zinc-900">
        <h3 className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] ml-1">Signal Intel</h3>
        <div className="space-y-2">
          {data.localIntel.map((intel, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50 relative overflow-hidden"
            >
              <div className="w-1 h-full bg-zinc-800 absolute left-0 top-0" />
              <Info className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">{intel}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
