import React, { useRef, useState, useEffect } from 'react';
import { X, Image as ImageIcon, Pencil } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  type: 'income' | 'expense' | 'ander' | null;
  name: string;
  amount: number;
  date: string;
  category: string;
  priority: string;
  note: string;
  photos: string[];
  onClose: () => void;
  onSave: (updates: {
    name: string;
    amount: number;
    date: string;
    category: string;
    priority: string;
    note: string;
    photos: string[];
  }) => void;
}

export default function EditModal({
  isOpen, type,
  name: initialName, amount: initialAmount, date: initialDate,
  category: initialCategory, priority: initialPriority,
  note: initialNote, photos: initialPhotos,
  onClose, onSave
}: EditModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setAmount(initialAmount);
      setDate(initialDate || '');
      setCategory(initialCategory || '');
      setPriority(initialPriority || '');
      setNote(initialNote || '');
      setPhotos(initialPhotos ? [...initialPhotos] : []);
    }
  }, [isOpen, initialName, initialAmount, initialDate, initialCategory, initialPriority, initialNote, initialPhotos]);

  if (!isOpen || !type) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const remaining = 3 - photos.length;
    if (remaining <= 0) { alert('Maksimum 3 foto\'s per inskrywing!'); return; }
    const toRead = files.slice(0, remaining);
    let pending = toRead.length;
    toRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) setPhotos(prev => [...prev, ev.target!.result as string]);
        pending--;
        if (pending === 0 && files.length > remaining) alert('Sommige foto\'s oorgeslaan (maks. 3 bereik).');
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleSave = () => {
    const amt = parseFloat(String(amount));
    if (!name.trim()) { alert('Voer asseblief \'n geldige naam in!'); return; }
    onSave({ name: name.trim(), amount: isNaN(amt) || amt < 0 ? 0 : amt, date, category, priority, note, photos });
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border border-[#CAC4D0] bg-[#F4EEFF] focus:bg-white text-[#1C1B1F] font-medium outline-none focus:ring-2 focus:ring-[#6750A4]/25 focus:border-[#6750A4] transition-all duration-150 text-sm";
  const labelCls = "text-xs font-bold text-[#49454F] uppercase tracking-wider mb-1 block";

  return (
    <div
      className="fixed inset-0 bg-[#1C1B1F]/50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in"
      id="editModal"
      onClick={onClose}
    >
      {/* Material You Bottom Sheet on mobile, Dialog on desktop */}
      <div
        className="bg-[#FFFBFE] w-full sm:max-w-lg rounded-t-[28px] sm:rounded-[28px] p-6 shadow-2xl flex flex-col gap-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center sm:hidden mb-1">
          <div className="w-10 h-1 bg-[#CAC4D0] rounded-full" />
        </div>

        {/* Title row */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#1C1B1F] flex items-center gap-2">
            <div className="p-2 bg-[#EADDFF] rounded-2xl">
              <Pencil className="w-4 h-4 text-[#6750A4]" />
            </div>
            Wysig item
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#49454F] hover:bg-[#E7E0EC] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          <div>
            <label className={labelCls}>Naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Bv. Salaris of Kruideniers"
              id="edit-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Bedrag</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={inputCls + " font-mono"}
                placeholder="R 0.00"
                min="0"
                step="0.01"
                id="edit-amount"
              />
            </div>
            {(type === 'expense' || type === 'ander') && (
              <div>
                <label className={labelCls}>Datum</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputCls + " cursor-pointer"}
                  id="edit-date"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls + " cursor-pointer"}
                id="edit-category"
              >
                <option value="">— Geen —</option>
                <option value="Kruideniers">🍏 Kruideniers</option>
                <option value="Huur & Verblyf">🏠 Huur &amp; Verblyf</option>
                <option value="Vervoer">🚗 Vervoer</option>
                <option value="Elektrisiteit & Water">⚡ Elektrisiteit &amp; Water</option>
                <option value="Medies">💊 Medies</option>
                <option value="Versekering">🛡️ Versekering</option>
                <option value="Elektronika">📱 Elektronika</option>
                <option value="Klere">👕 Klere</option>
                <option value="Vermaak">🎭 Vermaak</option>
                <option value="Opvoeding">🏫 Opvoeding</option>
                <option value="Spaargeld">🔑 Spaargeld</option>
                <option value="Ander">📦 Ander</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Prioriteit</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className={inputCls + " cursor-pointer"}
                id="edit-priority"
              >
                <option value="">— Geen —</option>
                <option value="Hoog">🔴 Hoog</option>
                <option value="Medium">🟠 Medium</option>
                <option value="Laag">🟢 Laag</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Nota</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputCls + " resize-y min-h-[80px]"}
              placeholder="Bv. Winkelwaarborg ingesluit, kwitansie geliasseer..."
              id="edit-note"
            />
          </div>

          {/* Photos */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className={labelCls}>Fotos / Kwitansies</label>
              <span className="text-xs font-bold text-[#6750A4] bg-[#EADDFF] px-2.5 py-0.5 rounded-full">
                {photos.length} / 3
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              multiple
              className="hidden"
              id="edit-photo-input"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#CAC4D0] hover:border-[#6750A4] bg-[#F4EEFF] hover:bg-[#E8DEF8] rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center gap-1.5"
            >
              <ImageIcon className="w-6 h-6 text-[#6750A4]" />
              <p className="text-xs font-medium text-[#49454F]">Klik om foto toe te voeg (maks. 3)</p>
            </div>

            {photos.length > 0 && (
              <div className="flex items-center justify-center gap-3 flex-wrap bg-[#F4EEFF] p-3 rounded-2xl border border-[#E7E0EC]">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-2xl overflow-hidden border border-[#CAC4D0] bg-white shadow-sm group">
                    <img src={src} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 bg-white/90 text-[#B3261E] border border-[#F2B8B5] shadow rounded-full w-5 h-5 flex items-center justify-center transition cursor-pointer hover:bg-[#F9DEDC]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action buttons — Material 3 dialog actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-[#E7E0EC]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-[#6750A4] font-bold hover:bg-[#EADDFF] transition text-sm cursor-pointer"
          >
            Kanselleer
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-[#6750A4] hover:bg-[#7965AF] text-white font-bold text-sm rounded-full shadow-sm transition cursor-pointer"
          >
            Stoor
          </button>
        </div>
      </div>
    </div>
  );
}