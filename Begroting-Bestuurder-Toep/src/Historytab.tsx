import React from 'react';
import { CalendarRange, RefreshCw, Trash2, Flame } from 'lucide-react';
import { PeriodHistoryRecord } from '../types';

interface HistoryTabProps {
  periodHistory: Record<string, PeriodHistoryRecord>;
  onLoadPeriod: (key: string) => void;
  onDeletePeriod: (key: string) => void;
}

export default function HistoryTab({ periodHistory, onLoadPeriod, onDeletePeriod }: HistoryTabProps) {
  const formatRand = (v: number) => `R ${Number(v).toFixed(2)}`;

  const getDaysBetween = (s: string, e: string) => {
    const diff = Math.round((new Date(e).getTime() - new Date(s).getTime()) / (864e5)) + 1;
    return diff > 0 ? diff : 0;
  };

  const getPeriodStatus = (startStr: string, endStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today < new Date(startStr)) return 'future';
    if (today > new Date(endStr)) return 'past';
    return 'active';
  };

  const keys = Object.keys(periodHistory).sort((a, b) =>
    periodHistory[b].start.localeCompare(periodHistory[a].start)
  );

  return (
    <div className="bg-[#FFFBFE] rounded-[28px] border border-[#E7E0EC] overflow-hidden shadow-sm" id="panel-history">
      {/* Header */}
      <div className="bg-[#E8DEF8] px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-[#6750A4]/20 rounded-2xl">
          <CalendarRange className="w-4 h-4 text-[#6750A4]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-[#21005D]">Tydperk Geskiedenis</h2>
          <p className="text-[11px] text-[#625B71] mt-0.5">
            Bestuur en hersien al jou gestoorde begrotingstydperke.
          </p>
        </div>
      </div>

      <div className="p-6">
        {keys.length === 0 ? (
          <div className="text-center py-20 text-[#79747E] italic text-sm bg-[#F4EEFF] border border-dashed border-[#CAC4D0] rounded-[20px]" id="history-empty">
            Nog geen gestoorde tydperke nie. Stoor jou huidige tydperk hierbo om te begin!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="history-list">
            {keys.map((key) => {
              const rec = periodHistory[key];
              if (!rec) return null;

              const ti = rec.incomes?.reduce((s, i) => s + i.amount, 0) || 0;
              const te = rec.expenses?.reduce((s, i) => s + i.amount, 0) || 0;
              const ta = rec.anderExpenses?.reduce((s, i) => s + i.amount, 0) || 0;
              const tot = te + ta;
              const bal = ti - tot;

              const days = getDaysBetween(rec.start, rec.end);
              const pct = ti > 0 ? Math.min(100, (tot / ti) * 100) : 0;
              const sav = ti > 0 ? Math.max(0, (bal / ti) * 100) : 0;

              const allHistoryExpenses = [
                ...(rec.expenses || []).map(i => ({ name: i.name, amount: i.amount })),
                ...(rec.anderExpenses || []).map(i => ({ name: i.name, amount: i.amount }))
              ].sort((a, b) => b.amount - a.amount).slice(0, 3);

              const st = getPeriodStatus(rec.start, rec.end);

              return (
                <div
                  key={key}
                  className={`bg-[#FFFBFE] border rounded-[24px] overflow-hidden hover:shadow-lg transition duration-200 ${
                    bal >= 0 ? 'border-[#C3EFAD]' : 'border-[#F9DEDC]'
                  }`}
                >
                  {/* Card accent strip */}
                  <div className={`h-1.5 w-full ${bal >= 0 ? 'bg-[#386A20]' : 'bg-[#B3261E]'}`} />

                  <div className="p-4 flex flex-col gap-3">
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-[#1C1B1F] flex flex-wrap items-center gap-1.5">
                          📅 {rec.label}
                          {st === 'active' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C3EFAD] text-[#0A3818]">● Aktief</span>
                          )}
                          {st === 'future' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#C2E7FF] text-[#001D35]">⏳ Toekomstig</span>
                          )}
                          {st === 'past' && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E7E0EC] text-[#49454F]">✔ Verby</span>
                          )}
                        </h3>
                        <p className="text-[10px] text-[#79747E] mt-0.5 font-mono">
                          {days} dae {rec.savedAt && `• ${rec.savedAt}`}
                        </p>
                      </div>
                      <div className={`text-sm font-bold font-mono px-3 py-1.5 rounded-full border ${
                        bal >= 0
                          ? 'bg-[#C3EFAD] text-[#0A3818] border-[#A8D5A2]'
                          : 'bg-[#F9DEDC] text-[#410E0B] border-[#F2B8B5]'
                      }`}>
                        {formatRand(bal)}
                      </div>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Inkomste', val: formatRand(ti), color: 'text-[#386A20]', bg: 'bg-[#C3EFAD]' },
                        { label: 'Uitgawes', val: formatRand(te), color: 'text-[#B3261E]', bg: 'bg-[#F9DEDC]' },
                        { label: 'Ander', val: formatRand(ta), color: 'text-[#6750A4]', bg: 'bg-[#EADDFF]' },
                      ].map((stat) => (
                        <div key={stat.label} className={`${stat.bg} p-2.5 rounded-2xl text-center`}>
                          <span className="text-[9px] font-bold tracking-wider text-[#49454F] uppercase block">{stat.label}</span>
                          <span className={`text-xs font-bold font-mono ${stat.color} block mt-0.5`}>{stat.val}</span>
                        </div>
                      ))}
                    </div>

                    {/* Secondary stats */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#F4EEFF] border border-[#E7E0EC] p-2.5 rounded-2xl text-center">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#625B71] block">Spaarkoers</span>
                        <span className="text-xs font-bold text-[#21005D] font-mono">{sav.toFixed(1)}%</span>
                      </div>
                      <div className="bg-[#F4EEFF] border border-[#E7E0EC] p-2.5 rounded-2xl">
                        <div className="flex justify-between items-center text-[9px] font-bold text-[#625B71] uppercase mb-1">
                          <span>Uitgawe %</span>
                          <span className="font-bold text-[#49454F] font-mono">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#E7E0EC] rounded-full overflow-hidden">
                          <div className="h-full bg-[#6750A4] rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Top expenses */}
                    {allHistoryExpenses.length > 0 && (
                      <div className="bg-[#F4EEFF] border border-[#E7E0EC] rounded-2xl p-3 flex flex-col gap-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wide text-[#625B71] flex items-center gap-1">
                          <Flame className="w-3 h-3 text-[#E8710A]" />
                          Top uitgawes
                        </div>
                        {allHistoryExpenses.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs border-b border-dashed border-[#E7E0EC] pb-1 last:border-0 last:pb-0">
                            <span className="font-medium text-[#1C1B1F] truncate max-w-[130px]">{item.name}</span>
                            <span className="font-bold text-[#21005D] font-mono">{formatRand(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onLoadPeriod(key)}
                        className="flex-1 py-2 text-xs font-bold text-white bg-[#6750A4] hover:bg-[#7965AF] rounded-full shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Laai &amp; Wysig
                      </button>
                      <button
                        onClick={() => onDeletePeriod(key)}
                        className="py-2 px-3.5 text-xs font-bold text-[#B3261E] bg-[#F9DEDC] hover:bg-[#F2C4C2] border border-[#F2B8B5] rounded-full transition cursor-pointer flex items-center justify-center gap-1"
                        title="Verwyder perioderekord"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}