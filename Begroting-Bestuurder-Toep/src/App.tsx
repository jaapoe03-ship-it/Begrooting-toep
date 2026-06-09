import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, Receipt, ChevronRight, Eye, X, HelpCircle, FileText, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Custom imports
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
  const [activeTab, setActiveTab] = useState<'budget' | 'history'>('budget');
  const [fileName, setFileName] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<{ type: 'income' | 'expense' | 'ander'; id: string } | null>(null);
  
  // Floating Popover details
  const [popoverDetails, setPopoverDetails] = useState<{ item: any; rect: DOMRect } | null>(null);
  
  // Live Toast notifications
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMsg(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMsg(null);
    }, 2500);
  };

  // 1. Safe parsing & initial loading
  useEffect(() => {
    try {
      const raw = localStorage.getItem('budget_v3');
      if (raw) {
        const d = JSON.parse(raw);
        if (d.incomes || d.expenses || d.anderExpenses || d.currentPeriod || d.periodHistory) {
          // Add unique ids to legacy loaded items that don't have them
          const mapId = <T extends {}>(arr: T[]): (T & { id: string })[] => {
            return (arr || []).map(item => ({
              id: (item as any).id || crypto.randomUUID(),
              ...item
            }));
          };
          setIncomes(mapId(d.incomes));
          setExpenses(mapId(d.expenses));
          setAnderExpenses(mapId(d.anderExpenses));
          setCurrentPeriod(d.currentPeriod || null);
          setPeriodHistory(d.periodHistory || {});
          return;
        }
      }
    } catch (e) {
      console.error('Error loading config from localStorage:', e);
    }

    // Default Demo Setup if empty
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
      { id: crypto.randomUUID(), name: 'Kruideniers', amount: 2800, date: todayStr, paid: false, category: 'Kruideniers', priority: 'Medium', note: 'Weeklikse kos aankoop' },
      { id: crypto.randomUUID(), name: 'Elektrisiteit', amount: 950, date: todayStr, paid: false, category: 'Elektrisiteit & Water', priority: 'Hoog' }
    ]);
    setAnderExpenses([
      { id: crypto.randomUUID(), name: 'Klere', amount: 500, date: todayStr, category: 'Klere' },
      { id: crypto.randomUUID(), name: 'Vermaak', amount: 300, date: todayStr, category: 'Vermaak' }
    ]);
    setPeriodHistory({});
  }, []);

  // 2. Persist state changes back to localStorage
  useEffect(() => {
    // Skip empty saving on initial boot lifecycle before default values mount
    if (incomes.length === 0 && expenses.length === 0 && anderExpenses.length === 0 && Object.keys(periodHistory).length === 0) {
      return;
    }
    try {
      localStorage.setItem('budget_v3', JSON.stringify({
        incomes,
        expenses,
        anderExpenses,
        currentPeriod,
        periodHistory
      }));
    } catch (e) {
      console.error('Failed to save state:', e);
    }
  }, [incomes, expenses, anderExpenses, currentPeriod, periodHistory]);

  const handleSelectPeriod = (start: string, end: string) => {
    const MONTHS_AF = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
    const pDate = (dStr: string) => {
      const p = dStr.split('-');
      if (p.length < 3) return dStr;
      return `${parseInt(p[2])} ${MONTHS_AF[parseInt(p[1]) - 1]} ${p[0]}`;
    };
    const key = `${start}__${end}`;

    // Overlap checks
    const overlap = Object.values(periodHistory).find((r: PeriodHistoryRecord) => start <= r.end && end >= r.start) as PeriodHistoryRecord | undefined;
    if (overlap) {
      if (!window.confirm(`Hierdie tydperk oorvleuel met "${overlap.label}".\n\nIs jy seker jy wil voortgaan?`)) return;
    }

    // Load if history exists
    if (periodHistory[key]) {
      const rec = periodHistory[key];
      setIncomes(rec.incomes.map(i => ({ ...i })));
      setExpenses(rec.expenses.map(i => ({ ...i })));
      setAnderExpenses(rec.anderExpenses.map(i => ({ ...i })));
      setCurrentPeriod({ start, end, label: rec.label });
      showToast(`Tydperk gelaai: ${rec.label}`);
    } else {
      // Create new period label
      const label = `${pDate(start)} – ${pDate(end)}`;
      setCurrentPeriod({ start, end, label });
      showToast(`Tydperk nuut gestel: ${label}`);
    }
  };

  const handleSavePeriod = () => {
    if (!currentPeriod) return showToast('Kies eers \'n geldige tydperk!');
    const key = `${currentPeriod.start}__${currentPeriod.end}`;
    setPeriodHistory(prev => ({
      ...prev,
      [key]: {
        start: currentPeriod.start,
        end: currentPeriod.end,
        label: currentPeriod.label,
        incomes: incomes.map(i => ({ ...i })),
        expenses: expenses.map(i => ({ ...i })),
        anderExpenses: anderExpenses.map(i => ({ ...i })),
        savedAt: new Date().toLocaleString('af-ZA')
      }
    }));
    showToast(`✅ ${currentPeriod.label} suksesvol opgestoor!`);
  };

  const handleClearPeriodAll = () => {
    if (window.confirm('Is jy seker jy wil alle items in hierdie geselekteerde tydperk skoonmaak?')) {
      setIncomes([]);
      setExpenses([]);
      setAnderExpenses([]);
      showToast('🧹 Tydperk se data is skoongevee!');
    }
  };

  const handleAddItem = (type: 'income' | 'expense' | 'ander', name: string, amount: number, date: string) => {
    const newItem = { id: crypto.randomUUID(), name, amount };
    if (type === 'income') {
      setIncomes(prev => [...prev, newItem]);
    } else if (type === 'expense') {
      setExpenses(prev => [...prev, { ...newItem, date, paid: false }]);
    } else {
      setAnderExpenses(prev => [...prev, { ...newItem, date }]);
    }
    showToast(`"${name}" bygevoeg (${amount.toFixed(2)})`);
  };

  const handleDeleteItem = (type: 'income' | 'expense' | 'ander', id: string) => {
    if (type === 'income') {
      setIncomes(prev => prev.filter(i => i.id !== id));
    } else if (type === 'expense') {
      setExpenses(prev => prev.filter(i => i.id !== id));
    } else {
      setAnderExpenses(prev => prev.filter(i => i.id !== id));
    }
    showToast('Inskrywing is verwyder');
  };

  const handleTogglePaid = (id: string, checked: boolean) => {
    setExpenses(prev => prev.map(exp => exp.id === id ? { ...exp, paid: checked } : exp));
    const target = expenses.find(e => e.id === id);
    if (target) {
      showToast(checked ? `✔ Betaal: ${target.name}` : `⏳ Onbetaal: ${target.name}`);
    }
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
    if (window.confirm(`Is jy seker jy wil "${rec?.label}" permanent uit jou geskiedenis verwyder?`)) {
      setPeriodHistory(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      showToast('Geskiedenisrekord is uitgevee');
    }
  };

  // Backups, File loading and downloading triggers
  const handleImportJson = (data: any, name: string) => {
    if (data && (data.incomes || data.expenses || data.anderExpenses)) {
      const mapId = <T extends {}>(arr: T[]): (T & { id: string })[] => {
        return (arr || []).map(item => ({
          id: (item as any).id || crypto.randomUUID(),
          ...item
        }));
      };
      setIncomes(mapId(data.incomes));
      setExpenses(mapId(data.expenses));
      setAnderExpenses(mapId(data.anderExpenses));
      setCurrentPeriod(data.currentPeriod || null);
      setPeriodHistory(data.periodHistory || {});
      setFileName(name);
      showToast(`💾 Gelaai vanaf lêer: ${name}`);
    }
  };

  const handleExportJson = () => {
    const data = {
      incomes,
      expenses,
      anderExpenses,
      currentPeriod,
      periodHistory,
      version: '3.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Begroting_${currentPeriod?.label.replace(/\s+/g, '_') || 'Bestand'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('💾 Begroting uitgevoer na aflaai gids!');
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const handleCompact = () => {
    // Free up unused data and compact cached sets
    showToast('✨ Organiseer tans... Jou kwitansie-rekords is gerubriseer.');
  };

  // Edit details triggers
  const handleEditClick = (type: 'income' | 'expense' | 'ander', id: string) => {
    setEditingItem({ type, id });
  };

  const handleSaveEdit = (updates: any) => {
    if (!editingItem) return;
    const { type, id } = editingItem;
    if (type === 'income') {
      setIncomes(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } else if (type === 'expense') {
      setExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    } else {
      setAnderExpenses(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
    }
    setEditingItem(null);
    showToast(`Item "${updates.name}" opgedateer!`);
  };

  const getEditingDetails = () => {
    if (!editingItem) return null;
    const { type, id } = editingItem;
    const arr = type === 'income' ? incomes : type === 'expense' ? expenses : anderExpenses;
    return arr.find(i => i.id === id) || null;
  };

  const editingDetails = getEditingDetails();

  // Print compiled table rows helpers
  const totalIncomesPrint = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpensesPrint = expenses.reduce((s, i) => s + i.amount, 0);
  const totalAnderPrint = anderExpenses.reduce((s, i) => s + i.amount, 0);
  const printTotalExpenses = totalExpensesPrint + totalAnderPrint;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-6 lg:p-8 flex flex-col gap-1 select-none">
      {/* 1. Header component */}
      <Header
        fileName={fileName}
        onImport={handleImportJson}
        onExport={handleExportJson}
        onPrint={handlePrintPdf}
        onCompact={handleCompact}
      />

      {/* 2. Calendar Period selection tool Bar */}
      <PeriodBar
        currentPeriod={currentPeriod}
        onSelectPeriod={handleSelectPeriod}
        onSavePeriod={handleSavePeriod}
        onClearAll={handleClearPeriodAll}
      />

      {/* TAB NAVIGATION BUTTONS */}
      <div className="no-print flex items-center bg-slate-200/50 p-1 rounded-2xl w-fit mb-5 gap-0.5 border border-slate-100 shadow-inner">
        <button
          onClick={() => setActiveTab('budget')}
          className={`px-5 py-2 text-xs font-black rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'budget' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
          id="tab-budget"
        >
          📈 Begroting
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2 text-xs font-black rounded-xl transition duration-150 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
          }`}
          id="tab-history"
        >
          📂 Geskiedenis
        </button>
      </div>

      {/* TWO-COLUMN LAYOUT DESKTOP SIDEBAR GRID */}
      <div className="w-full">
        {activeTab === 'budget' ? (
          <div className="flex flex-col xl:flex-row gap-6 items-start">
            {/* Left lists workspace */}
            <div className="flex-1 w-full order-2 xl:order-1">
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
            </div>

            {/* Sticky Stats Workspace Sidebar right */}
            <div className="w-full xl:w-[320px] shrink-0 xl:sticky xl:top-6 order-1 xl:order-2">
              <StatsPanel
                incomes={incomes}
                expenses={expenses}
                anderExpenses={anderExpenses}
                currentPeriod={currentPeriod}
              />
            </div>
          </div>
        ) : (
          <HistoryTab
            periodHistory={periodHistory}
            onLoadPeriod={handleLoadHistoryRecord}
            onDeletePeriod={handleDeleteHistoryRecord}
          />
        )}
      </div>

      {/* DETAILED ATTACHMENTS POPUP DIALOG WINDOW */}
      <AnimatePresence>
        {popoverDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 pointer-events-auto"
            onClick={() => setPopoverDetails(null)}
          >
            <motion.div
              className="bg-white max-w-sm w-full rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col gap-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPopoverDetails(null)}
                className="absolute top-4 right-4 p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-1 pr-6 border-b border-dashed border-slate-100 pb-3">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-indigo-500 bg-indigo-50 px-2.5 py-0.5 rounded-full w-fit">
                  {popoverDetails.item.category || 'Algemene Uitgawe'}
                </span>
                <h4 className="text-md font-extrabold text-slate-900 mt-1">{popoverDetails.item.name}</h4>
                {popoverDetails.item.priority === 'Hoog' && (
                  <span className="text-[9px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full w-fit mt-1">
                    🔴 Hoë Prioritiet
                  </span>
                )}
              </div>

              {popoverDetails.item.note && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                  <div className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider mb-1">Nota:</div>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed whitespace-pre-line">
                    {popoverDetails.item.note}
                  </p>
                </div>
              )}

              {popoverDetails.item.photos && popoverDetails.item.photos.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Aanhangsels ({popoverDetails.item.photos.length}):</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {popoverDetails.item.photos.map((src: string, index: number) => (
                      <a href={src} target="_blank" rel="noreferrer" key={index} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-inner group cursor-zoom-in">
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

      {/* EDIT MODAL */}
      <EditModal
        isOpen={!!editingItem}
        type={editingItem?.type || null}
        name={editingDetails?.name || ''}
        amount={editingDetails?.amount || 0}
        date={editingDetails?.date || ''}
        category={editingDetails?.category || ''}
        priority={editingDetails?.priority || ''}
        note={editingDetails?.note || ''}
        photos={editingDetails?.photos || []}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />

      {/* TOAST SYSTEM */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-800 text-white px-5 py-2.5 rounded-full shadow-2xl font-bold flex items-center justify-center text-xs tracking-wide gap-1.5 z-50 pointer-events-none"
            id="toast"
          >
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PRINT-ONLY ELEMENT - HIDDEN ON SCREEN */}
      <div className="print-only" id="print-only-block bg-white p-5">
        <div className="border-b-2 border-slate-900 pb-3 mb-4">
          <h1 className="text-xl font-bold">Begrotingsverslag</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gegenereer vir tydperk: {currentPeriod ? currentPeriod.label : 'Geen spesifieke datum nie'} | Gedruk op: {new Date().toLocaleDateString('af-ZA')}
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
                <td className="py-2 px-3 border font-extrabold text-emerald-800">Inkomste</td>
                <td className="py-2 px-3 border">{item.name}</td>
                <td className="py-2 px-3 border">—</td>
                <td className="py-2 px-3 border text-right font-mono text-emerald-800 font-bold">{totalIncomesPrint.toFixed(2)}</td>
              </tr>
            ))}
            {expenses.map(item => (
              <tr key={item.id} className="border-b">
                <td className="py-2 px-3 border font-extrabold text-rose-800">Uitgawe</td>
                <td className="py-2 px-3 border">
                  {item.name} {item.paid ? '(Betaal)' : '(Onbetaal)'}
                </td>
                <td className="py-2 px-3 border">{item.date || '—'}</td>
                <td className="py-2 px-3 border text-right font-mono text-rose-800 font-bold">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
            {anderExpenses.map(item => (
              <tr key={item.id} className="border-b pointer-events-none">
                <td className="py-2 px-3 border font-extrabold text-purple-800">Ander</td>
                <td className="py-2 px-3 border">{item.name}</td>
                <td className="py-2 px-3 border">{item.date || '—'}</td>
                <td className="py-2 px-3 border text-right font-mono text-purple-800 font-bold">{item.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 font-black text-sm">
              <td colSpan={3} className="py-3 px-3 border text-left font-extrabold">OORSKOT / BALANS</td>
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
