import React from 'react';
import { CalendarRange, CalendarCheck, ArrowUpRight, TrendingDown, Clock, HelpCircle, RefreshCw, Trash2, Tag, Flame } from 'lucide-react';
import { PeriodHistoryRecord } from '../types';

interface HistoryTabProps {
  periodHistory: Record<string, PeriodHistoryRecord>;
  onLoadPeriod: (key: string) => void;
  onDeletePeriod: (key: string) => void;
}

export default function HistoryTab({
  periodHistory,
  onLoadPeriod,
  onDeletePeriod
}: HistoryTabProps) {
  const formatRand = (v: number) => `R ${Number(v).toFixed(2)}`;

  const getDaysBetween = (s: string, e: string) => {
    const diff = Math.round((new Date(e).getTime() - new Date(s).getTime()) / (864e5)) + 1;
    return diff > 0 ? diff : 0;
  };

  const getPeriodStatus = (startStr: string, endStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(startStr);
    const end = new Date(endStr);

    if (today < start) return 'future';
    if (today > end) return 'past';
    return 'active';
  };

  const keys = Object.keys(periodHistory).sort((a, b) => {
    return periodHistory[b].start.localeCompare(periodHistory[a].start);
  });

  return (
    <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/30 flex flex-col gap-5" id="panel-history">
      <div className="pb-3 border-b border-dashed border-slate-100">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-indigo-500" />
          Tydperk Geskiedenis
        </h2>
        <p className="text-xs font-semibold text-slate-400 mt-0.5">
          Bestuur en hersien al jou voorheen -gestoorde begrotingstydperke.
        </p>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-20 text-slate-400 italic text-sm bg-slate-50/50 border border-dashed border-slate-150 rounded-2xl" id="history-empty">
          Nog geen gestoorde tydperke nie. Stoor jou huidige tydperk hierbo om te begin!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="history-list">
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
            const dailyAvg = days > 0 ? tot / days : 0;

            // Sort-get top expenses in history
            const allHistoryExpenses = [
              ...(rec.expenses || []).map(item => ({ name: item.name, amount: item.amount })),
              ...(rec.anderExpenses || []).map(item => ({ name: item.name, amount: item.amount }))
            ].sort((a, b) => b.amount - a.amount);
            const topExp = allHistoryExpenses.slice(0, 3);

            const st = getPeriodStatus(rec.start, rec.end);

            return (
              <div
                key={key}
                className={`bg-slate-50/40 border border-slate-100 rounded-3xl p-5 hover:bg-white hover:shadow-2xl hover:shadow-slate-100/60 hover:-translate-y-1 transition duration-200 border-l-[6px] flex flex-col gap-4 relative ${
                  bal >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'
                }`}
              >
                {/* Header info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5 flex-wrap">
                      📅 {rec.label}
                      {st === 'active' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100/50 flex items-center gap-0.5">
                          ● Aktief
                        </span>
                      )}
                      {st === 'future' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-sky-50 text-sky-700 border border-sky-100/50 flex items-center gap-0.5">
                          ⏳ Toekomstig
                        </span>
                      )}
                      {st === 'past' && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 border border-slate-200/50 flex items-center gap-0.5">
                          ✔ Verby
                        </span>
                      )}
                    </h3>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5 font-mono">
                      {days} dae {rec.savedAt && `• Gestoor: ${rec.savedAt}`}
                    </p>
                  </div>
                  <div className={`text-md font-extrabold font-mono px-3 py-1 bg-white border border-slate-100 rounded-full shadow-inner ${bal >= 0 ? 'text-emerald-750' : 'text-rose-750'}`}>
                    {formatRand(bal)}
                  </div>
                </div>

                {/* Substats dashboard Grid */}
                <div className="grid grid-cols-2 xs:grid-cols-3 gap-2.5">
                  <div className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col gap-0.5 text-center">
                    <span className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">Inkomste</span>
                    <span className="text-xs font-bold text-emerald-600 font-mono">{formatRand(ti)}</span>
                  </div>

                  <div className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col gap-0.5 text-center">
                    <span className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">Uitgawes</span>
                    <span className="text-xs font-bold text-rose-600 font-mono">{formatRand(te)}</span>
                  </div>

                  <div className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col gap-0.5 text-center">
                    <span className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">Ander</span>
                    <span className="text-xs font-bold text-purple-600 font-mono">{formatRand(ta)}</span>
                  </div>

                  <div className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col gap-0.5 text-center">
                    <span className="text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">Spaarkoers</span>
                    <span className="text-xs font-bold text-indigo-700 font-mono">{sav.toFixed(1)}%</span>
                  </div>

                  <div className="bg-white border border-slate-100 p-2.5 rounded-2xl flex flex-col gap-0.5 text-center col-span-2">
                    <div className="flex justify-between items-center text-[9px] font-extrabold tracking-wider text-slate-400 uppercase">
                      <span>Uitgawe %</span>
                      <span className="font-bold text-slate-500 font-mono">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>

                {/* Top Expenses */}
                {topExp.length > 0 && (
                  <div className="bg-white border border-slate-100 rounded-2xl p-3 flex flex-col gap-1.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-amber-500 shrink-0" />
                      Top uitgawes
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {topExp.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs border-b border-dashed border-slate-50 pb-1 last:border-0 last:pb-0">
                          <span className="font-semibold text-slate-600 truncate max-w-[130px]">{item.name}</span>
                          <span className="font-extrabold text-slate-800 font-mono">{formatRand(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stored period Actions footer */}
                <div className="flex items-center gap-2 mt-auto pt-3 border-t border-slate-50 select-none">
                  <button
                    onClick={() => onLoadPeriod(key)}
                    className="flex-1 py-2 text-xs font-extrabold text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                    Laai &amp; Wysig
                  </button>
                  <button
                    onClick={() => onDeletePeriod(key)}
                    className="py-2 px-3 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100 rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Verwyder perioderekord"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
