import React, { useState, useEffect } from 'react';
import { Calendar, Check, Trash2, Save } from 'lucide-react';
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

  const getStatusChip = () => {
    if (!currentPeriod) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(currentPeriod.start);
    const end = new Date(currentPeriod.end);

    if (today < start) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#C2E7FF] text-[#001D35]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#006495] animate-pulse" />
          Toekomstig
        </span>
      );
    } else if (today > end) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E7E0EC] text-[#49454F]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#79747E]" />
          Verby
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#C3EFAD] text-[#0A3818]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#386A20] animate-pulse" />
          Aktief
        </span>
      );
    }
  };

  return (
    <div className="no-print bg-[#F4EEFF] border-b border-[#E7E0EC] px-5 py-4 mb-0" id="period-bar">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Date pickers */}
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-[#49454F] font-medium text-xs">
            <Calendar className="w-4 h-4 text-[#6750A4]" />
            Van:
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 text-sm font-medium rounded-2xl border border-[#CAC4D0] bg-white text-[#1C1B1F] outline-none focus:ring-2 focus:ring-[#6750A4]/30 focus:border-[#6750A4] transition cursor-pointer"
            id="sel-start"
          />
          <span className="text-[#49454F] font-medium text-xs">Tot:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 text-sm font-medium rounded-2xl border border-[#CAC4D0] bg-white text-[#1C1B1F] outline-none focus:ring-2 focus:ring-[#6750A4]/30 focus:border-[#6750A4] transition cursor-pointer"
            id="sel-end"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-[#6750A4] hover:bg-[#7965AF] text-white text-xs font-medium rounded-full shadow-sm transition cursor-pointer flex items-center gap-1.5"
            id="period-sel-btn"
          >
            <Check className="w-3.5 h-3.5" />
            Kies
          </button>
        </form>

        {/* Period info + actions */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-medium text-[#21005D] bg-[#EADDFF] rounded-full border border-[#D0BCFF]" id="active-period-badge">
            {currentPeriod ? `📅 ${currentPeriod.label}` : '📅 Geen Tydperk'}
          </span>
          {getStatusChip()}

          <button
            onClick={onSavePeriod}
            className="px-3 py-1.5 text-xs font-medium text-white bg-[#386A20] hover:bg-[#4A8A2A] rounded-full shadow-sm transition cursor-pointer flex items-center gap-1.5"
            id="period-save-btn"
          >
            <Save className="w-3.5 h-3.5" />
            Stoor
          </button>

          <button
            onClick={onClearAll}
            className="px-3 py-1.5 text-xs font-medium text-[#B3261E] bg-[#F9DEDC] hover:bg-[#F2C4C2] rounded-full border border-[#F2B8B5] transition cursor-pointer flex items-center gap-1.5"
            id="period-clear-btn"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Skoon
          </button>
        </div>
      </div>
    </div>
  );
}