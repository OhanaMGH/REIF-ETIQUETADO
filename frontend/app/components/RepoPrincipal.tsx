'use client';

import React, { useState, useEffect } from 'react';
import { Search, Upload, CheckCircle2, Tag as TagIcon, Loader2 } from 'lucide-react';
import ModalEtiquetado from './ModalEtiquetado';
import ImageViewer from './ImageViewer';


interface ImagenREIF {
  _id: string;
  urlImagen: string;
  nombreOriginal: string;
  etiquetaManual: string;
  objetosDetectados: Record<string, number>; 
  tipoContexto?: string;
}

export default function RepoPrincipal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagenes, setImagenes] = useState<ImagenREIF[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [imagenSeleccionada, setImagenSeleccionada] = useState<ImagenREIF | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const fetchImagenes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/imagenes');
      if (!response.ok) throw new Error("Error en el servidor");
      const data = await response.json();
      setImagenes(data);
    } catch (error) {
      console.error("Error al cargar REIF:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImagenes();
  }, []);

  const imagenesFiltradas = imagenes.filter((img) => {
  const termino = busqueda.toLowerCase().trim();
  if (!termino) return true;

  
  const coincideEtiqueta = img.etiquetaManual?.toLowerCase().includes(termino);
  const coincideIA = Object.keys(img.objetosDetectados || {}).some(clase =>
    clase.toLowerCase().includes(termino)
  );

  return coincideEtiqueta || coincideIA;
});

  return (
    <div className="flex h-screen bg-gray-50 text-slate-900 font-sans">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por etiqueta o IA (ej: 'elephant', 'persona')..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:bg-blue-700"
          >
            <Upload className="w-4 h-4" /> Subir Imagen
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Galería REIF</h2>
            <p className="text-gray-500 text-sm">Total: {imagenes.length} imágenes</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-96"><Loader2 className="animate-spin text-blue-500 w-10 h-10" /></div>
          ) : imagenesFiltradas.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {imagenesFiltradas.map((img) => (
                <div
                  key={img._id}
                  onClick={() => { setImagenSeleccionada(img); setIsViewerOpen(true); }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="aspect-video relative overflow-hidden bg-gray-100">
                    <img src={img.urlImagen} alt={img.nombreOriginal} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-start gap-2 mb-3">
                      <TagIcon className="w-4 h-4 text-blue-500 mt-0.5" />
                      <h4 className="font-bold text-slate-800 text-sm line-clamp-2">{img.etiquetaManual}</h4>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                      {img.objetosDetectados && Object.keys(img.objetosDetectados).length > 0 ? (
                        Object.entries(img.objetosDetectados).map(([clase, cantidad], idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[9px] font-bold uppercase tracking-wider border border-blue-100"
                          >
                            {String(clase)} x{String(cantidad)}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-gray-400 italic">Sin detecciones</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-500">No se encontraron resultados.</div>
          )}
        </section>
      </main>

      <ModalEtiquetado isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); fetchImagenes(); }} />
      <ImageViewer isOpen={isViewerOpen} onClose={() => setIsViewerOpen(false)} imagen={imagenSeleccionada} />
    </div>
  );
}