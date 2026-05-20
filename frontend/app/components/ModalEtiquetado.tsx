'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Upload, ArrowLeft, Loader2, Tag, Brain, Target, Activity, CheckCircle, Info, X } from 'lucide-react';

interface ModalEtiquetadoProps {
  isOpen: boolean;
  onClose: () => void;
}

const capitalizarTexto = (texto: string) => texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : "";

export default function ModalEtiquetado({ isOpen, onClose }: ModalEtiquetadoProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [etiquetaManual, setEtiquetaManual] = useState("");
  const [descripcionIA, setDescripcionIA] = useState("");
  const [actividadIA, setActividadIA] = useState("");
  const [confianzaIA, setConfianzaIA] = useState<number | null>(null);
  const [motivosIA, setMotivosIA] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [deteccionesRaw, setDeteccionesRaw] = useState<Record<string, number>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const traducciones: Record<string, string> = {
    person: "persona", chair: "silla", laptop: "laptop", table: "mesa", book: "libro",
    backpack: "mochila", sports_ball: "balón", cell_phone: "celular", tv: "pantalla",
    monitor: "monitor", keyboard: "teclado", mouse: "mouse"
  };

  const estadoConfianza = useMemo(() => {
    if (confianzaIA === null) return null;
    if (confianzaIA >= 0.85) return { color: "text-emerald-700", bg: "bg-emerald-50" };
    if (confianzaIA >= 0.6) return { color: "text-amber-700", bg: "bg-amber-50" };
    return { color: "text-red-700", bg: "bg-red-50" };
  }, [confianzaIA]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:8000/analizar', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setDescripcionIA(data.descripcion);
        setActividadIA(data.actividad);
        setConfianzaIA(data.confianza);
        setDeteccionesRaw(data.objetos);
        setEtiquetaManual(capitalizarTexto(data.actividad));
        setMotivosIA(data.motivos || []);
      }
    } catch (error) { console.error(error); } finally { setIsAnalyzing(false); }
  };

  const handleGuardar = async () => {
    if (!imagePreview || !etiquetaManual) return;
    setIsSaving(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/guardar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreOriginal: `REIF_${Date.now()}.png`,
          urlImagen: imagePreview,
          etiquetaManual,
          descripcionIA,
          actividadIA,
          confianzaIA: confianzaIA || 0,
          objetosDetectados: deteccionesRaw,
          tipoContexto: (confianzaIA || 0) < 0.2 ? "fuera_contexto" : "institucional"
        }),
      });
      if (res.ok) handleClose();
    } catch (error) { console.error(error); } finally { setIsSaving(false); }
  };

  const handleClose = () => {
    setImagePreview(null); setEtiquetaManual(""); setDescripcionIA("");
    setActividadIA(""); setConfianzaIA(null); setMotivosIA([]); setDeteccionesRaw({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#f5f7fb] z-50 flex flex-col overflow-hidden">
      <header className="h-14 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-6 shrink-0">
        <button onClick={handleClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className="w-full max-w-7xl max-h-[92vh] bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-xl overflow-hidden flex">

          {/* SECCIÓN IZQUIERDA: MONITOR */}
          <div className="flex-[1.2] p-5 flex flex-col gap-3 border-r border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Monitor de Imagen</p>
            <div onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              className={`flex-1 rounded-[1.8rem] border-2 border-dashed overflow-hidden flex items-center justify-center relative transition-all duration-500 ${imagePreview ? 'border-blue-300 bg-white' : 'border-slate-200 bg-[#f8fafc] hover:bg-slate-50 cursor-pointer'}`}>
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img src={imagePreview} alt="Preview" className={`w-full h-full object-cover transition-all duration-700 ${isAnalyzing ? 'blur-xl scale-110 opacity-40' : 'scale-100 opacity-100'}`} />
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                      </div>
                      <p className="mt-3 text-xs text-white font-medium">Analizando imagen</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-600">Click para subir</p>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

            <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl flex gap-3 items-center">

              <p className="text-[12px] text-slate-600 leading-tight">
                <span className="font-bold text-blue-700">Nota:</span> La IA es una herramienta de apoyo. Valida siempre que la descripción coincida con la imagen antes de guardar.
              </p>
            </div>
          </div>

          {/* SECCIÓN DERECHA: DATOS */}
          <div className="flex-1 p-4 flex flex-col gap-3 bg-[#f8fafc]/40 overflow-y-auto">
            {/* DESCRIPCIÓN */}
            <div className="bg-white/80 backdrop-blur-md rounded-[1.2rem] p-4 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-slate-500">
                <Brain className="w-4 h-4" />
                <p className="text-sm font-semibold">Descripción IA</p>
              </div>
              <p className="text-[15px] text-slate-700 leading-relaxed">{descripcionIA ? capitalizarTexto(descripcionIA) : "Esperando imagen..."}</p>
            </div>

            {/* ACTIVIDAD Y CONFIANZA */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-[1.2rem] bg-[#edf4ff] border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-blue-700"><Activity className="w-4 h-4" /><span className="text-xs font-semibold">Actividad</span></div>
                <p className="text-lg font-bold text-slate-800">{actividadIA ? capitalizarTexto(actividadIA) : "—"}</p>
              </div>
              <div className={`p-4 rounded-[1.2rem] ${estadoConfianza?.bg || 'bg-white'}`}>
                <div className="flex items-center gap-2 mb-2 text-slate-500"><Target className="w-4 h-4" /><span className="text-xs font-semibold">Confianza</span></div>
                <p className={`text-xl font-bold ${estadoConfianza?.color || 'text-slate-400'}`}>{confianzaIA !== null ? `${(confianzaIA * 100).toFixed(1)}%` : "0%"}</p>
              </div>
            </div>

            {/* MOTIVOS */}
            <div className="bg-amber-50 rounded-[1.2rem] p-4 border border-amber-100">
              <div className="flex items-center gap-2 mb-3 text-amber-700">
                <Info className="w-4 h-4" />
                <p className="text-xs font-semibold">¿Por qué?</p>
              </div>
              {motivosIA.length > 0 ? (
                <ul className="list-disc ml-5 space-y-2"> {/* <--- Aquí agregamos list-disc y ml-5 */}
                  {motivosIA.map((m, i) => (
                    <li key={i} className="text-[13px] text-amber-900 leading-relaxed">
                      {m} {/* <--- Quitamos el punto manual "•" porque list-disc lo pone solo */}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-amber-900 italic">Los motivos aparecerán tras el análisis.</p>
              )}
            </div>
            {/* OBJETOS DETECTADOS */}
            <div className="bg-white/80 backdrop-blur-md rounded-[1.2rem] p-4 border border-slate-100 shadow-sm h-[115px] flex flex-col">
              <p className="text-sm font-semibold text-slate-400 mb-2">Objetos Detectados</p>
              <div className="flex flex-wrap gap-2 overflow-y-auto">
                {Object.keys(deteccionesRaw).length > 0 ? (
                  Object.entries(deteccionesRaw).map(([obj, cant]) => (
                    <div key={obj} className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px]">
                      {/* Ahora usamos directamente 'obj' ya que viene traducido del backend */}
                      <span className="text-slate-700 capitalize">
                        {obj} <span className="ml-1 text-blue-600 font-semibold">x{cant}</span>
                      </span>
                      <button
                        onClick={() => {
                          const c = { ...deteccionesRaw };
                          delete c[obj];
                          setDeteccionesRaw(c);
                        }}
                      >
                        <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-300 italic">No hay detecciones</span>
                )}
              </div>
            </div>

            {/* GUARDADO */}
            <div className="space-y-3">
              <div className="relative">
                {/* He cambiado text-slate-400 por text-emerald-500 */}
                <Tag className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${etiquetaManual ? 'text-emerald-600' : 'text-emerald-500'}`} />

                <input
                  type="text"
                  value={etiquetaManual}
                  onChange={(e) => setEtiquetaManual(e.target.value)}
                  placeholder="Etiqueta final..."
                  className="w-full bg-white border border-slate-200 rounded-[1rem] pl-11 pr-4 py-2.5 text-sm outline-none focus:border-blue-400"
                />
              </div>
              <button onClick={handleGuardar} disabled={isSaving || isAnalyzing || !imagePreview || !etiquetaManual}
                className={`w-full py-2.5 rounded-[1rem] font-medium text-sm flex items-center justify-center gap-3 transition-all ${isSaving || isAnalyzing || !imagePreview || !etiquetaManual ? 'bg-slate-100 text-slate-400' : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'}`}>
                {isSaving ? <Loader2 className="animate-spin w-4 h-4" /> : "Guardar en REIF"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}