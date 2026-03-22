export default function GrowthChart() {
  const bars = [18, 28, 38, 52, 68, 88, 110, 145, 188, 240, 310, 400];
  const maxH = 400;
  const chartH = 130;
  const chartW = 400;

  const linePoints = bars.map((v, i) => {
    const x = 20 + (i / (bars.length - 1)) * (chartW - 40);
    const y = chartH - (v / maxH) * chartH;
    return `${x},${y}`;
  }).join(" ");

  const areaPoints = `20,${chartH} ` + bars.map((v, i) => {
    const x = 20 + (i / (bars.length - 1)) * (chartW - 40);
    const y = chartH - (v / maxH) * chartH;
    return `${x},${y}`;
  }).join(" ") + ` ${chartW - 20},${chartH}`;

  return (
    <svg width="100%" viewBox={`0 0 ${chartW} ${chartH + 20}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C3BFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#00D1C7" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="lineGrad" x1="0" y1="0" x2={chartW} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6C3BFF" />
          <stop offset="100%" stopColor="#00D1C7" />
        </linearGradient>
        <filter id="lineGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6C3BFF" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#00D1C7" stopOpacity="0.15" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1="20" y1={chartH * (1 - f)} x2={chartW - 20} y2={chartH * (1 - f)}
          stroke="#1a2040" strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {bars.map((v, i) => {
        const x = 20 + (i / (bars.length - 1)) * (chartW - 40);
        const bh = (v / maxH) * chartH;
        const bw = (chartW - 40) / bars.length * 0.55;
        return <rect key={i} x={x - bw / 2} y={chartH - bh} width={bw} height={bh} fill="url(#barGrad)" rx="2" />;
      })}
      <polygon points={areaPoints} fill="url(#areaGrad)" />
      <polyline points={linePoints} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)" />
      <circle cx={chartW - 20} cy={chartH - (bars[bars.length - 1] / maxH) * chartH}
        r="4" fill="#00D1C7" filter="url(#lineGlow)" />
      {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, i) => {
        const x = 20 + (i / 11) * (chartW - 40);
        return <text key={i} x={x} y={chartH + 16} textAnchor="middle" fill="#5C6475" fontSize="9">{m}</text>;
      })}
    </svg>
  );
}
