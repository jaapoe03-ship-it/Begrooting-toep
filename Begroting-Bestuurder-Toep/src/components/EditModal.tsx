import React, { useRef, useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles, Trash } from 'lucide-react';

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
  isOpen,
  type,
  name: initialName,
  amount: initialAmount,
  date: initialDate,
  category: initialCategory,
  priority: initialPriority,
  note: initialNote,
  photos: initialPhotos,
  onClose,
  onSave
}: EditModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state values when modal opens or item changes
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
    const remainingSlots = 3 - photos.length;
    if (remainingSlots <= 0) {
      alert('Jy kan maksimaal 3 foto\'s per inskrywing byvoeg!');
      return;
    }

    const filesToRead = files.slice(0, remainingSlots);
    let pending = filesToRead.length;

    filesToRead.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotos(prev => [...prev, event.target!.result as string]);
        }
        pending--;
        if (pending === 0 && files.length > remainingSlots) {
          alert('Sommige foto\'s is oorgeslaan omdat jy reeds maksimum 3 foto\'s bereik het.');
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = ''; // Reset input
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = () => {
    const amt = parseFloat(String(amount));
    if (!name.trim()) {
      alert('Voer asseblief \'n geldige naam in!');
      return;
    }
    onSave({
      name: name.trim(),
      amount: isNaN(amt) || amt < 0 ? 0 : amt,
      date,
      category,
      priority,
      note,
      photos
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" id="editModal">
      <div className="bg-white max-w-lg w-full rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Title */}
        <div className="flex justify-between items-center border-b border-dashed border-slate-100 pb-3">
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
            Wysig item
          </h3>
          <button
            onClick={onClose}
            className="p-1 px-3 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Naam</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-950 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
              placeholder="Naam (bv. Salaris of Kruideniers)"
              id="edit-name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bedrag</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-950 font-semibold font-mono outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150"
                placeholder="Bedrag (R)"
                min="0"
                step="0.01"
                id="edit-amount"
              />
            </div>

            {(type === 'expense' || type === 'ander') && (
              <div className="flex flex-col gap-1" id="edit-date-wrap">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Datum</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-950 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 cursor-pointer"
                  id="edit-date"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Kategorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-950 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 cursor-pointer"
                id="edit-category"
              >
                <option value="">— Geen kategorie —</option>
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

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prioriteit</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-950 font-semibold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 cursor-pointer"
                id="edit-priority"
              >
                <option value="">— Geen —</option>
                <option value="Hoog">🔴 Hoog</option>
                <option value="Medium">🟠 Medium</option>
                <option value="Laag">🟢 Laag</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nota / Omskrywing</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white text-slate-950 font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-150 resize-y min-h-[75px]"
              placeholder="Bv. Winkelwaarborg ingesluit, kwitansie geliasseer..."
              id="edit-note"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fotos / Kwitansies</label>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full" id="edit-photo-count">
                {photos.length} / 3
              </span>
            </div>

            {/* Drop / Select Zone */}
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
              className="border-2 border-dashed border-indigo-100 hover:border-indigo-400 bg-indigo-50/10 hover:bg-indigo-50/30 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
              id="edit-photo-zone"
            >
              <ImageIcon className="w-6 h-6 text-indigo-400 animate-bounce" />
              <div className="text-xs font-semibold text-indigo-900" id="edit-photo-zone-label">
                Click of sleep om foto of kwitansie by te voeg (maks. 3)
              </div>
            </div>

            {/* Photo deck list */}
            {photos.length > 0 && (
              <div className="flex items-center justify-center gap-3 mt-1 flex-wrap bg-slate-50 p-3 rounded-2xl border border-slate-100" id="edit-photo-thumbs">
                {photos.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-sm flex-shrink-0 group">
                    <img src={src} alt={`Attachment ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 bg-white/90 group-hover:bg-rose-50 text-rose-600 border border-transparent shadow hover:scale-105 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold transition cursor-pointer"
                      title="Verwyder foto"
                    >
                      <X className="w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 border-t border-slate-50 pt-4 mt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-slate-500 font-bold hover:text-slate-800 hover:bg-slate-100 transition text-sm cursor-pointer"
          >
            Kanselleer
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-full shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition cursor-pointer"
          >
            Stoor Item
          </button>
        </div>
      </div>
    </div>
  );
}
