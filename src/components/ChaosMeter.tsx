import { motion } from "motion/react";
import { AlertCircle, Zap, Shield, Siren } from "lucide-react";

interface ChaosMeterProps {
  score: number; // 0 to 100
}

export const ChaosMeter = ({ score }: ChaosMeterProps) => {
  const getStatus = (s: number) => {
    if (s < 30) return { label: "SAFE", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: Shield };
    if (s < 60) return { label: "CAUTION", color: "text-amber-400", bg: "bg-amber-500/20", icon: AlertCircle };
    if (s < 85) return { label: "CHAOTIC", color: "text-orange-500", bg: "bg-orange-500/20", icon: Siren };
    return { label: "CRITICAL", color: "text-red-500", bg: "bg-red-500/20", icon: Zap };
  };

  const status = getStatus(score);
  const Icon = status.icon;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 glass rounded-2xl overflow-hidden min-h-[240px]">
      <div className="absolute top-0 right-0 p-2">
        <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase ${status.bg} ${status.color} border border-current opacity-50`}>
          Live Signal
        </div>
      </div>
      
      <div className="relative w-48 h-48">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-800"
          />
          <motion.circle
            cx="96"
            cy="96"
            r="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={502.4}
            initial={{ strokeDashoffset: 502.4 }}
            animate={{ strokeDashoffset: 502.4 - (502.4 * score) / 100 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={status.color}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`text-5xl font-display font-bold ${status.color}`}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">Chaos Score</span>
        </div>
      </div>

      <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-full ${status.bg} border border-${status.color}/20`}>
        <Icon className={`w-4 h-4 ${status.color}`} />
        <span className={`text-sm font-bold tracking-tight ${status.color}`}>{status.label}</span>
      </div>
    </div>
  );
};
