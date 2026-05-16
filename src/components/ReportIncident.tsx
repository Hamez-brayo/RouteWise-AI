import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, AlertTriangle, Car, Construction, Users, Octagon, Send } from "lucide-react";
import { submitReport } from "../lib/firebase";

interface ReportIncidentProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { id: "accident", label: "Accident", icon: Octagon },
  { id: "broken-down vehicle", label: "Breakdown", icon: Car },
  { id: "pothole", label: "Pothole", icon: Construction },
  { id: "illegal parking", label: "Obstruction", icon: AlertTriangle },
  { id: "protest gathering", label: "Protest", icon: Users },
  { id: "other", label: "Other", icon: AlertTriangle },
];

export const ReportIncident = ({ isOpen, onClose }: ReportIncidentProps) => {
  const [type, setType] = useState<any>("accident");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // For MVP, we'll use a random location around Nairobi or center for now
      // ideally we'd get user location or click on map
      const latitude = -1.2921 + (Math.random() - 0.5) * 0.05;
      const longitude = 36.8219 + (Math.random() - 0.5) * 0.05;

      await submitReport({
        type,
        description,
        latitude,
        longitude
      });
      onClose();
      setDescription("");
    } catch (error) {
      console.error("Submit failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass p-6 rounded-3xl overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold">Report Incident</h2>
              <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-3 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setType(cat.id)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                        type === cat.id 
                          ? "bg-zinc-100 border-zinc-100 text-zinc-950" 
                          : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">{cat.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-zinc-500 uppercase tracking-widest ml-1">Details</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what's happening (e.g., Gridlock on Thika Rd)"
                  className="w-full h-24 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all font-sans resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !description}
                className="w-full py-4 bg-zinc-100 text-zinc-950 rounded-xl font-display font-bold flex items-center justify-center gap-2 hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "TRANSMITTING..." : "SUBMIT INTEL"}
                {!isSubmitting && <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
