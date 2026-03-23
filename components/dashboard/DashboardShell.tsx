"use client";

import { TrendingUp, Users, MousePointerClick, Target, DollarSign, Eye, BarChart3, ArrowUpRight, Calendar, ChevronDown } from "lucide-react";
import MarchingLogo from "./MarchingLogo";
import MetricCard from "./MetricCard";
import GrowthChart from "./GrowthChart";
import BarChartComp from "./BarChartComp";
import DonutChart from "./DonutChart";

export interface DashboardData {
  clientName: string
  lastUpdated: string
  metrics: {
    impressoes: string
    cliques: string
    leads: string
    cpa: string
    impressoesChange: number
    cliquesChange: number
    leadsChange: number
    cpaChange: number
  }
  ctr: number
  roas: string
  leadQuality: string
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

export default function DashboardShell({ data }: { data: DashboardData }) {
  return (
    <div className="min-h-screen bg-[#05070F] text-[#E6EAF2]" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header className="border-b border-[#1a2040] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#05070F]/90 backdrop-blur-sm z-10">
        <div className="flex items-center gap-3">
          <MarchingLogo size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#E6EAF2] text-base tracking-tight">{data.clientName}</span>
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
        {/* HERO: Crescimento Exponencial */}
        <div className="rounded-2xl overflow-hidden border border-[#6C3BFF]/25 bg-[#0B0F1F] relative">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-1/4 w-64 h-32 rounded-full opacity-15"
              style={{ background: "radial-gradient(circle, #6C3BFF 0%, transparent 70%)", filter: "blur(30px)" }} />
            <div className="absolute top-0 right-1/4 w-48 h-24 rounded-full opacity-12"
              style={{ background: "radial-gradient(circle, #00D1C7 0%, transparent 70%)", filter: "blur(25px)" }} />
          </div>
          <div className="relative z-10 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #6C3BFF, #00D1C7)" }} />
              <span className="text-xs font-semibold text-[#8A94A6] tracking-widest uppercase">Crescimento Exponencial</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div className="p-4 rounded-xl border border-[#6C3BFF]/20 bg-[#05070F]/80">
                  <div className="text-[10px] text-[#5C6475] font-semibold tracking-wider uppercase mb-1">ROI · Retorno sobre investimento</div>
                  <div className="text-4xl font-black tracking-tight" style={{ color: "#00D1C7", textShadow: "0 0 20px #00D1C780" }}>+340%</div>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp size={11} className="text-emerald-400" />
                    <span className="text-[10px] text-emerald-400">vs mesmo período anterior</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-[#6C3BFF]/15 bg-[#05070F]/80">
                    <div className="text-[9px] text-[#5C6475] uppercase tracking-wider mb-1">Conversões</div>
                    <div className="text-2xl font-black" style={{ color: "#6C3BFF", textShadow: "0 0 15px #6C3BFF60" }}>+85%</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">↑ aceleração</div>
                  </div>
                  <div className="p-3 rounded-xl border border-[#00D1C7]/15 bg-[#05070F]/80">
                    <div className="text-[9px] text-[#5C6475] uppercase tracking-wider mb-1">Resultados</div>
                    <div className="text-2xl font-black" style={{ color: "#00D1C7", textShadow: "0 0 15px #00D1C760" }}>10X</div>
                    <div className="text-[9px] text-emerald-400 mt-0.5">↑ vs baseline</div>
                  </div>
                </div>
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
              <div className="lg:col-span-3">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-[#E6EAF2]">Crescimento Exponencial — Resultados 2026</span>
                  <span className="text-[10px] text-[#5C6475]">Jan → Dez</span>
                </div>
                <GrowthChart />
                <div className="flex items-center justify-center gap-5 mt-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 rounded" style={{ background: "linear-gradient(to right, #6C3BFF, #00D1C7)" }} />
                    <span className="text-[10px] text-[#8A94A6]">Resultados</span>
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
          <MetricCard title="Impressões" value={data.metrics.impressoes} change={data.metrics.impressoesChange} icon={Eye} color="#6C3BFF"
            sparkData={[30, 45, 38, 60, 52, 70, 65, 80, 72, 85, 78, 95]} />
          <MetricCard title="Cliques" value={data.metrics.cliques} change={data.metrics.cliquesChange} icon={MousePointerClick} color="#00D1C7"
            sparkData={[20, 30, 28, 45, 40, 55, 50, 62, 58, 72, 68, 80]} />
          <MetricCard title="Resultados" value={data.metrics.leads} change={data.metrics.leadsChange} icon={Users} color="#A78BFA"
            sparkData={[15, 22, 20, 35, 30, 42, 38, 50, 45, 58, 55, 65]} />
          <MetricCard title="Custo por Resultado" value={data.metrics.cpa} change={data.metrics.cpaChange} icon={Target} color="#00D1C7"
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
            <p className="text-xs text-[#5C6475] mb-4">Cliques → Resultados</p>
            <div className="flex flex-col items-center gap-4">
              <DonutChart value={data.ctr} color="#6C3BFF" />
              <div className="w-full space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8A94A6] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#6C3BFF] inline-block" />Convertidos
                  </span>
                  <span className="text-[#E6EAF2] font-semibold">{data.ctr}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8A94A6] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1a2040] border border-[#5C6475] inline-block" />Não convertidos
                  </span>
                  <span className="text-[#E6EAF2] font-semibold">{100 - data.ctr}%</span>
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
                <p className="text-xs text-[#5C6475] mt-0.5">ROAS e resultados gerados</p>
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
                      <span className="text-[10px] text-[#8A94A6]">{ch.leads} resultados</span>
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
              <div className="text-xl font-bold text-[#E6EAF2]">{data.roas}</div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-0.5 mt-0.5"><ArrowUpRight size={10} /> Benchmark: 3x</div>
            </div>
          </div>
          <div className="rounded-xl p-5 border border-[#1a2040] bg-[#0B0F1F] flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#A78BFA]/12 border border-[#A78BFA]/20">
              <Target size={20} className="text-[#A78BFA]" />
            </div>
            <div>
              <div className="text-xs text-[#5C6475]">Qualidade dos Resultados</div>
              <div className="text-xl font-bold text-[#E6EAF2]">{data.leadQuality}</div>
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
          <span className="text-[10px] text-[#5C6475]">Atualizado em {data.lastUpdated} · Dados de todas as plataformas</span>
        </div>
      </main>
    </div>
  );
}
