import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, BarChart2, X, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { Income, Expense, AnderExpense, Period, PeriodHistoryRecord } from './types';
import Header from './components/Header';
import PeriodBar from './components/PeriodBar';
import StatsPanel from './components/StatsPanel';
import BudgetTab from './components/BudgetTab';
import HistoryTab from './components/HistoryTab';
import EditModal from './components/EditModal';

export default function App() {
  const formatRand = (v: number) => `R ${Number(v).toFixed(2)}`;

  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [anderExpenses, setAnderExpenses] = useState<AnderExpense[]>([]);
  const [currentPeriod, setCurrentPeriod] = useState<Period | null>(null);
  const [periodHistory, setPeriodHistory] = useState<Record<string, PeriodHistoryRecord>>({});

  // UI States
  const [activeTab, setActiveTab] = useState<'budget' | 'stats' | 'history'>('budget');
  const [fileName, setFileName] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: 'income' | 'expense' | 'ander'; id: string } | null>(null);
  const [popoverDetails, setPopoverDetails] = useState<{ item: any; rect: DOMRect } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => setToastMsg(null), 2500);
  };

  // Load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('budget_v3');
      if (raw) {
        const d = JSON.parse(raw);
        if (d.incomes || d.expenses || d.anderExpenses || d.currentPeriod || d.periodHistory) {
          const mapId = <T extends {}>(arr: T[]): (T & { id: string })[] =>
            (arr || []).map(item => ({ id: (item as any).id || crypto.randomUUID(), ...item }));
          setIncomes(mapId(d.incomes));
          setExpenses(mapId(d.expenses));
          setAnderExpenses(mapId(d.anderExpenses));
          setCurrentPeriod(d.currentPeriod || null);
          setPeriodHistory(d.periodHistory || {});
          return;
        }
      }
    } catch (e) { console.error('Load error:', e); }

    // Demo defaults
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate() - 1);
    const nextStr = `${nextMonth.getFullYear()}-${pad(nextMonth.getMonth() + 1)}-${pad(nextMonth.getDate())}`;
    const MONTHS_AF = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    const pLabel = `${now.getDate()} ${MONTHS_AF[now.getMonth()]} ${now.getFullYear()} – ${nextMonth.getDate()} ${MONTHS_AF[nextMonth.getMonth()]} ${nextMonth.getFullYear()}`;

    setCurrentPeriod({ start: todayStr, end: nextStr, label: pLabel });
    setIncomes([
      { id: crypto.randomUUID(), name: 'Salaris (Demo)', amount: 18500 },
      { id: crypto.randomUUID(), name: 'Vryskut', amount: 3200 }
    ]);
    setExpenses([
      { id: crypto.randomUUID(), name: 'Huur', amount: 6200, date: todayStr, paid: true, category: 'Huur & Verblyf', priority: 'Hoog', note: 'Maandelikse huur vir woonstel.' },
      { id: crypto.randomUUID(), name: 'Kruideniers', amount: 2800, date: todayStr, paid: false, category: 'Kruideniers', priority: 'Medium' },
      { id: crypto.randomUUID(), name: 'Elektrisiteit', amount: 950, date: todayStr, paid: false, category: 'Elektrisiteit & Water', priority: 'Hoog' }
    ]);
    setAnderExpenses([
      { id: crypto.randomUUID(), name: 'Klere', amount: 500, date: todayStr, category: 'Klere' },
      { id: crypto.randomUUID(), name: 'Vermaak', amount: 300, date: todayStr, category: 'Vermaak' }
    ]);
    setPeriodHistory({});
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (incomes.length === 0 && expenses.length === 0 && anderExpenses.length === 0 && Object.keys(periodHistory).length === 0) return;
    try {
      localStorage.setItem('budget_v3', JSON.stringify({ incomes, expenses, anderExpenses, currentPeriod, periodHistory }));
    } catch (e) { console.error('Save error:', e); }
  }, [incomes, expenses, anderExpenses, currentPeriod, periodHistory]);

  const handleSelectPeriod = (start: string, end: string) => {
    const MONTHS_AF = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    const pDate = (dStr: string) => {
      const p = dStr.split('-');
      if (p.length < 3) return dStr;
      return `${parseInt(p[2])} ${MONTHS_AF[parseInt(p[1]) - 1]} ${p[0]}`;
    };
    const key = `${start}__${end}`;
    const overlap = Object.values(periodHistory).find((r: PeriodHistoryRecord) => start <= r.end && end >= r.start) as PeriodHistoryRecord | undefined;
    if (overlap && !window.confirm(`Hierdie tydperk oorvleuel met "${overlap.label}".\n\nIs jy seker jy wil voortgaan?`)) return;

    if (periodHistory[key]) {
      const rec = periodHistory[key];
      setIncomes(rec.incomes.map(i => ({ ...i })));
      setExpenses(rec.expenses.map(i => ({ ...i })));
      setAnderExpenses(rec.anderExpenses.map(i => ({ ...i })));
      setCurrentPeriod({ start, end, label: rec.label });
      showToast(`Tydperk gelaai: ${rec.label}`);
    } else {
      const label = `${pDate(start)} – ${pDate(end)}`;
      setCurrentPeriod({ start, end, label });
      showToast(`Tydperk gestel: ${label}`);
    }
  };

  const handleSavePeriod = () => {
    if (!currentPeriod) return showToast('Kies eers \'n geldige tydperk!');
    const key = `${currentPeriod.start}__${currentPeriod.end}`;
    setPeriodHistory(prev => ({
      ...prev,
      [key]: {
        start: currentPeriod.start, end: currentPeriod.end, label: currentPeriod.label,
        incomes: incomes.map(i => ({ ...i })),
        expenses: expenses.map(i => ({ ...i })),
        anderExpenses: anderExpenses.map(i => ({ ...i })),
        savedAt: new Date().toLocaleString('af-ZA')
      }
    }));
    showToast(`✅ ${currentPeriod.label} opgestoor!`);
  };

  const handleClearPeriodAll = () => {
    if (window.confirm('Alle items in hierdie tydperk skoonmaak?')) {
      setIncomes([]); setExpenses([]); setAnderExpenses([]);
      showToast('🧹 Tydperk data skoongevee!');
    }
  };

  const handleAddItem = (type: 'income' | 'expense' | 'ander', name: string, amount: number, date: string) => {
    const newItem = { id: crypto.randomUUID(), name, amount };
    if (type === 'income') setIncomes(prev => [...prev, newItem]);
    else if (type === 'expense') setExpenses(prev => [...prev, { ...newItem, date, paid: false }]);
    else setAnderExpenses(prev => [...prev, { ...newItem, date }]);
    showToast(`"${name}" bygevoeg`);
  };

  const handleDeleteItem = (type: 'income' | 'expense' | 'ander', id: string) => {
    if (type === 'income') setIncomes(prev => prev.filter(i => i.id !== id));
    else if (type === 'expense') setExpenses(prev => prev.filter(i => i.id !== id));
    else setAnderExpenses(prev => prev.filter(i => i.id !== id));
    showToast('Inskrywing verwyder');
  };

  const handleTogglePaid = (id: string, checked: boolean) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, paid: checked } : exp));
    const target = expenses.find(e => e.id === id);
    if (target) showToast(checked ? `✔ Betaal: ${target.name}` : `⏳ Onbetaal: ${target.name}`);
  };

  const handleLoadHistoryRecord = (key: string) => {
    const rec = periodHistory[key];
    if (!rec) return;
    setIncomes(rec.incomes.map(i => ({ ...i })));
    setExpenses(rec.expenses.map(i => ({ ...i })));
    setAnderExpenses(rec.anderExpenses.map(i => ({ ...i })));
    setCurrentPeriod({ start: rec.start, end: rec.end, label: rec.label });
    setActiveTab('budget');
    showToast(`Herkonfigureer na: ${rec.label}`);
  };

  const handleDeleteHistoryRecord = (key: string) => {
    const rec = periodHistory[key];
    if (window.confirm(`Verwyder "${rec?.label}" permanent?`)) {
      setPeriodHistory(prev => { const next = { ...prev }; delete next[key]; return next; });
      showToast('Rekord uitgevee');
    }
  };

  const handleImportJson = (data: any, name: string) => {
    if (data && (data.incomes || data.expenses || data.anderExpenses)) {
      const mapId = <T extends {}>(arr: T[]): (T & { id: string })[] =>
        (arr || []).map(item => ({ id: (item as any).id || crypto.randomUUID(), ...item }));
      setIncomes(mapId(data.incomes));
      setExpenses(mapId(data.expenses));
      setAnderExpenses(mapId(data.anderExpenses));
      setCurrentPeriod(data.currentPeriod || null);
      setPeriodHistory(data.periodHistory || {});
      setFileName(name);
      showToast(`💾 Gelaai: ${name}`);
    }
  };

  const handleExportJson = () => {
    const data = { incomes, expenses, anderExpenses, currentPeriod, periodHistory, version: '3.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Begroting_${currentPeriod?.label.replace(/\s+/g, '_') || 'Bestand'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('💾 Begroting uitgevoer!');
  };

  const handleEditClick = (type: 'income' | 'expense' | 'ander', id: string) => setEditingItem({ type, id });

  const handleSaveEdit = (updates: any) => {
    if (!editingItem) return;
    const { type, id } = editingItem;
    if (type === 'income') setIncomes(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    else if (type === 'expense') setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    else setAnderExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    setEditingItem(null);
    showToast(`"${updates.name}" opgedateer!`);
  };

  const getEditingDetails = () => {
    if (!editingItem) return null;
    const { type, id } = editingItem;
    const arr = type === 'income' ? incomes : type === 'expense' ? expenses : anderExpenses;
    return arr.find(i => i.id === id) || null;
  };
  const editingDetails = getEditingDetails();

  const totalIncomesPrint = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpensesPrint = expenses.reduce((s, i) => s + i.amount, 0);
  const totalAnderPrint = anderExpenses.reduce((s, i) => s + i.amount, 0);
  const printTotalExpenses = totalExpensesPrint + totalAnderPrint;

  // Bottom nav items
  const NAV_ITEMS = [
    { id: 'budget', label: 'Begroting', icon: <Receipt className="w-5 h-5" /> },
    { id: 'stats', label: 'Statistieke', icon: <BarChart2 className="w-5 h-5" /> },
    { id: 'history', label: 'Geskiedenis', icon: <Calendar className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="min-h-screen bg-[#FFFBFE] text-[#1C1B1F] flex flex-col select-none">
      {/* Material Top App Bar */}
      <Header
        fileName={fileName}
        onImport={handleImportJson}
        onExport={handleExportJson}
        onPrint={() => window.print()}
        onCompact={() => showToast('✨ Organiseer tans...')}
      />

      {/* Period Bar */}
      <PeriodBar
        currentPeriod={currentPeriod}
        onSelectPeriod={handleSelectPeriod}
        onSavePeriod={handleSavePeriod}
        onClearAll={handleClearPeriodAll}
      />

      {/* Main Content — padded for bottom nav */}
      <main className="flex-1 p-4 pb-24 max-w-6xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <BudgetTab
                incomes={incomes}
                expenses={expenses}
                anderExpenses={anderExpenses}
                onAddItem={handleAddItem}
                onDeleteItem={handleDeleteItem}
                onTogglePaid={handleTogglePaid}
                onEditItem={handleEditClick}
                onViewDetails={(item, rect) => setPopoverDetails({ item, rect })}
                onHideDetails={() => setPopoverDetails(null)}
              />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <StatsPanel
                incomes={incomes}
                expenses={expenses}
                anderExpenses={anderExpenses}
                currentPeriod={currentPeriod}
              />
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
            >
              <HistoryTab
                periodHistory={periodHistory}
                onLoadPeriod={handleLoadHistoryRecord}
                onDeletePeriod={handleDeleteHistoryRecord}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Material You Bottom Navigation Bar ── */}
      <nav className="no-print fixed bottom-0 left-0 right-0 bg-[#FFFBFE] border-t border-[#E7E0EC] z-40 flex shadow-[0_-1px_3px_rgba(0,0,0,0.08)]">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-0.5 transition-all duration-200 cursor-pointer ${
                isActive ? 'text-[#6750A4]' : 'text-[#49454F] hover:text-[#6750A4]'
              }`}
            >
              {/* Active indicator pill */}
              <div className={`px-5 py-1 rounded-full transition-all duration-200 ${
                isActive ? 'bg-[#EADDFF]' : 'bg-transparent'
              }`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Detail Popover */}
      <AnimatePresence>
        {popoverDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-[#1C1B1F]/50 flex items-center justify-center p-4 z-50"
            onClick={() => setPopoverDetails(null)}
          >
            <motion.div
              className="bg-[#FFFBFE] max-w-sm w-full rounded-[28px] p-5 shadow-2xl border border-[#E7E0EC] flex flex-col gap-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPopoverDetails(null)}
                className="absolute top-4 right-4 p-2 bg-[#F4EEFF] hover:bg-[#E8DEF8] text-[#49454F] rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 pr-8 border-b border-dashed border-[#E7E0EC] pb-3">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#6750A4] bg-[#EADDFF] px-2.5 py-0.5 rounded-full w-fit">
                  {popoverDetails.item.category || 'Algemene Uitgawe'}
                </span>
                <h4 className="text-base font-bold text-[#1C1B1F] mt-1">{popoverDetails.item.name}</h4>
                {popoverDetails.item.priority === 'Hoog' && (
                  <span className="text-[9px] font-bold text-[#B3261E] bg-[#F9DEDC] border border-[#F2B8B5] px-2 py-0.5 rounded-full w-fit">
                    🔴 Hoë Prioriteit
                  </span>
                )}
              </div>

              {popoverDetails.item.note && (
                <div className="bg-[#F4EEFF] p-3 rounded-2xl border border-[#E7E0EC]">
                  <div className="text-[9px] font-bold text-[#625B71] uppercase tracking-wider mb-1">Nota:</div>
                  <p className="text-xs font-medium text-[#1C1B1F] leading-relaxed whitespace-pre-line">
                    {popoverDetails.item.note}
                  </p>
                </div>
              )}

              {popoverDetails.item.photos && popoverDetails.item.photos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-bold text-[#625B71] uppercase tracking-wider">
                    Aanhangsels ({popoverDetails.item.photos.length}):
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {popoverDetails.item.photos.map((src: string, index: number) => (
                      <a href={src} target="_blank" rel="noreferrer" key={index}
                        className="relative w-16 h-16 rounded-2xl overflow-hidden border border-[#CAC4D0] shadow-sm group cursor-zoom-in">
                        <img src={src} className="w-full h-full object-cover group-hover:scale-105 transition" alt="Kwitansie" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <EditModal
        isOpen={!!editingItem}
        type={editingItem?.type || null}
        name={editingDetails?.name || ''}
        amount={editingDetails?.amount || 0}
        date={(editingDetails as any)?.date || ''}
        category={(editingDetails as any)?.category || ''}
        priority={(editingDetails as any)?.priority || ''}
        note={(editingDetails as any)?.note || ''}
        photos={(editingDetails as any)?.photos || []}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-[#1C1B1F] text-white px-5 py-2.5 rounded-full shadow-2xl font-medium flex items-center gap-1.5 text-xs z-50 pointer-events-none"
            id="toast"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D0BCFF]" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print only */}
      <div className="print-only" id="print-only-block">
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <h1 className="text-xl font-bold">Begrotingsverslag</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tydperk: {currentPeriod?.label || 'Geen'} | Gedruk: {new Date().toLocaleDateString('af-ZA')}
          </p>
        </div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b bg-slate-100 text-slate-800 uppercase tracking-wider text-[10px] text-left">
              <th className="py-2 px-3 border">Tipe</th>
              <th className="py-2 px-3 border">Item</th>
              <th className="py-2 px-3 border">Datum</th>
              <th className="py-2 px-3 border text-right">Bedrag</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2 px-3 border font-bold text-emerald-800">Inkomste</td>
                <td className="py-2 px-3 border">{item.name}</td>
                <td className="py-2 px-3 border">—</td>
                <td className="py-2 px-3 border text-right font-mono text-emerald-800 font-bold">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            {expenses.map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2 px-3 border font-bold text-rose-800">Uitgawe</td>
                <td className="py-2 px-3 border">{item.name} {item.paid ? '(Betaal)' : '(Onbetaal)'}</td>
                <td className="py-2 px-3 border">{item.date || '—'}</td>
                <td className="py-2 px-3 border text-right font-mono text-rose-800 font-bold">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            {anderExpenses.map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2 px-3 border font-bold text-purple-800">Ander</td>
                <td className="py-2 px-3 border">{item.name}</td>
                <td className="py-2 px-3 border">{item.date || '—'}</td>
                <td className="py-2 px-3 border text-right font-mono text-purple-800 font-bold">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-black text-sm">
              <td colSpan={3} className="py-3 px-3 border font-bold">OORSKOT / BALANS</td>
              <td className={`py-3 px-3 border text-right font-mono font-black ${totalIncomesPrint - printTotalExpenses >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatRand(totalIncomesPrint - printTotalExpenses)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}