import React, { useState, useEffect } from 'react';
import { Calendar, Check, Trash2, Save, AlertCircle } from 'lucide-react';
import { Period } from '../types';

interface PeriodBarProps {
  currentPeriod: Period | null;
  onSelectPeriod: (start: string, end: string) => void;
  onSavePeriod: () => void;
  onClearAll: () => void;
}

export default function PeriodBar({
  currentPeriod,
  onSelectPeriod,
  onSavePeriod,
  onClearAll
}: PeriodBarProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Update input values when currentPeriod changes
  useEffect(() => {
    if (currentPeriod) {
      setStartDate(currentPeriod.start);
      setEndDate(currentPeriod.end);
    } else {
      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() - 1);
      const nextStr = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-${pad(nextMonth.getDate())}`;
      setStartDate(todayStr);
      setEndDate(nextStr);
    }
  }, [currentPeriod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectPeriod(startDate, endDate);
  };

  const getStatusBadge = () => {
    if (!currentPeriod) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(currentPeriod.start);
    const end = new Date(currentPeriod.end);

    if (today < start) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-100 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
          Toekomstig
        </span>
      );
    } else if (today > end) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-50 text-slate-600 border border-slate-100 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          Verby
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Aktief
        </span>
      );
    }
  };

  return (
    <div className="no-print bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 p-5 mb-5 shadow-xl shadow-slate-100/30 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      {/* Date Pickers Form */}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-indigo-500" />
          Van:
        </div>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="px-4 py-2 text-sm font-semibold rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 cursor-pointer"
          id="sel-start"
        />

        <div className="text-slate-700 font-semibold text-xs uppercase tracking-wider">
          Tot:
        </div>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-4 py-2 text-sm font-semibold rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 cursor-pointer"
          id="sel-end"
        />

        <button
          type="submit"
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-md hover:shadow-lg hover:shadow-slate-900/10 transition-all duration-150 cursor-pointer flex items-center gap-1"
          id="period-sel-btn"
        >
          <Check className="w-3.5 h-3.5" />
          Kies Tydperk
        </button>
      </form>

      {/* Active Period and Actions Info */}
      <div className="flex flex-wrap items-center justify-between xl:justify-end gap-3 w-full xl:w-auto border-t xl:border-t-0 pt-3 xl:pt-0 border-slate-100">
        <div className="flex items-center gap-2">
          <span
            className="px-4 py-2 text-xs font-extrabold text-indigo-950 bg-indigo-50 rounded-2xl border border-indigo-100/50 shadow-inner flex items-center gap-1.5"
            id="active-period-badge"
          >
            {currentPeriod ? `📅 ${currentPeriod.label}` : '📅 Geen Tydperk'}
          </span>
          {getStatusBadge()}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSavePeriod}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-md hover:shadow-lg shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
            title="Stoor huidige tydperk in geskiedenis"
            id="period-save-btn"
          >
            <Save className="w-3.5 h-3.5" />
            Stoor Tydperk
          </button>
          
          <button
            onClick={onClearAll}
            className="px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 rounded-2xl border border-rose-100/50 transition-all duration-150 cursor-pointer flex items-center gap-1.5"
            title="Verwyder alle items in hierdie tydperk"
            id="period-clear-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Maak Skoon
          </button>
        </div>
      </div>
    </div>
  );
}
