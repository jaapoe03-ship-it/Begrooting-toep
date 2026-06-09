import React, { useState } from 'react';
import { Search, ArrowUpDown, Trash2, Edit, CheckSquare, Square, Info, Paperclip, AlertTriangle, Eye } from 'lucide-react';
import { Income, Expense, AnderExpense, FilterState, SortState } from '../types';

interface BudgetTabProps {
  incomes: Income[];
  expenses: Expense[];
  anderExpenses: AnderExpense[];
  onAddItem: (type: 'income' | 'expense' | 'ander', name: string, amount: number, date: string) => void;
  onDeleteItem: (type: 'income' | 'expense' | 'ander', id: string) => void;
  onTogglePaid: (id: string, checked: boolean) => void;
  onEditItem: (type: 'income' | 'expense' | 'ander', id: string) => void;
  onViewDetails: (item: any, rect: DOMRect) => void;
  onHideDetails: () => void;
}

export default function BudgetTab({
  incomes,
  expenses,
  anderExpenses,
  onAddItem,
  onDeleteItem,
  onTogglePaid,
  onEditItem,
  onViewDetails,
  onHideDetails
}: BudgetTabProps) {
  // Input fields local states
  const [incName, setIncName] = useState('');
  const [incAmt, setIncAmt] = useState('');

  const [expName, setExpName] = useState('');
  const [expAmt, setExpAmt] = useState('');
  const [expDate, setExpDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  const [andName, setAndName] = useState('');
  const [andAmt, setAndAmt] = useState('');
  const [andDate, setAndDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Search and Sort states
  const [search, setSearch] = useState<FilterState>({ income: '', expense: '', ander: '' });
  const [sort, setSort] = useState<SortState>({ income: 'default', expense: 'default', ander: 'default' });

  const formatRand = (v: number) => `R ${Number(v).toFixed(2)}`;

  const formatDateShort = (d: string) => {
    if (!d) return '';
    const MONTHS = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    const parts = d.split('-');
    if (parts.length < 3) return d;
    const mIdx = parseInt(parts[1]) - 1;
    return `${parseInt(parts[2])} ${MONTHS[mIdx] || ''}`;
  };

  const handleAdd = (type: 'income' | 'expense' | 'ander') => {
    if (type === 'income') {
      if (!incName.trim()) return alert('Voer asseblief \'n naam in!');
      onAddItem('income', incName.trim(), parseFloat(incAmt) || 0, '');
      setIncName('');
      setIncAmt('');
    } else if (type === 'expense') {
      if (!expName.trim()) return alert('Voer asseblief \'n naam in!');
      onAddItem('expense', expName.trim(), parseFloat(expAmt) || 0, expDate);
      setExpName('');
      setExpAmt('');
    } else {
      if (!andName.trim()) return alert('Voer asseblief \'n naam in!');
      onAddItem('ander', andName.trim(), parseFloat(andAmt) || 0, andDate);
      setAndName('');
      setAndAmt('');
    }
  };

  // Sort and filter helper
  const processList = <T extends { name: string; amount: number; date?: string }>(
    list: T[],
    type: keyof FilterState
  ): T[] => {
    let result = [...list];
    
    // Filter search
    const query = search[type].trim().toLowerCase();
    if (query) {
      result = result.filter(item => item.name.toLowerCase().includes(query));
    }

    // Sort
    const sorting = sort[type];
    if (sorting === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name, 'af', { sensitivity: 'base' }));
    } else if (sorting === 'amount') {
      result.sort((a, b) => b.amount - a.amount);
    } else if (sorting === 'date') {
      result.sort((a, b) => {
        const ad = a.date || '';
        const bd = b.date || '';
        return bd.localeCompare(ad);
      });
    }

    return result;
  };

  const cycleSort = (type: keyof SortState) => {
    const cycleMap: Record<string, SortState[keyof SortState][]> = {
      income: ['default', 'name', 'amount'],
      expense: ['default', 'name', 'amount', 'date'],
      ander: ['default', 'name', 'amount', 'date']
    };
    const options = cycleMap[type];
    const currentIndex = options.indexOf(sort[type]);
    const nextIndex = (currentIndex + 1) % options.length;
    setSort(prev => ({ ...prev, [type]: options[nextIndex] }));
  };

  const getSortLabel = (type: keyof SortState) => {
    const val = sort[type];
    if (val === 'name') return '🔤 Naam A→Z';
    if (val === 'amount') return '💰 Bedrag ↓';
    if (val === 'date') return '📅 Datum ↓';
    return '⇅ Volgorde';
  };

  // Subtotals
  const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, i) => s + i.amount, 0);
  const totalAnd = anderExpenses.reduce((s, i) => s + i.amount, 0);
  const unpaidCount = expenses.filter(e => !e.paid).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="panel-budget">
      {/* 1. INCOME COLUMN */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-xl shadow-slate-100/15 border-t-4 border-emerald-500 border border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100">
          <h2 className="text-md font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="p-1 px-2.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-black">INKOMSTE</span>
            ✨ Inkomste
          </h2>
          <span className="text-xs font-bold text-slate-400 font-mono">
            Subtotaal: <span className="text-emerald-700">{formatRand(totalInc)}</span>
          </span>
        </div>

        {/* Searching & Sorting control buttons */}
        <div className="no-print flex items-center bg-slate-50 border border-slate-100/80 p-1.5 rounded-2xl gap-1.5 shadow-inner">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="search"
              value={search.income}
              onChange={(e) => setSearch(prev => ({ ...prev, income: e.target.value }))}
              placeholder="Soek inkomste..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-transparent hover:border-slate-200 focus:outline-none focus:border-indigo-500/50 transition"
              id="income-search"
            />
          </div>
          <button
            onClick={() => cycleSort('income')}
            className={`p-1.5 pl-2.5 pr-3 text-[10px] font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              sort.income !== 'default' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-100 shadow-sm'
            }`}
            id="income-sort-btn"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span id="income-sort-label">{getSortLabel('income')}</span>
          </button>
        </div>

        {/* List items */}
        <div className="item-list max-h-[300px] overflow-y-auto flex flex-col gap-2 p-1 bg-slate-50/20 rounded-2xl border border-dashed border-slate-100/50 min-h-[120px]" id="income-list">
          {processList(incomes, 'income').length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-semibold italic text-xs">Geen inkomste nie.</div>
          ) : (
            processList(incomes, 'income').map((item, idx) => {
              // Get original index for delete/edit actions
              const originalIndex = incomes.findIndex(i => i.id === item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100/60 p-2.5 px-3.5 rounded-full hover:bg-white hover:shadow-lg hover:shadow-slate-100/40 transition group relative"
                >
                  <span className="text-xs font-extrabold text-slate-800 tracking-tight truncate max-w-[130px]" title={item.name}>
                    {item.name}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-700 bg-slate-200/50 px-2 py-0.5 rounded-full font-mono">
                      {formatRand(item.amount)}
                    </span>
                    <div className="no-print flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={() => onEditItem('income', item.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer"
                        title="Wysig inkomste"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem('income', item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                        title="Verwyder inkomste"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Income Form row */}
        <div className="no-print flex items-center gap-2 mt-auto border-t border-slate-50 pt-3">
          <input
            type="text"
            value={incName}
            onChange={(e) => setIncName(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            placeholder="Naam (bv. Salaris)"
            id="income-name"
          />
          <input
            type="number"
            value={incAmt}
            onChange={(e) => setIncAmt(e.target.value)}
            className="w-16 px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-100 text-right font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            placeholder="R"
            min="0"
            step="0.01"
            id="income-amt"
          />
          <button
            onClick={() => handleAdd('income')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            + Voeg by
          </button>
        </div>
      </div>

      {/* 2. EXPENSES COLUMN */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-xl shadow-slate-100/15 border-t-4 border-rose-500 border border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100">
          <h2 className="text-md font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="p-1 px-2.5 bg-rose-50 text-rose-600 rounded-lg text-xs font-black">UITGAWES</span>
            ⚠️ Uitgawes
            {unpaidCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-100 text-rose-700 shadow-sm" id="unpaid-badge">
                {unpaidCount} onbetaal
              </span>
            )}
          </h2>
          <span className="text-xs font-bold text-slate-400 font-mono">
            Subtotaal: <span className="text-rose-700">{formatRand(totalExp)}</span>
          </span>
        </div>

        {/* Searching & Sorting */}
        <div className="no-print flex items-center bg-slate-50 border border-slate-100/80 p-1.5 rounded-2xl gap-1.5 shadow-inner">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="search"
              value={search.expense}
              onChange={(e) => setSearch(prev => ({ ...prev, expense: e.target.value }))}
              placeholder="Soek uitgawes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-transparent hover:border-slate-200 focus:outline-none focus:border-indigo-500/50 transition"
              id="expense-search"
            />
          </div>
          <button
            onClick={() => cycleSort('expense')}
            className={`p-1.5 pl-2.5 pr-3 text-[10px] font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              sort.expense !== 'default' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-100 shadow-sm'
            }`}
            id="expense-sort-btn"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span id="expense-sort-label">{getSortLabel('expense')}</span>
          </button>
        </div>

        {/* List items */}
        <div className="item-list max-h-[300px] overflow-y-auto flex flex-col gap-2 p-1 bg-slate-50/20 rounded-2xl border border-dashed border-slate-100/50 min-h-[120px]" id="expense-list">
          {processList(expenses, 'expense').length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-semibold italic text-xs">Geen uitgawes nie.</div>
          ) : (
            processList(expenses, 'expense').map((item, idx) => {
              const isPaid = !!item.paid;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between border p-2.5 px-3.5 rounded-full hover:bg-white hover:shadow-lg hover:shadow-slate-100/30 transition group relative ${
                    isPaid ? 'bg-slate-100/60 border-slate-100/50 opacity-60' : 'bg-slate-50 border-slate-100/60'
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[130px] truncate">
                    {/* Paid checkbox */}
                    <button
                      onClick={() => onTogglePaid(item.id, !isPaid)}
                      className="p-0.5 hover:bg-slate-200 rounded transition cursor-pointer"
                    >
                      {isPaid ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    <span className={`text-xs font-bold tracking-tight truncate ${isPaid ? 'line-through text-slate-400' : 'text-slate-800'}`} title={item.name}>
                      {item.name}
                    </span>
                    {item.date && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-50 border border-rose-100 text-rose-600 whitespace-nowrap font-semibold">
                        {formatDateShort(item.date)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Details Hover Trigger/Badge indicators */}
                    <div className="flex items-center gap-1">
                      {item.category && (
                        <span className="text-[10px] scale-90 px-1 bg-teal-50 border border-teal-100 text-teal-700 rounded-md font-bold">
                          {item.category.slice(0, 1) /* show emoji only */}
                        </span>
                      )}
                      {item.priority === 'Hoog' && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-sm uppercase text-[8px]" title="Hoë Prioriteit" />
                      )}
                      {(item.note || (item.photos && item.photos.length > 0)) && (
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onViewDetails(item, rect);
                          }}
                          className="p-1 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 rounded-md transition duration-150 cursor-pointer"
                          title="Sien Besonderhede / Notas"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-700 bg-slate-200/50 px-2 py-0.5 rounded-full font-mono">
                      {formatRand(item.amount)}
                    </span>

                    <div className="no-print flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={() => onEditItem('expense', item.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer"
                        title="Wysig uitgawe"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem('expense', item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                        title="Verwyder uitgawe"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Expense Form row */}
        <div className="no-print flex flex-col gap-2 mt-auto border-t border-slate-50 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={expName}
              onChange={(e) => setExpName(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              placeholder="Naam (bv. Huur)"
              id="expense-name"
            />
            <input
              type="number"
              value={expAmt}
              onChange={(e) => setExpAmt(e.target.value)}
              className="w-16 px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-100 text-right font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              placeholder="R"
              min="0"
              step="0.01"
              id="expense-amt"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={expDate}
              onChange={(e) => setExpDate(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
              title="Betaaldatum"
              id="expense-date"
            />
            <button
              onClick={() => handleAdd('expense')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              + Voeg by
            </button>
          </div>
        </div>
      </div>

      {/* 3. ANDER (OTHER) COLUMN */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-xl shadow-slate-100/15 border-t-4 border-purple-500 border border-slate-100 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100">
          <h2 className="text-md font-extrabold text-slate-800 flex items-center gap-1.5">
            <span className="p-1 px-2.5 bg-purple-50 text-purple-600 rounded-lg text-xs font-black">ANDER</span>
            📦 Ander
          </h2>
          <span className="text-xs font-bold text-slate-400 font-mono">
            Subtotaal: <span className="text-purple-700">{formatRand(totalAnd)}</span>
          </span>
        </div>

        {/* Searching & Sorting */}
        <div className="no-print flex items-center bg-slate-50 border border-slate-100/80 p-1.5 rounded-2xl gap-1.5 shadow-inner">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="search"
              value={search.ander}
              onChange={(e) => setSearch(prev => ({ ...prev, ander: e.target.value }))}
              placeholder="Soek ander items..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-semibold rounded-xl bg-white border border-transparent hover:border-slate-200 focus:outline-none focus:border-indigo-500/50 transition"
              id="ander-search"
            />
          </div>
          <button
            onClick={() => cycleSort('ander')}
            className={`p-1.5 pl-2.5 pr-3 text-[10px] font-extrabold rounded-xl transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
              sort.ander !== 'default' ? 'bg-indigo-600 text-white shadow-md' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-100 shadow-sm'
            }`}
            id="ander-sort-btn"
          >
            <ArrowUpDown className="w-3 h-3" />
            <span id="ander-sort-label">{getSortLabel('ander')}</span>
          </button>
        </div>

        {/* List items */}
        <div className="item-list max-h-[300px] overflow-y-auto flex flex-col gap-2 p-1 bg-slate-50/20 rounded-2xl border border-dashed border-slate-100/50 min-h-[120px]" id="ander-list">
          {processList(anderExpenses, 'ander').length === 0 ? (
            <div className="text-center py-10 text-slate-400 font-semibold italic text-xs">Geen Ander-items nie.</div>
          ) : (
            processList(anderExpenses, 'ander').map((item, idx) => {
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-slate-50 border border-slate-100/60 p-2.5 px-3.5 rounded-full hover:bg-white hover:shadow-lg hover:shadow-slate-100/40 transition group relative"
                >
                  <div className="flex items-center gap-2 max-w-[130px] truncate">
                    <span className="text-xs font-bold text-slate-800 tracking-tight truncate" title={item.name}>
                      {item.name}
                    </span>
                    {item.date && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-50 border border-purple-100 text-purple-600 whitespace-nowrap font-semibold">
                        {formatDateShort(item.date)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Details indicators */}
                    <div className="flex items-center gap-1">
                      {item.category && (
                        <span className="text-[10px] scale-90 px-1 bg-purple-50 border border-purple-25 text-purple-600 rounded-md font-bold">
                          {item.category.slice(0, 1) /* show emoji */}
                        </span>
                      )}
                      {item.priority === 'Hoog' && (
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shadow-sm uppercase text-[8px]" />
                      )}
                      {(item.note || (item.photos && item.photos.length > 0)) && (
                        <button
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onViewDetails(item, rect);
                          }}
                          className="p-1 bg-indigo-50/50 hover:bg-indigo-100 text-indigo-600 rounded-md transition duration-150 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-700 bg-slate-200/50 px-2 py-0.5 rounded-full font-mono">
                      {formatRand(item.amount)}
                    </span>

                    <div className="no-print flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition duration-150">
                      <button
                        onClick={() => onEditItem('ander', item.id)}
                        className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition cursor-pointer"
                        title="Wysig ander item"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem('ander', item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition cursor-pointer"
                        title="Verwyder ander item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Add Ander Form row */}
        <div className="no-print flex flex-col gap-2 mt-auto border-t border-slate-50 pt-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={andName}
              onChange={(e) => setAndName(e.target.value)}
              className="flex-1 min-w-0 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50/20 hover:bg-purple-50/50 focus:bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition"
              placeholder="Naam (bv. Klere)"
              id="ander-name"
            />
            <input
              type="number"
              value={andAmt}
              onChange={(e) => setAndAmt(e.target.value)}
              className="w-16 px-3 py-2 text-xs font-bold rounded-xl bg-purple-50/20 hover:bg-purple-50/50 focus:bg-white border border-purple-100 text-right font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition"
              placeholder="R"
              min="0"
              step="0.01"
              id="ander-amt"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={andDate}
              onChange={(e) => setAndDate(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-semibold rounded-xl bg-purple-50/20 hover:bg-purple-50/50 focus:bg-white border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition cursor-pointer"
              title="Transaksiedatum"
              id="ander-date"
            />
            <button
              onClick={() => handleAdd('ander')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              + Voeg by
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
