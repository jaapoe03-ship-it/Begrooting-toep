import React, { useState } from 'react';
import { Search, ArrowUpDown, Trash2, Edit, CheckSquare, Square, Eye } from 'lucide-react';
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

// Color tokens per section
const SECTION = {
  income: {
    accent: '#386A20',
    container: '#C3EFAD',
    onContainer: '#0A3818',
    badge: 'bg-[#C3EFAD] text-[#0A3818]',
    input: 'border-[#A8D5A2] focus:border-[#386A20] focus:ring-[#386A20]/20 bg-[#F0FBE8]',
    btn: 'bg-[#386A20] hover:bg-[#4A8A2A] text-white',
    sortActive: 'bg-[#386A20] text-white',
    header: 'bg-[#C3EFAD]',
    label: 'INKOMSTE',
    emoji: '💚',
  },
  expense: {
    accent: '#B3261E',
    container: '#F9DEDC',
    onContainer: '#410E0B',
    badge: 'bg-[#F9DEDC] text-[#410E0B]',
    input: 'border-[#F2B8B5] focus:border-[#B3261E] focus:ring-[#B3261E]/20 bg-[#FFF8F7]',
    btn: 'bg-[#B3261E] hover:bg-[#C0392B] text-white',
    sortActive: 'bg-[#B3261E] text-white',
    header: 'bg-[#F9DEDC]',
    label: 'UITGAWES',
    emoji: '🔴',
  },
  ander: {
    accent: '#6750A4',
    container: '#EADDFF',
    onContainer: '#21005D',
    badge: 'bg-[#EADDFF] text-[#21005D]',
    input: 'border-[#D0BCFF] focus:border-[#6750A4] focus:ring-[#6750A4]/20 bg-[#F8F4FF]',
    btn: 'bg-[#6750A4] hover:bg-[#7965AF] text-white',
    sortActive: 'bg-[#6750A4] text-white',
    header: 'bg-[#EADDFF]',
    label: 'ANDER',
    emoji: '📦',
  },
} as const;

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

  const [search, setSearch] = useState<FilterState>({ income: '', expense: '', ander: '' });
  const [sort, setSort] = useState<SortState>({ income: 'default', expense: 'default', ander: 'default' });

  const formatRand = (v: number) => `R ${Number(v).toFixed(2)}`;
  const formatDateShort = (d: string) => {
    if (!d) return '';
    const MONTHS = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    const parts = d.split('-');
    if (parts.length < 3) return d;
    return `${parseInt(parts[2])} ${MONTHS[parseInt(parts[1]) - 1] || ''}`;
  };

  const handleAdd = (type: 'income' | 'expense' | 'ander') => {
    if (type === 'income') {
      if (!incName.trim()) return alert('Voer asseblief \'n naam in!');
      onAddItem('income', incName.trim(), parseFloat(incAmt) || 0, '');
      setIncName(''); setIncAmt('');
    } else if (type === 'expense') {
      if (!expName.trim()) return alert('Voer asseblief \'n naam in!');
      onAddItem('expense', expName.trim(), parseFloat(expAmt) || 0, expDate);
      setExpName(''); setExpAmt('');
    } else {
      if (!andName.trim()) return alert('Voer asseblief \'n naam in!');
      onAddItem('ander', andName.trim(), parseFloat(andAmt) || 0, andDate);
      setAndName(''); setAndAmt('');
    }
  };

  const processList = <T extends { name: string; amount: number; date?: string }>(list: T[], type: keyof FilterState): T[] => {
    let result = [...list];
    const query = search[type].trim().toLowerCase();
    if (query) result = result.filter(item => item.name.toLowerCase().includes(query));
    const sorting = sort[type];
    if (sorting === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'af', { sensitivity: 'base' }));
    else if (sorting === 'amount') result.sort((a, b) => b.amount - a.amount);
    else if (sorting === 'date') result.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    return result;
  };

  const cycleSort = (type: keyof SortState) => {
    const cycleMap: Record<string, SortState[keyof SortState][]> = {
      income: ['default', 'name', 'amount'],
      expense: ['default', 'name', 'amount', 'date'],
      ander: ['default', 'name', 'amount', 'date']
    };
    const options = cycleMap[type];
    const nextIndex = (options.indexOf(sort[type]) + 1) % options.length;
    setSort(prev => ({ ...prev, [type]: options[nextIndex] }));
  };

  const getSortLabel = (type: keyof SortState) => {
    const val = sort[type];
    if (val === 'name') return 'Naam A→Z';
    if (val === 'amount') return 'Bedrag ↓';
    if (val === 'date') return 'Datum ↓';
    return 'Sorteer';
  };

  const totalInc = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExp = expenses.reduce((s, i) => s + i.amount, 0);
  const totalAnd = anderExpenses.reduce((s, i) => s + i.amount, 0);
  const unpaidCount = expenses.filter(e => !e.paid).length;

  // Reusable search+sort bar
  const SearchSortBar = ({ type, placeholder, id }: { type: keyof FilterState; placeholder: string; id: string }) => {
    const s = SECTION[type as keyof typeof SECTION];
    return (
      <div className="no-print flex items-center bg-[#F4EEFF] border border-[#E7E0EC] p-1.5 rounded-2xl gap-1.5">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#79747E]" />
          <input
            type="search"
            value={search[type]}
            onChange={(e) => setSearch(prev => ({ ...prev, [type]: e.target.value }))}
            placeholder={placeholder}
            className="w-full pl-8 pr-3 py-1.5 text-xs font-medium rounded-xl bg-white border border-transparent hover:border-[#CAC4D0] focus:outline-none focus:border-[#6750A4]/50 transition text-[#1C1B1F]"
            id={id}
          />
        </div>
        <button
          onClick={() => cycleSort(type)}
          className={`p-1.5 pl-2.5 pr-3 text-[10px] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
            sort[type] !== 'default'
              ? s.sortActive + ' shadow-sm'
              : 'bg-white hover:bg-[#E8DEF8] text-[#625B71] border border-[#CAC4D0]'
          }`}
        >
          <ArrowUpDown className="w-3 h-3" />
          {getSortLabel(type)}
        </button>
      </div>
    );
  };

  // Reusable text+number input row
  const InputRow = ({
    nameVal, onNameChange, amtVal, onAmtChange,
    namePlaceholder, nameId, amtId,
    type
  }: {
    nameVal: string; onNameChange: (v: string) => void;
    amtVal: string; onAmtChange: (v: string) => void;
    namePlaceholder: string; nameId: string; amtId: string;
    type: keyof typeof SECTION;
  }) => {
    const s = SECTION[type];
    return (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={nameVal}
          onChange={(e) => onNameChange(e.target.value)}
          className={`flex-1 min-w-0 px-3 py-2 text-xs font-medium rounded-2xl border outline-none focus:ring-2 transition ${s.input} text-[#1C1B1F]`}
          placeholder={namePlaceholder}
          id={nameId}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(type)}
        />
        <input
          type="number"
          value={amtVal}
          onChange={(e) => onAmtChange(e.target.value)}
          className={`w-20 px-3 py-2 text-xs font-bold rounded-2xl border outline-none focus:ring-2 transition text-right font-mono ${s.input} text-[#1C1B1F]`}
          placeholder="R 0"
          min="0"
          step="0.01"
          id={amtId}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd(type)}
        />
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" id="panel-budget">

      {/* ── 1. INCOME ── */}
      <div className="bg-[#FFFBFE] rounded-[28px] border border-[#E7E0EC] overflow-hidden shadow-sm flex flex-col">
        {/* Card header */}
        <div className={`${SECTION.income.header} px-5 py-3.5 flex items-center justify-between`}>
          <h2 className="text-sm font-bold text-[#0A3818] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#386A20]" />
            {SECTION.income.emoji} Inkomste
          </h2>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${SECTION.income.badge}`}>
            {formatRand(totalInc)}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <SearchSortBar type="income" placeholder="Soek inkomste..." id="income-search" />

          <div className="item-list max-h-[280px] overflow-y-auto flex flex-col gap-1.5 min-h-[100px]" id="income-list">
            {processList(incomes, 'income').length === 0 ? (
              <div className="text-center py-10 text-[#79747E] text-xs italic bg-[#F4EEFF] rounded-2xl border border-dashed border-[#CAC4D0]">
                Geen inkomste nie.
              </div>
            ) : (
              processList(incomes, 'income').map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[#F4EEFF] hover:bg-[#E8DEF8] border border-[#E7E0EC] p-2.5 px-3.5 rounded-full transition group"
                >
                  <span className="text-xs font-medium text-[#1C1B1F] truncate max-w-[130px]" title={item.name}>
                    {item.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0A3818] bg-[#C3EFAD] px-2.5 py-0.5 rounded-full font-mono">
                      {formatRand(item.amount)}
                    </span>
                    <div className="no-print flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => onEditItem('income', item.id)} className="p-1.5 text-[#79747E] hover:text-[#6750A4] hover:bg-[#EADDFF] rounded-full transition cursor-pointer">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDeleteItem('income', item.id)} className="p-1.5 text-[#79747E] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded-full transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="no-print mt-auto pt-2 border-t border-[#E7E0EC] flex flex-col gap-2">
            <InputRow
              type="income"
              nameVal={incName} onNameChange={setIncName}
              amtVal={incAmt} onAmtChange={setIncAmt}
              namePlaceholder="Naam (bv. Salaris)" nameId="income-name" amtId="income-amt"
            />
            <button
              onClick={() => handleAdd('income')}
              className={`w-full py-2 text-xs font-bold rounded-full shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5 ${SECTION.income.btn}`}
            >
              + Voeg Inkomste By
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. EXPENSES ── */}
      <div className="bg-[#FFFBFE] rounded-[28px] border border-[#E7E0EC] overflow-hidden shadow-sm flex flex-col">
        <div className={`${SECTION.expense.header} px-5 py-3.5 flex items-center justify-between`}>
          <h2 className="text-sm font-bold text-[#410E0B] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#B3261E]" />
            {SECTION.expense.emoji} Uitgawes
            {unpaidCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#B3261E] text-white" id="unpaid-badge">
                {unpaidCount} onbetaal
              </span>
            )}
          </h2>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${SECTION.expense.badge}`}>
            {formatRand(totalExp)}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <SearchSortBar type="expense" placeholder="Soek uitgawes..." id="expense-search" />

          <div className="item-list max-h-[280px] overflow-y-auto flex flex-col gap-1.5 min-h-[100px]" id="expense-list">
            {processList(expenses, 'expense').length === 0 ? (
              <div className="text-center py-10 text-[#79747E] text-xs italic bg-[#FFF8F7] rounded-2xl border border-dashed border-[#F2B8B5]">
                Geen uitgawes nie.
              </div>
            ) : (
              processList(expenses, 'expense').map((item) => {
                const isPaid = !!item.paid;
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between border p-2.5 px-3.5 rounded-full transition group ${
                      isPaid
                        ? 'bg-[#F9DEDC]/40 border-[#F2B8B5]/40 opacity-55'
                        : 'bg-[#FFF8F7] hover:bg-[#F9DEDC]/50 border-[#F2B8B5]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 max-w-[140px] truncate">
                      <button
                        onClick={() => onTogglePaid(item.id, !isPaid)}
                        className="p-0.5 hover:bg-[#F9DEDC] rounded-full transition cursor-pointer flex-shrink-0"
                      >
                        {isPaid
                          ? <CheckSquare className="w-4 h-4 text-[#386A20]" />
                          : <Square className="w-4 h-4 text-[#79747E]" />
                        }
                      </button>
                      <span className={`text-xs font-medium truncate ${isPaid ? 'line-through text-[#79747E]' : 'text-[#1C1B1F]'}`} title={item.name}>
                        {item.name}
                      </span>
                      {item.date && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#F9DEDC] border border-[#F2B8B5] text-[#7D5260] whitespace-nowrap font-medium flex-shrink-0">
                          {formatDateShort(item.date)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {item.priority === 'Hoog' && (
                        <span className="w-2 h-2 rounded-full bg-[#B3261E] animate-ping flex-shrink-0" />
                      )}
                      {(item.note || (item.photos && item.photos.length > 0)) && (
                        <button
                          onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); onViewDetails(item, rect); }}
                          className="p-1.5 bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#6750A4] rounded-full transition cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      )}
                      <span className="text-xs font-bold text-[#410E0B] bg-[#F9DEDC] px-2.5 py-0.5 rounded-full font-mono">
                        {formatRand(item.amount)}
                      </span>
                      <div className="no-print flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => onEditItem('expense', item.id)} className="p-1.5 text-[#79747E] hover:text-[#6750A4] hover:bg-[#EADDFF] rounded-full transition cursor-pointer">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onDeleteItem('expense', item.id)} className="p-1.5 text-[#79747E] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded-full transition cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="no-print mt-auto pt-2 border-t border-[#E7E0EC] flex flex-col gap-2">
            <InputRow
              type="expense"
              nameVal={expName} onNameChange={setExpName}
              amtVal={expAmt} onAmtChange={setExpAmt}
              namePlaceholder="Naam (bv. Huur)" nameId="expense-name" amtId="expense-amt"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={expDate}
                onChange={(e) => setExpDate(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-2xl border outline-none focus:ring-2 transition cursor-pointer ${SECTION.expense.input} text-[#1C1B1F]`}
                id="expense-date"
              />
              <button
                onClick={() => handleAdd('expense')}
                className={`px-4 py-2 text-xs font-bold rounded-full shadow-sm transition cursor-pointer ${SECTION.expense.btn}`}
              >
                + Voeg by
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. ANDER ── */}
      <div className="bg-[#FFFBFE] rounded-[28px] border border-[#E7E0EC] overflow-hidden shadow-sm flex flex-col">
        <div className={`${SECTION.ander.header} px-5 py-3.5 flex items-center justify-between`}>
          <h2 className="text-sm font-bold text-[#21005D] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#6750A4]" />
            {SECTION.ander.emoji} Ander
          </h2>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${SECTION.ander.badge}`}>
            {formatRand(totalAnd)}
          </span>
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <SearchSortBar type="ander" placeholder="Soek ander items..." id="ander-search" />

          <div className="item-list max-h-[280px] overflow-y-auto flex flex-col gap-1.5 min-h-[100px]" id="ander-list">
            {processList(anderExpenses, 'ander').length === 0 ? (
              <div className="text-center py-10 text-[#79747E] text-xs italic bg-[#F4EEFF] rounded-2xl border border-dashed border-[#CAC4D0]">
                Geen Ander-items nie.
              </div>
            ) : (
              processList(anderExpenses, 'ander').map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-[#F4EEFF] hover:bg-[#E8DEF8] border border-[#E7E0EC] p-2.5 px-3.5 rounded-full transition group"
                >
                  <div className="flex items-center gap-2 max-w-[130px] truncate">
                    <span className="text-xs font-medium text-[#1C1B1F] truncate" title={item.name}>
                      {item.name}
                    </span>
                    {item.date && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#EADDFF] border border-[#D0BCFF] text-[#625B71] whitespace-nowrap font-medium flex-shrink-0">
                        {formatDateShort(item.date)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.priority === 'Hoog' && (
                      <span className="w-2 h-2 rounded-full bg-[#B3261E] animate-ping flex-shrink-0" />
                    )}
                    {(item.note || (item.photos && item.photos.length > 0)) && (
                      <button
                        onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); onViewDetails(item, rect); }}
                        className="p-1.5 bg-[#EADDFF] hover:bg-[#D0BCFF] text-[#6750A4] rounded-full transition cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                    )}
                    <span className="text-xs font-bold text-[#21005D] bg-[#EADDFF] px-2.5 py-0.5 rounded-full font-mono">
                      {formatRand(item.amount)}
                    </span>
                    <div className="no-print flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => onEditItem('ander', item.id)} className="p-1.5 text-[#79747E] hover:text-[#6750A4] hover:bg-[#EADDFF] rounded-full transition cursor-pointer">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDeleteItem('ander', item.id)} className="p-1.5 text-[#79747E] hover:text-[#B3261E] hover:bg-[#F9DEDC] rounded-full transition cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="no-print mt-auto pt-2 border-t border-[#E7E0EC] flex flex-col gap-2">
            <InputRow
              type="ander"
              nameVal={andName} onNameChange={setAndName}
              amtVal={andAmt} onAmtChange={setAndAmt}
              namePlaceholder="Naam (bv. Klere)" nameId="ander-name" amtId="ander-amt"
            />
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={andDate}
                onChange={(e) => setAndDate(e.target.value)}
                className={`flex-1 px-3 py-2 text-xs font-medium rounded-2xl border outline-none focus:ring-2 transition cursor-pointer ${SECTION.ander.input} text-[#1C1B1F]`}
                id="ander-date"
              />
              <button
                onClick={() => handleAdd('ander')}
                className={`px-4 py-2 text-xs font-bold rounded-full shadow-sm transition cursor-pointer ${SECTION.ander.btn}`}
              >
                + Voeg by
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}