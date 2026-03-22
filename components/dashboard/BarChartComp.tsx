export default function BarChartComp({ data, color }: { data: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div className="flex items-end gap-1.5 h-24">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div className="w-full rounded-sm" style={{ height: `${(d.value / max) * 80}px`, background: i === data.length - 1 ? color : `${color}55`, minHeight: 4 }} />
          <span className="text-[9px] text-[#5C6475] font-medium">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
