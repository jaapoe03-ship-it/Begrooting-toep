import React from 'react';
import { TrendingUp, CreditCard, PiggyBank, Flame, CalendarRange, ListCollapse, DollarSign } from 'lucide-react';
import { Income, Expense, AnderExpense, Period } from '../types';

interface StatsPanelProps {
  incomes: Income[];
  expenses: Expense[];
  anderExpenses: AnderExpense[];
  currentPeriod: Period | null;
}

export default function StatsPanel({ incomes, expenses, anderExpenses, currentPeriod }: StatsPanelProps) {
  const formatRand = (v: number) => `R ${Number(v).toFixed(2)}`;

  // Calculate days between start and end
  const getDaysBetween = (s: string, e: string) => {
    const diff = Math.round((new Date(e).getTime() - new Date(s).getTime()) / (864e5)) + 1;
    return diff > 0 ? diff : 0;
  };

  const ti = incomes.reduce((sum, item) => sum + item.amount, 0);
  const te = expenses.reduce((sum, item) => sum + item.amount, 0);
  const ta = anderExpenses.reduce((sum, item) => sum + item.amount, 0);
  const tot = te + ta;
  const bal = ti - tot;

  const days = currentPeriod ? getDaysBetween(currentPeriod.start, currentPeriod.end) : 0;
  const expPct = ti > 0 ? Math.min(100, (tot / ti) * 100) : 0;
  const savPct = ti > 0 ? Math.max(0, (bal / ti) * 100) : 0;
  const dailyAvg = days > 0 ? tot / days : 0;
  const itemCount = incomes.length + expenses.length + anderExpenses.length;

  // Combine actions for Top Expenses
  const allExpenses = [
    ...expenses.map(e => ({ name: e.name, amount: e.amount, isAnder: false })),
    ...anderExpenses.map(e => ({ name: e.name, amount: e.amount, isAnder: true }))
  ].sort((a, b) => b.amount - a.amount);

  const topExp = allExpenses.slice(0, 5);

  return (
    <div className="no-print bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-xl shadow-slate-100/30 flex flex-col gap-6" id="live-stats-panel">
      {/* Panel Title */}
      <div className="border-b border-dashed border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Statistieke
        </h3>
        <p className="text-xs font-semibold text-slate-400 mt-1" id="ls-period-sub">
          {currentPeriod ? `${currentPeriod.label} • ${days} dae` : 'Geen tydperk gekies nie'}
        </p>
      </div>

      {/* Hero Metrics */}
      <div className="grid grid-cols-1 gap-3">
        {/* Income Card */}
        <div className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl border-l-[4px] border-emerald-500 transition-all duration-200 flex items-center justify-between" id="stat-card-income">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Inkomste</span>
            <div className="text-lg font-extrabold text-emerald-700 mt-0.5" id="hero-income">
              {formatRand(ti)}
            </div>
          </div>
          <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl border-l-[4px] border-rose-500 transition-all duration-200 flex items-center justify-between" id="stat-card-expenses">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Totale Uitgawes</span>
            <div className="text-lg font-extrabold text-rose-700 mt-0.5" id="hero-expense">
              {formatRand(tot)}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5 block" id="hero-ander-sub">
              wv. Ander: {formatRand(ta)}
            </span>
          </div>
          <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Balance Card */}
        <div
          className={`p-4 rounded-2xl border-l-[4px] transition-all duration-200 flex items-center justify-between ${
            bal >= 0
              ? 'bg-slate-50/50 hover:bg-slate-50 border-indigo-500'
              : 'bg-rose-50/60 border-rose-600 shadow-sm shadow-rose-100'
          }`}
          id="hero-balance-card"
        >
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Oorskot</span>
            <div className={`text-lg font-extrabold mt-0.5 ${bal >= 0 ? 'text-indigo-950' : 'text-rose-850'}`} id="hero-balance">
              {formatRand(bal)}
            </div>
          </div>
          <div className={`p-2 rounded-xl ${bal >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-100 text-rose-700'}`}>
            <PiggyBank className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="flex flex-col gap-4">
        {/* Expenses Percentage */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1">💸 Uitgawe % van Inkomste</span>
            <span id="ls-exp-pct-lbl" className="font-semibold text-slate-500">
              {Math.round(expPct)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-350 ease-out"
              style={{ width: `${expPct}%` }}
              id="ls-exp-bar"
            />
          </div>
        </div>

        {/* Savings Rate */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1">💰 Spaarkoers</span>
            <span id="ls-sav-pct-lbl" className="font-semibold text-slate-500">
              {Math.round(savPct)}%
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-350 ease-out"
              style={{ width: `${savPct}%` }}
              id="ls-sav-bar"
            />
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-center flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Dag gem.</span>
          <span className="text-xs font-bold text-slate-800 truncate" id="ls-daily-avg">
            {formatRand(dailyAvg)}
          </span>
        </div>
        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-center flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Dae</span>
          <span className="text-xs font-extrabold text-indigo-950 truncate" id="ls-days">
            {days}
          </span>
        </div>
        <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 text-center flex flex-col gap-0.5">
          <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-400">Items</span>
          <span className="text-xs font-extrabold text-indigo-950 truncate" id="ls-item-count">
            {itemCount}
          </span>
        </div>
      </div>

      {/* Top Expenses */}
      <div className="flex flex-col gap-2.5" id="ls-top-section">
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          Top uitgawes
        </div>
        <div className="flex flex-col gap-2" id="ls-top-list">
          {topExp.length === 0 ? (
            <div className="text-center py-6 text-slate-400 italic text-xs bg-slate-50/30 border border-dashed border-slate-100 rounded-xl" id="ls-empty">
              Voeg uitgawes by om top items te sien.
            </div>
          ) : (
            topExp.map((item, idx) => {
              const itemPct = tot > 0 ? ((item.amount / tot) * 100).toFixed(1) : '0';
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1.5 px-3 bg-slate-50 hover:bg-slate-100/70 border border-slate-100/50 rounded-xl transition-all duration-150"
                >
                  <span className="font-semibold text-slate-700 truncate max-w-[140px]">
                    {item.name} {item.isAnder && <span className="text-[9px] text-purple-600 bg-purple-50 px-1 rounded-sm">Ander</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                      {itemPct}%
                    </span>
                    <span className="font-bold text-slate-800 font-mono">
                      {formatRand(item.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
