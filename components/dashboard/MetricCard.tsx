import { TrendingUp, TrendingDown } from "lucide-react";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 32;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MetricCard({ title, value, change, icon: Icon, color, sparkData, suffix = "" }:
  { title: string; value: string; change: number; icon: React.ElementType; color: string; sparkData: number[]; suffix?: string }) {
  const isPositive = change >= 0;
  return (
    <div className="relative overflow-hidden rounded-xl p-5 border bg-[#0B0F1F]" style={{ borderColor: `${color}22` }}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg" style={{ background: `${color}18` }}>
            <Icon size={16} style={{ color }} />
          </div>
          <span className="text-[#8A94A6] text-xs font-medium tracking-wide">{title}</span>
        </div>
        <Sparkline data={sparkData} color={color} />
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-[#E6EAF2] tracking-tight">{value}</span>
          {suffix && <span className="text-sm text-[#8A94A6] ml-1">{suffix}</span>}
        </div>
        <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isPositive ? "+" : ""}{change}%
        </div>
      </div>
    </div>
  );
}
