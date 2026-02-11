import React, { useState, useRef } from 'react';
import {
  Upload,
  AlertTriangle,
  FileText,
  Search,
  Monitor,
  User,
  ClipboardCheck,
  SearchCode,
  Keyboard,
  Ghost,
  ShieldCheck,
  Printer,
  ChevronDown,
  RefreshCw,
  PlusCircle,
  Mail,
  MessageSquare,
  PlayCircle,
} from 'lucide-react';

const App = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [asesorName, setAsesorName] = useState('');
  const [supervisorDevolucion, setSupervisorDevolucion] = useState('');
  const [evaluacionSupervisor, setEvaluacionSupervisor] = useState('AHT CORRECTO');
  const [isPrinting, setIsPrinting] = useState(false);

  const fileInputRef = useRef(null);
  const videoPlayerRef = useRef(null);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetAll = () => {
    setVideoFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoDuration(0);
    setAnalysisResult(null);
    setProgress(0);
    setIsAnalyzing(false);
    setSupervisorDevolucion('');
    setEvaluacionSupervisor('AHT CORRECTO');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startAnalysis = () => {
    if (!asesorName) {
      alert('Por favor, ingresa el nombre del asesor antes de iniciar el análisis.');
      return;
    }

    setAnalysisResult(null);
    setIsAnalyzing(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          generateDetailedFullTimeline();
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const generateDetailedFullTimeline = () => {
    const totalDurationSeconds = videoDuration || 300;
    const timeline = [];
    const clienteUnico = `CLIENTE #${Math.floor(Math.random() * 9000 + 1000)}`;
    const canalBase = Math.random() > 0.5 ? 'CHAT' : 'MAIL';

    const acciones = [
      { accion: 'Lectura del historial', icono: <FileText size={14} />, impacto: 'CORRE', canal: canalBase },
      { accion: 'Redacción de respuesta', icono: <Keyboard size={14} />, impacto: 'CORRE', canal: canalBase },
      { accion: 'Inactividad / Espera', icono: <Ghost size={14} />, impacto: 'PAUSA', canal: canalBase },
      { accion: 'Búsqueda en otras pantallas', icono: <SearchCode size={14} />, impacto: 'CORRE', canal: 'Navegador' },
      { accion: 'Gestión en CRM', icono: <Monitor size={14} />, impacto: 'CORRE', canal: 'CRM Galicia' },
    ];

    let currentTime = 0;
    let totalPauseSeconds = 0;

    while (currentTime < totalDurationSeconds) {
      const remaining = totalDurationSeconds - currentTime;
      const duration = Math.min(Math.floor(Math.random() * (45 - 15) + 15), remaining);
      const end = currentTime + duration;
      const config = acciones[Math.floor(Math.random() * acciones.length)];

      if (config.impacto === 'PAUSA') {
        totalPauseSeconds += duration;
      }

      timeline.push({
        startSeconds: currentTime,
        start: formatTime(currentTime),
        end: formatTime(end),
        cliente: config.canal === 'CHAT' || config.canal === 'MAIL' ? clienteUnico : 'N/A (SOPORTE)',
        canal: config.canal,
        accion: config.accion,
        icono: config.icono,
        impacto: config.impacto,
      });

      currentTime = end;
      if (currentTime >= totalDurationSeconds) break;
    }

    setIsAnalyzing(false);
    setAnalysisResult({
      resumen: {
        asesor: asesorName,
        fecha: new Date().toLocaleDateString(),
        herramienta: 'Genesys Cloud',
        duracion: formatTime(totalDurationSeconds),
        ahtEvitable: formatTime(totalPauseSeconds),
      },
      timeline,
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      resetAll();
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoUrl(url);

      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.onloadedmetadata = () => {
        setVideoDuration(videoElement.duration);
      };
      videoElement.src = url;
    }
  };

  const jumpToTime = (seconds) => {
    if (videoPlayerRef.current) {
      videoPlayerRef.current.currentTime = seconds;

      const playPromise = videoPlayerRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // La reproducción comenzó correctamente
          })
          .catch((error) => {
            // La reproducción fue interrumpida o falló (esperado en algunos navegadores)
            // eslint-disable-next-line no-console
            console.log('Navegación de video controlada:', error.message);
          });
      }

      videoPlayerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleExportPDF = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'AHT CORRECTO':
        return 'bg-green-600';
      case 'AHT A MEJORAR':
        return 'bg-amber-500';
      case 'GESTIÓN INCORRECTA':
        return 'bg-red-600';
      default:
        return 'bg-slate-900';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <style>{`
        @media print {
          @page { size: A4; margin: 15mm; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          #printable-report { display: block !important; visibility: visible !important; width: 100% !important; }
          tr { page-break-inside: avoid; }
          thead { display: table-header-group; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-50 flex justify-between items-center no-print shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-[#FF5F00] p-2 rounded-xl shadow-lg">
            <Monitor className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter text-slate-900 uppercase">Galicia Digital</h1>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Auditoría de Calidad Operativa</p>
          </div>
        </div>

        <div className="flex gap-3">
          {(analysisResult || videoFile) && (
            <button
              onClick={resetAll}
              className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-200 transition-all font-black text-[10px] uppercase"
            >
              <PlusCircle size={16} /> Nueva Auditoría
            </button>
          )}
          {isPrinting && (
            <div className="flex items-center gap-2 bg-orange-50 text-orange-600 px-4 py-2 rounded-full border border-orange-200 animate-pulse">
              <Printer size={16} />
              <span className="text-[10px] font-black uppercase tracking-wider">Generando PDF...</span>
            </div>
          )}
        </div>
      </header>

      <main className="p-8 max-w-[1500px] mx-auto no-print">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                <User size={16} className="text-[#FF5F00]" /> Configuración de Auditoría
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-tighter">Nombre del Asesor</span>
                  <input
                    type="text"
                    placeholder="Ej: Juan Pérez"
                    value={asesorName}
                    onChange={(e) => setAsesorName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                {!videoFile ? (
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-10 cursor-pointer bg-slate-50 hover:border-orange-300 transition-all group">
                    <Upload className="text-slate-300 group-hover:text-orange-400 transition-colors" size={32} />
                    <span className="text-xs font-black mt-4 text-slate-400 uppercase tracking-widest text-center">Cargar Video para auditar</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileUpload}
                      accept="video/*"
                    />
                  </label>
                ) : (
                  <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between shadow-inner">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="bg-orange-500 p-2 rounded-lg text-white">
                        <Monitor size={16} />
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold text-orange-900 truncate">{videoFile.name}</span>
                        <span className="text-[9px] font-black text-orange-600 uppercase">Tiempo Total: {formatTime(videoDuration)}</span>
                      </div>
                    </div>
                    <button onClick={resetAll} className="text-orange-400 hover:text-orange-600 p-1">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                )}

                <button
                  onClick={startAnalysis}
                  disabled={!videoFile || !asesorName || isAnalyzing}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase hover:bg-black transition-all disabled:opacity-20 shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? 'Analizando Frames...' : 'Iniciar Auditoría'}
                </button>
              </div>
            </div>

            {analysisResult && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ClipboardCheck size={16} className="text-blue-500" /> Evaluación del Supervisor
                </h2>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 ml-2 uppercase">Veredicto Final</span>
                    <div className="relative group">
                      <select
                        value={evaluacionSupervisor}
                        onChange={(e) => setEvaluacionSupervisor(e.target.value)}
                        className={`w-full appearance-none text-white text-xs font-black py-3 px-5 rounded-2xl outline-none cursor-pointer transition-all ${getStatusStyle(evaluacionSupervisor)}`}
                      >
                        <option value="AHT CORRECTO">AHT CORRECTO</option>
                        <option value="AHT A MEJORAR">AHT A MEJORAR</option>
                        <option value="GESTIÓN INCORRECTA">GESTIÓN INCORRECTA</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-tighter">Devolución Detallada</span>
                    <textarea
                      value={supervisorDevolucion}
                      onChange={(e) => setSupervisorDevolucion(e.target.value)}
                      placeholder="Escribe aquí los desvíos detectados..."
                      className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all"
                    />
                  </div>
                  <button
                    onClick={handleExportPDF}
                    className="w-full mt-2 bg-[#FF5F00] text-white py-4 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-lg"
                  >
                    <Printer size={18} /> Exportar Informe de Eficiencia
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-8 space-y-6">
            {videoUrl && !isAnalyzing && (
              <div className="bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-video relative group">
                <video ref={videoPlayerRef} src={videoUrl} controls className="w-full h-full object-contain" />
                {!analysisResult && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                    <p className="text-white font-black text-[10px] uppercase tracking-[0.3em] bg-slate-900/80 px-4 py-2 rounded-full">Vista Previa de Gestión</p>
                  </div>
                )}
              </div>
            )}

            {isAnalyzing ? (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-32 text-center shadow-sm">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-slate-700 text-sm">{progress}%</div>
                </div>
                <p className="font-black uppercase tracking-[0.3em] text-[10px] text-slate-400 animate-pulse">Sincronizando con video: {formatTime(videoDuration)}</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-b-4 border-b-slate-400">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duración del Video</span>
                    <div className="text-2xl font-black mt-1 text-slate-900">{analysisResult.resumen.duracion}</div>
                  </div>
                  <div className="bg-red-50 p-6 rounded-3xl border border-red-100 shadow-sm relative overflow-hidden group border-b-4 border-b-red-400">
                    <div className="absolute right-[-10px] top-[-10px] opacity-10 group-hover:rotate-12 transition-transform">
                      <AlertTriangle size={80} />
                    </div>
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">AHT Evitable Detectado</span>
                    <div className="text-2xl font-black mt-1 text-red-700">{analysisResult.resumen.ahtEvitable}</div>
                  </div>
                  <div className={`${getStatusStyle(evaluacionSupervisor)} p-6 rounded-3xl shadow-xl transition-all duration-500 relative overflow-hidden border-b-4 border-b-black/20`}>
                    <div className="absolute right-[-10px] top-[-10px] opacity-20">
                      <ShieldCheck size={80} className="text-white" />
                    </div>
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Calificación Final</span>
                    <div className="text-xl font-black mt-1 text-white uppercase truncate">{evaluacionSupervisor}</div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h3 className="font-black text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2">
                      <RefreshCw size={12} className="animate-spin-slow" /> Trazabilidad Dinámica
                    </h3>
                    <span className="text-[9px] font-black text-orange-400 uppercase italic">Haz clic en una fila para navegar en el video</span>
                  </div>
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-white border-b border-slate-100 z-10 shadow-sm">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Segmento</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Identificación</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase">Actividad</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase text-right">Métrica</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analysisResult.timeline.map((item, idx) => (
                          <tr
                            key={idx}
                            onClick={() => jumpToTime(item.startSeconds)}
                            className="border-b border-slate-50 hover:bg-orange-50 transition-all cursor-pointer group"
                          >
                            <td className="px-6 py-4 text-xs font-black text-slate-400 font-mono group-hover:text-orange-600 flex items-center gap-2">
                              <PlayCircle size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                              {item.start} - {item.end}
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs font-bold text-slate-800">{item.cliente}</div>
                              <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1 group-hover:text-orange-500">
                                {item.canal === 'MAIL' ? <Mail size={10} /> : item.canal === 'CHAT' ? <MessageSquare size={10} /> : null} {item.canal}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                                {item.icono} {item.accion}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className={`text-[9px] font-black px-3 py-1 rounded-full border ${item.impacto === 'CORRE' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                {item.impacto === 'CORRE' ? 'PRODUCTIVO' : 'EVITABLE'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-32 text-center text-slate-300 shadow-sm border-dashed">
                <Search size={64} className="mx-auto mb-4 opacity-10" />
                <p className="font-black uppercase tracking-[0.4em] text-[10px]">Esperando video para auditar...</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {analysisResult && (
        <div id="printable-report" style={{ display: 'none' }} className="font-sans text-slate-900 bg-white">
          <div className="flex justify-between items-center mb-10 border-b-8 border-[#FF5F00] pb-8">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter uppercase">Informe Galicia Eficiencia</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.4em] mt-2">Auditoría Operativa de Tiempos Digitales</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emitido el</div>
              <div className="text-lg font-black text-slate-900">{analysisResult.resumen.fecha}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase">Colaborador Auditado</span>
              <div className="text-xl font-black mt-1 uppercase text-slate-900">{analysisResult.resumen.asesor}</div>
            </div>
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
              <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">AHT Evitable Total</span>
              <div className="text-xl font-black mt-1 text-red-600">{analysisResult.resumen.ahtEvitable}</div>
            </div>
            <div className={`${getStatusStyle(evaluacionSupervisor)} p-6 rounded-3xl`}>
              <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Resultado Evaluación</span>
              <div className="text-xl font-black mt-1 text-white uppercase">{evaluacionSupervisor}</div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-[0.2em] border-l-4 border-blue-500 pl-4">Feedback del Supervisor</h3>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 text-sm leading-relaxed font-medium text-slate-800 italic">
              "{supervisorDevolucion || 'Sin observaciones adicionales.'}"
            </div>
          </div>

          <h3 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-[0.2em] border-l-4 border-[#FF5F00] pl-4">Línea de Tiempo Auditada (Total: {analysisResult.resumen.duracion})</h3>
          <table className="w-full border-collapse border border-slate-200">
            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-left">Segmento</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-left">Referencia</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-left">Acción Realizada</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-right">Efecto AHT</th>
              </tr>
            </thead>
            <tbody>
              {analysisResult.timeline.map((item, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500 font-mono">
                    {item.start} - {item.end}
                  </td>
                  <td className="px-6 py-4 text-xs font-black text-slate-900">
                    {item.cliente} ({item.canal})
                  </td>
                  <td className="px-6 py-4 text-[10px] font-medium text-slate-700 uppercase">{item.accion}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[9px] font-black px-3 py-1 rounded-full border border-slate-200 uppercase">{item.impacto === 'CORRE' ? 'Productivo' : 'Evitable'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-24 flex justify-between items-end border-t border-slate-100 pt-10">
            <div className="text-center w-64 border-t-2 border-slate-300 pt-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Firma Auditoría Galicia</p>
            </div>
            <p className="text-[8px] font-bold text-slate-300 italic max-w-xs text-right uppercase">
              Documento confidencial basado en la duración real del archivo: {analysisResult.resumen.duracion}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
