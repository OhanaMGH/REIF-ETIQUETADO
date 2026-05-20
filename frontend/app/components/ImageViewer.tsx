'use client';

import React, { useState } from 'react';
import { X, Download, Brain, Target, Activity, Loader2, Trash2 } from 'lucide-react';

export default function ImageViewer({ isOpen, onClose, imagen }: any) {
  const [descargando, setDescargando] = useState(false);

  if (!isOpen || !imagen) return null;

  const descargarImagen = async () => {
    setDescargando(true);
    try {
      const link = document.createElement('a');
      link.href = imagen.urlImagen;
      link.download = imagen.nombreOriginal || 'reif-imagen.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error("Error al descargar:", error);
    } finally {
      setDescargando(false);
    }
  };

  const getConfianzaColor = (valor: number) => {
    if (valor >= 0.85) return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', icon: 'text-emerald-500' };
    if (valor >= 0.55) return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-500' };
    return { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: 'text-red-500' };
  };

  const cColores = getConfianzaColor(imagen.confianzaIA || 0);

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 md:p-6 backdrop-blur-md">
      <div className="bg-white w-full max-w-[1300px] rounded-[2rem] overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">

        {/* SECCIÓN IZQUIERDA: IMAGEN CON ICONO DE ELIMINAR FLOTANTE */}
        <div className="bg-slate-50 flex items-center justify-center relative border-b lg:border-b-0 lg:border-r border-gray-100 group">
          <img 
            src={imagen.urlImagen} 
            className="max-h-[50vh] lg:max-h-[85vh] w-full object-contain p-6 drop-shadow-md"
            alt={imagen.nombreOriginal}
          />
          
          {/* ICONO ELIMINAR FLOTANTE */}
          <button 
            onClick={() => {
              if(window.confirm("¿Eliminar esta imagen de REIF?")) {
                console.log("Eliminando ID:", imagen.id);
                onClose();
              }
            }}
            className="absolute top-6 right-6 p-3 bg-white/90 backdrop-blur-sm border border-red-100 rounded-2xl text-red-500 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 active:scale-95"
            title="Eliminar imagen"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* SECCIÓN DERECHA: INFO */}
        <div className="p-8 flex flex-col h-[70vh] lg:h-auto overflow-y-auto">
          
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Detalles de la imagen</h2>
              <p className="text-sm text-slate-400 font-mono mt-1">{imagen.nombreOriginal}</p>
            </div>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full transition-all group">
              <X className="w-6 h-6 text-slate-400 group-hover:rotate-90 transition-transform" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mb-1">Etiqueta</p>
              <p className="text-xl font-bold text-black">{imagen.etiquetaManual || "Sin Categoría"}</p>
            </div>

            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2 mb-3 text-slate-500">
                <Brain className="w-4 h-4" />
                <span className="text-[11px] font-black uppercase tracking-wider">Descripción IA</span>
              </div>
              <p className="text-slate-700 italic text-base leading-relaxed">
                "{imagen.descripcionIA || "Análisis descriptivo pendiente..."}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 mb-1 text-blue-600">
                  <Activity className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Actividad:</span>
                </div>
                <p className="font-bold text-blue-900 text-lg capitalize">{imagen.actividadIA || "N/A"}</p>
              </div>

              <div className={`${cColores.bg} ${cColores.border} p-4 rounded-2xl`}>
                <div className={`flex items-center gap-2 mb-1 ${cColores.icon}`}>
                  <Target className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase">Confianza</span>
                </div>
                <p className={`font-black text-lg ${cColores.text}`}>
                  {imagen.confianzaIA ? `${(imagen.confianzaIA * 100).toFixed(1)}%` : "0%"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-[11px] font-black text-slate-400 mb-3 uppercase tracking-widest">Detección de Objetos</p>
              <div className="flex flex-wrap gap-2">
                {imagen.objetosDetectados && Object.keys(imagen.objetosDetectados).length > 0 ? (
                  Object.entries(imagen.objetosDetectados).map(([clase, cantidad], idx) => (
                    <span key={idx} className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-700 shadow-sm transition-colors cursor-default">
                      {String(clase).toUpperCase()} <span className="text-blue-600 ml-1">x{String(cantidad)}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No se identificaron objetos</span>
                )}
              </div>
            </div>
          </div>

          {/* BOTÓN DESCARGA ÚNICO */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={descargarImagen}
              disabled={descargando}
              className={`w-full py-5 rounded-[1.25rem] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all active:scale-95 ${
                descargando 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white'
              }`}
            >
              {descargando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Descargando...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Descargar Imagen
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}