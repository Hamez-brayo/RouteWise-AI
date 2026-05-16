import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, MapPin, ChevronRight, TrendingUp } from "lucide-react";

interface SearchFormProps {
  onPredict: (origin: string, destination: string) => void;
  isLoading: boolean;
  mode: 'professional' | 'street';
  setMode: (m: 'professional' | 'street') => void;
}

export const SearchForm = ({ onPredict, isLoading, mode, setMode }: SearchFormProps) => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    onPredict(origin, destination);
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold">Route Intel</h2>
        <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
          <button
            onClick={() => setMode('professional')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mode === 'professional' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            PRO
          </button>
          <button
            onClick={() => setMode('street')}
            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${mode === 'street' ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            STREET
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-4 w-4 text-zinc-500 group-focus-within:text-zinc-300" />
            </div>
            <input
              type="text"
              placeholder="Origin (e.g., Westlands)"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-sans"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-zinc-300" />
            </div>
            <input
              type="text"
              placeholder="Destination (e.g., CBD Town)"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-sans"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || !origin || !destination}
          className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-xl font-display font-bold flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <TrendingUp className="w-5 h-5" />
            </motion.div>
          ) : (
            <>
              GET INTEL
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
