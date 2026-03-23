import { useState } from "react";
import { TrendingUp, TrendingDown, Users, MousePointerClick, Target, DollarSign, Eye, BarChart3, ArrowUpRight, Calendar, ChevronDown } from "lucide-react";

// Logo real MARCHING — M 3D com textura de circuito
function MarchingLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mLeft" x1="0" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1a1a4e" />
          <stop offset="60%" stopColor="#2d1b8a" />
          <stop offset="100%" stopColor="#4B2DBD" />
        </linearGradient>
        <linearGradient id="mRight" x1="50" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4B2DBD" />
          <stop offset="50%" stopColor="#00A8A0" />
          <stop offset="100%" stopColor="#00D1C7" />
        </linearGradient>
        <linearGradient id="mCenter" x1="40" y1="0" x2="60" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6C3BFF" />
          <stop offset="100%" stopColor="#00D1C7" />
        </linearGradient>
        <filter id="logoGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="1" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {/* Perna esquerda do M */}
      <path d="M8 88 L8 18 L22 18 L22 78 L28 78 L28 88 Z" fill="url(#mLeft)" />
      {/* Diagonal esquerda descendo ao centro */}
      <path d="M22 18 L50 58 L42 68 L14 22 Z" fill="url(#mLeft)" opacity="0.9" />
      {/* Diagonal direita subindo do centro */}
      <path d="M50 58 L78 18 L86 22 L58 68 Z" fill="url(#mRight)" opacity="0.9" />
      {/* Perna direita do M */}
      <path d="M72 18 L92 18 L92 88 L72 88 L72 78 L82 78 L82 28 L72 28 Z" fill="url(#mRight)" />
      {/* Ponto central (topo do V interno) */}
      <path d="M42 68 L50 58 L58 68 L50 75 Z" fill="url(#mCenter)" filter="url(#softGlow)" />
      {/* Nós de circuito — lado esquerdo */}
      <circle cx="15" cy="45" r="2.5" fill="#00D1C7" opacity="0.8" filter="url(#softGlow)" />
      <circle cx="18" cy="62" r="1.8" fill="#6C3BFF" opacity="0.7" filter="url(#softGlow)" />
      <circle cx="24" cy="38" r="1.5" fill="#00D1C7" opacity="0.5" />
      {/* Linhas de circuito — lado esquerdo */}
      <line x1="15" y1="45" x2="22" y2="45" stroke="#00D1C7" strokeWidth="0.8" opacity="0.4" />
      <line x1="15" y1="45" x2="15" y2="52" stroke="#00D1C7" strokeWidth="0.8" opacity="0.3" />
      <line x1="18" y1="62" x2="24" y2="62" stroke="#6C3BFF" strokeWidth="0.7" opacity="0.35" />
      {/* Nós de circuito — lado direito */}
      <circle cx="79" cy="40" r="2.5" fill="#00D1C7" opacity="0.9" filter="url(#softGlow)" />
      <circle cx="84" cy="58" r="1.8" fill="#00D1C7" opacity="0.7" filter="url(#softGlow)" />
      <circle cx="76" cy="55" r="1.5" fill="#6C3BFF" opacity="0.5" />
      <circle cx="88" cy="45" r="1.2" fill="#00D1C7" opacity="0.6" />
      {/* Linhas de circuito — lado direito */}
      <line x1="79" y1="40" x2="84" y2="40" stroke="#00D1C7" strokeWidth="0.8" opacity="0.5" />
      <line x1="84" y1="40" x2="84" y2="48" stroke="#00D1C7" strokeWidth="0.8" opacity="0.4" />
      <line x1="79" y1="40" x2="79" y2="50" stroke="#00D1C7" strokeWidth="0.7" opacity="0.3" />
      <line x1="79" y1="50" x2="84" y2="58" stroke="#00D1C7" strokeWidth="0.7" opacity="0.35" />
      <line x1="88" y1="45" x2="84" y2="45" stroke="#00D1C7" strokeWidth="0.6" opacity="0.3" />
      {/* Partículas brilhantes */}
      <circle cx="35" cy="32" r="1.2" fill="white" opacity="0.4" filter="url(#softGlow)" />
      <circle cx="65" cy="28" r="1.0" fill="white" opacity="0.35" filter="url(#softGlow)" />
      <circle cx="20" cy="72" r="0.9" fill="#00D1C7" opacity="0.5" />
      <circle cx="80" cy="70" r="1.1" fill="#00D1C7" opacity="0.6" filter="url(#softGlow)" />
    </svg>
  );
}

// Sparkline
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

// Donut chart
function DonutChart({ value, color }: { value: number; color: string }) {
  const r = 28;
  const c = 2 * Math.PI * r;
  const progress = (value / 100) * c;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72">
      <circle cx="36" cy="36" r={r} fill="none" stroke="#1a2040" strokeWidth="7" />
      <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${progress} ${c}`} strokeLinecap="round" transform="rotate(-90 36 36)" />
      <text x="36" y="40" textAnchor="middle" fill="#E6EAF2" fontSize="13" fontWeight="700">{value}%</text>
    </svg>
  );
}

// Bar chart simples
function BarChartComp({ data, color }: { data: { label: string; value: number }[]; color: string }) {
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

// Gráfico de crescimento exponencial (SVG)
function GrowthChart() {
  const bars = [18, 28, 38, 52, 68, 88, 110, 145, 188, 240, 310, 400];
  const maxH = 400;
  const chartH = 130;
  const chartW = 400;

  // Pontos para linha exponencial
  const linePoints = bars.map((v, i) => {
    const x = 20 + (i / (bars.length - 1)) * (chartW - 40);
    const y = chartH - (v / maxH) * chartH;
    return `${x},${y}`;
  }).join(" ");

  // Área preenchida
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
      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map((f, i) => (
        <line key={i} x1="20" y1={chartH * (1 - f)} x2={chartW - 20} y2={chartH * (1 - f)}
          stroke="#1a2040" strokeWidth="1" strokeDasharray="4,4" />
      ))}
      {/* Barras */}
      {bars.map((v, i) => {
        const x = 20 + (i / (bars.length - 1)) * (chartW - 40);
        const bh = (v / maxH) * chartH;
        const bw = (chartW - 40) / bars.length * 0.55;
        return <rect key={i} x={x - bw / 2} y={chartH - bh} width={bw} height={bh} fill="url(#barGrad)" rx="2" />;
      })}
      {/* Área */}
      <polygon points={areaPoints} fill="url(#areaGrad)" />
      {/* Linha */}
      <polyline points={linePoints} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)" />
      {/* Seta final */}
      <circle cx={chartW - 20} cy={chartH - (bars[bars.length - 1] / maxH) * chartH}
        r="4" fill="#00D1C7" filter="url(#lineGlow)" />
      {/* Meses */}
      {["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((m, i) => {
        const x = 20 + (i / 11) * (chartW - 40);
        return <text key={i} x={x} y={chartH + 16} textAnchor="middle" fill="#5C6475" fontSize="9">{m}</text>;
      })}
    </svg>
  );
}

// KPI card
function MetricCard({ title, value, change, icon: Icon, color, sparkData, suffix = "" }:
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

const weeklyBarData = [
  { label: "Seg", value: 42 }, { label: "Ter", value: 58 }, { label: "Qua", value: 51 },
  { label: "Qui", value: 74 }, { label: "Sex", value: 69 }, { label: "Sáb", value: 45 }, { label: "Dom", value: 83 },
];

const channels = [
  { name: "Meta Ads", spend: "R$ 8.240", roas: "4.7x", leads: 312, color: "#6C3BFF" },
  { name: "Google Ads", spend: "R$ 5.180", roas: "3.9x", leads: 198, color: "#00D1C7" },
  { name: "TikTok Ads", spend: "R$ 2.100", roas: "2.8x", leads: 89, color: "#A78BFA" },
  { name: "LinkedIn", spend: "R$ 1.640", roas: "3.2x", leads: 54, color: "#38BDF8" },
];

const topCampaigns = [
  { name: "MARCHING — Captação IA", impressions: "284K", ctr: "4.2%", cpa: "R$ 28", status: "Ativo" },
  { name: "AUTOMATON — Leads B2B", impressions: "196K", ctr: "3.8%", cpa: "R$ 35", status: "Ativo" },
  { name: "MOTORS — Retargeting", impressions: "142K", ctr: "5.1%", cpa: "R$ 19", status: "Ativo" },
  { name: "Brand Awareness Q1", impressions: "88K", ctr: "2.9%", cpa: "R$ 52", status: "Pausado" },
];

export default function App() {
  const [_p] = useState("");

  return (
    <div className="min-h-screen bg-[#05070F] text-[#E6EAF2]" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Header */}
      <header className="border-b border-[#1a2040] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#05070F]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <MarchingLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#E6EAF2] text-base tracking-tight">MARCHING</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border text-[#00D1C7] border-[#00D1C7]/30 font-semibold tracking-wider">ANALYTICS</span>
            </div>
            <span className="text-[11px] text-[#5C6475]">Dashboard de Tráfego Pago</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 text-xs text-[#8A94A6] bg-[#0B0F1F] border border-[#1a2040] px-3 py-2 rounded-lg">
            <Calendar size={13} /> Mar 2026 <ChevronDown size={12} />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-2 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Dados ao vivo
          </div>
        </div>
      </header>

      <main className="px-6 py-6 max-w-7xl mx-auto space-y-6">

        {/* ── SEÇÃO HERO: Crescimento Exponencial ── */}
        <div className="rounded-2xl overflow-hidden border border-[#6C3BFF]/25 bg-[#0B0F1F] relative">
          {/* glow de fundo */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-32 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #6C3BFF 0%, transparent 70%)", filter: "blur(30px)" }} />
            <div className="absolute top-0 right-1/4 w-48 h-24 rounded-full opacity-12"
              style={{ background: "radial-gradient(circle, #00D1C7 0%, transparent 70%)", filter: "blur(25px)" }} />
          </div>

          <div className="relative z-10 p-6">
            {/* Título da seção */}
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #6C3BFF, #00D1C7)" }} />
              <span className="text-xs font-semibold text-[#8A94A6] tracking-widest uppercase">Crescimento Exponencial</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
              {/* KPIs grandes — estilo da imagem de referência */}
              <div className="lg:col-span-2 space-y-4">
                {/* ROI */}
                <div className="p-4 rounded-xl border border-[#6C3BFF]/20 bg-[#05070F]/80">
                  <div className="text-[10px] text-[#5C6475] font-semibold tracking-wider uppercase mb-1">ROI · Retorno sobre investimento</div>
                  <div className="text-4xl font-black tracking-tight" style={{ color: "#00D1C7", textShadow: "0 0 20px #00D1C780" }}>
                    +340%
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp size={11} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">vs mesmo período anterior</span>
                  </div>
                </div>
                {/* Grid 2 colunas */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-[#6C3BFF]/15 bg-[#05070F]/80">
                    <div className="text-[9px] text-[#5C6475] uppercase tracking-wider mb-1">Conversões</div>
                    <div className="text-2xl font-black" style={{ color: "#6C3BFF", textShadow: "0 0 15px #6C3BFF60" }}>+85%</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">↑ aceleração</div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#00D1C7]/15 bg-[#05070F]/80">
                    <div className="text-[9px] text-[#5C6475] uppercase tracking-wider mb-1">Leads Qualif.</div>
                    <div className="text-2xl font-black" style={{ color: "#00D1C7", textShadow: "0 0 15px #00D1C760" }}>10X</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">↑ vs baseline</div>
                  </div>
                </div>
                {/* Investimento vs Receita */}
                <div className="flex gap-2">
                  <div className="flex-1 p-3 rounded-xl border border-[#1a2040] bg-[#05070F]/60 text-center">
                    <div className="text-[9px] text-[#5C6475] uppercase">Investido</div>
                    <div className="text-sm font-bold text-[#E6EAF2] mt-0.5">R$ 17.160</div>
                  </div>
                  <div className="flex items-center text-[#6C3BFF]">
                    <ArrowUpRight size={16} />
                  </div>
                  <div className="flex-1 p-3 rounded-xl border border-[#00D1C7]/20 bg-[#00D1C7]/05 text-center">
                    <div className="text-[9px] text-[#5C6475] uppercase">Receita</div>
                    <div className="text-sm font-bold text-[#00D1C7] mt-0.5">R$ 72.800</div>
                  </div>
                </div>
              </div>

              {/* Gráfico exponencial */}
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#E6EAF2]">Crescimento Exponencial — Leads 2026</span>
                  <span className="text-[10px] text-[#5C6475]">Jan → Dez</span>
                </div>
                <GrowthChart />
                <div className="flex items-center justify-center gap-5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ background: "linear-gradient(to right, #6C3BFF, #00D1C7)" }} />
                    <span className="text-[10px] text-[#8A94A6]">Leads gerados</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-2 rounded-sm bg-[#6C3BFF]/40" />
                    <span className="text-[10px] text-[#8A94A6]">Volume por mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Impressões" value="712K" change={18} icon={Eye} color="#6C3BFF"
            sparkData={[30, 45, 38, 60, 52, 70, 65, 80, 72, 85, 78, 95]} />
          <MetricCard title="Cliques" value="28.4K" change={24} icon={MousePointerClick} color="#00D1C7"
            sparkData={[20, 30, 28, 45, 40, 55, 50, 62, 58, 72, 68, 80]} />
          <MetricCard title="Leads Gerados" value="653" change={23} icon={Users} color="#A78BFA"
            sparkData={[15, 22, 20, 35, 30, 42, 38, 50, 45, 58, 55, 65]} />
          <MetricCard title="CPA Médio" value="R$ 26" change={-8} icon={Target} color="#00D1C7"
            sparkData={[40, 38, 35, 32, 34, 30, 28, 29, 27, 26, 25, 26]} />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-[#E6EAF2]">Cliques por dia — semana atual</h3>
                <p className="text-xs text-[#5C6475] mt-0.5">Todos os canais combinados</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <TrendingUp size={13} /> +24% vs semana anterior
              </div>
            </div>
            <BarChartComp data={weeklyBarData} color="#00D1C7" />
          </div>
          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F]">
            <h3 className="text-sm font-semibold text-[#E6EAF2] mb-1">Taxa de Conversão</h3>
            <p className="text-xs text-[#5C6475] mb-4">Cliques → Leads</p>
            <div className="flex flex-col items-center gap-4">
              <DonutChart value={68} color="#6C3BFF" />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8A94A6] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6C3BFF] inline-block" />Convertidos
                  </span>
                  <span className="text-[#E6EAF2] font-semibold">68%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8A94A6] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1a2040] border border-[#5C6475] inline-block" />Não convertidos
                  </span>
                  <span className="text-[#E6EAF2] font-semibold">32%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Channels + Campaigns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#E6EAF2]">Performance por Canal</h3>
                <p className="text-xs text-[#5C6475] mt-0.5">ROAS e leads gerados</p>
              </div>
              <BarChart3 size={16} className="text-[#5C6475]" />
            </div>
            <div className="space-y-3">
              {channels.map((ch, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#05070F] border border-[#1a2040]">
                  <div className="w-2 h-8 rounded-full flex-shrink-0" style={{ background: ch.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-[#E6EAF2]">{ch.name}</span>
                      <span className="text-xs font-bold" style={{ color: ch.color }}>{ch.roas}</span>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <span className="text-[10px] text-[#5C6475]">{ch.spend} investidos</span>
                      <span className="text-[10px] text-[#8A94A6]">{ch.leads} leads</span>
                    </div>
                    <div className="mt-1.5 h-1 bg-[#1a2040] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${(ch.leads / 312) * 100}%`, background: ch.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#E6EAF2]">Top Campanhas</h3>
                <p className="text-xs text-[#5C6475] mt-0.5">Março 2026</p>
              </div>
              <DollarSign size={16} className="text-[#5C6475]" />
            </div>
            <div className="space-y-2">
              {topCampaigns.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#05070F] border border-[#1a2040]">
                  <div className="text-[10px] font-bold text-[#5C6475] w-4 flex-shrink-0 text-center">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#E6EAF2] truncate">{c.name}</div>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-[10px] text-[#5C6475]">{c.impressions} impr.</span>
                      <span className="text-[10px] text-[#00D1C7]">CTR {c.ctr}</span>
                      <span className="text-[10px] text-[#8A94A6]">CPA {c.cpa}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${c.status === "Ativo" ? "bg-emerald-400/10 text-emerald-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#6C3BFF]/12 border border-[#6C3BFF]/20">
              <TrendingUp size={20} className="text-[#6C3BFF]" />
            </div>
            <div>
              <div className="text-xs text-[#5C6475]">CTR Médio</div>
              <div className="text-xl font-bold text-[#E6EAF2]">3.99%</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><ArrowUpRight size={10} /> +0.7pp vs mês ant.</div>
            </div>
          </div>
          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#00D1C7]/12 border border-[#00D1C7]/20">
              <DollarSign size={20} className="text-[#00D1C7]" />
            </div>
            <div>
              <div className="text-xs text-[#5C6475]">ROAS Consolidado</div>
              <div className="text-xl font-bold text-[#E6EAF2]">4.24x</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><ArrowUpRight size={10} /> Benchmark: 3x</div>
            </div>
          </div>
          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#A78BFA]/12 border border-[#A78BFA]/20">
              <Target size={20} className="text-[#A78BFA]" />
            </div>
            <div>
              <div className="text-xs text-[#5C6475]">Qualidade dos Leads</div>
              <div className="text-xl font-bold text-[#E6EAF2]">87 / 100</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><ArrowUpRight size={10} /> Score IA MARCHING</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 pb-4 border-t border-[#1a2040]">
          <div className="flex items-center gap-2 opacity-50">
            <MarchingLogo size={28} />
            <span className="text-xs text-[#5C6475]">MARCHING Analytics · marching.com.br</span>
          </div>
          <span className="text-[10px] text-[#5C6475]">Atualizado em 20/03/2026 às 14:32 · Dados de todas as plataformas</span>
        </div>
      </main>
    </div>
  );
}
