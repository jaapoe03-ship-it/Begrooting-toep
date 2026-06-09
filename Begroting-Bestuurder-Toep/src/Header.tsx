import React, { useRef } from 'react';
import { FolderOpen, FileDown, Printer, Sparkles, FolderSync } from 'lucide-react';

interface HeaderProps {
  fileName: string | null;
  onImport: (data: any, name: string) => void;
  onExport: () => void;
  onPrint: () => void;
  onCompact: () => void;
}

export default function Header({ fileName, onImport, onExport, onPrint, onCompact }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target!.result as string);
        onImport(parsed, file.name);
      } catch {
        alert('Kon nie die lêer laai nie. Maak seker dit is \'n geldige begroting JSON-lêer.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="no-print bg-[#6750A4] text-white px-5 pt-12 pb-4 mb-0 shadow-md" id="app-header">
      {/* Material You Top App Bar */}
      <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/15 rounded-2xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
              Begroting Bestuurder
            </h1>
            <p className="text-[11px] text-white/70 font-medium mt-0.5" id="file-path-label">
              {fileName ? `📂 ${fileName}` : '💾 Plaaslike Berging'}
            </p>
          </div>
        </div>

        {/* Action icons — Material icon-button style */}
        <div className="flex items-center gap-1">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          {/* Icon buttons */}
          {[
            { icon: <FolderOpen className="w-5 h-5" />, label: 'Laai', onClick: () => fileInputRef.current?.click(), id: 'hdr-btn-load' },
            { icon: <FileDown className="w-5 h-5" />, label: 'Stoor', onClick: onExport, id: 'hdr-btn-save' },
            { icon: <Printer className="w-5 h-5" />, label: 'Druk', onClick: onPrint, id: 'hdr-btn-print' },
            { icon: <FolderSync className="w-5 h-5" />, label: 'Kompak', onClick: onCompact, id: 'hdr-btn-compact' },
          ].map((btn) => (
            <button
              key={btn.id}
              id={btn.id}
              onClick={btn.onClick}
              title={btn.label}
              className="p-2.5 rounded-full text-white/90 hover:bg-white/15 active:bg-white/25 transition-all duration-150 cursor-pointer flex flex-col items-center gap-0.5"
            >
              {btn.icon}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}