import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { time: "06:00", score: 20 },
  { time: "07:00", score: 45 },
  { time: "08:00", score: 85 },
  { time: "09:00", score: 70 },
  { time: "10:00", score: 40 },
  { time: "11:00", score: 35 },
  { time: "12:00", score: 38 },
];

export const ChaosPulse = () => {
  return (
    <div className="w-full h-32 glass rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Nairobi Grid Pulse</h3>
        <span className="text-[10px] font-mono text-emerald-500">Live</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            hide 
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px', fontSize: '10px' }}
            itemStyle={{ color: '#f4f4f5' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#f4f4f5" 
            strokeWidth={2} 
            dot={false} 
            animationDuration={2000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
