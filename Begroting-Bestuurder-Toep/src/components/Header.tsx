import React, { useRef } from 'react';
import { FolderOpen, FileDown, Printer, Sparkles, FolderSync, FileText } from 'lucide-react';
import { motion } from 'motion/react';

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
        const parsed = JSON.parse(event.target.result as string);
        onImport(parsed, file.name);
      } catch (err) {
        alert('Kon nie die lêer laai nie. Maak seker dit is \'n geldige begroting JSON-lêer.');
      }
    };
    reader.readAsText(file);
    // Clear input so same file can be triggered again
    e.target.value = '';
  };

  return (
    <header className="no-print bg-white/80 backdrop-blur-md rounded-3xl border border-slate-100 p-5 mb-5 shadow-xl shadow-slate-100/40" id="app-header">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and File Path Label */}
        <div className="flex items-start gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-indigo-950 bg-clip-text text-transparent">
              Begroting Bestuurder
            </h1>
            <p className="inline-block mt-1 font-medium text-xs text-indigo-900 bg-indigo-50/70 border border-indigo-100/30 px-3 py-1 rounded-full shadow-sm" id="file-path-label">
              {fileName ? `📂 ${fileName}` : '💾 Plaaslike Berging (Opgestoor in blaaier)'}
            </p>
          </div>
        </div>

        {/* Buttons / Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* File Group */}
          <div className="flex items-center bg-slate-50 border border-slate-100 p-1 rounded-2xl gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
              title="Laai begrotingslêer (.json)"
              id="hdr-btn-load"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Laai
            </button>
            <button
              onClick={onExport}
              className="px-3 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
              title="Stoor huidige begroting as .json"
              id="hdr-btn-save"
            >
              <FileDown className="w-3.5 h-3.5" />
              Stoor As
            </button>
          </div>

          <div className="h-6 w-[1px] bg-slate-200/80 mx-1 self-center" />

          {/* Export / Print */}
          <button
            onClick={onPrint}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md hover:shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            id="hdr-btn-print"
          >
            <Printer className="w-3.5 h-3.5" />
            Druk / PDF
          </button>

          <div className="h-6 w-[1px] bg-slate-200/80 mx-1 self-center" />

          {/* Maintenance Group */}
          <button
            onClick={onCompact}
            className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
            title="Spoor ongebruikte foto-data op en verlig berging"
            id="hdr-btn-compact"
          >
            <FolderSync className="w-3.5 h-3.5" />
            Kompakteer
          </button>
        </div>
      </div>
    </header>
  );
}
