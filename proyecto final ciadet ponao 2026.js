import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  User, 
  Activity, 
  Database, 
  Cpu, 
  AlertTriangle, 
  Camera, 
  Server,
  Maximize2,
  Lock,
  RefreshCw,
  Eye,
  Search,
  Scan,
  Zap,
  ChevronRight,
  Fingerprint
} from 'lucide-react';

const App = () => {
  const videoRef = useRef(null);
  const [streamActive, setStreamActive] = useState(false);
  const [detectedSubject, setDetectedSubject] = useState(null);
  const [boxPos, setBoxPos] = useState({ x: 20, y: 20, w: 220, h: 280 });
  const [logs, setLogs] = useState([]);
  const [isAlert, setIsAlert] = useState(false);
  const [metrics, setMetrics] = useState({ cpu: 24, mem: 1.1 });
  const [uptime, setUptime] = useState(0);

  // Registro Civil y Base de Datos de Seguridad de Aeropuerto (Datos Realistas)
  const subjects = [
    { 
      id: "MX-7721-B", 
      nombre: "CARLOS ALBERTO MENDEZ RUIZ", 
      dob: "14/MAR/1985",
      rango: "CIUDADANO / PASAJERO", 
      riesgo: "NIVEL_01 (SEGURO)", 
      nacionalidad: "MÉXICO", 
      doc: "PASAPORTE: G9921003",
      visa: "B1/B2 ACTIVA",
      lastCheck: "CIUDAD DE MÉXICO - TERMINAL 1",
      authCode: "AUTH-992-DELTA"
    },
    { 
      id: "IT-4402-A", 
      nombre: "ELENA GIOVANNA ROSSI", 
      dob: "02/ENE/1992",
      rango: "CREW / COMERCIAL", 
      riesgo: "NIVEL_02 (OBSERVACIÓN)", 
      nacionalidad: "ITALIA", 
      doc: "ID_CREW: AZ-44211",
      visa: "TRÁNSITO C-1",
      lastCheck: "ROMA FIUMICINO - SECTOR C",
      authCode: "AUTH-112-BRAVO"
    },
    { 
      id: "ERR-99X-Ω", 
      nombre: "--- NO REGISTRADO / ANÓNIMO ---", 
      dob: "XX/XX/XXXX",
      rango: "DESCONOCIDO", 
      riesgo: "NIVEL_05 (CRÍTICO)", 
      nacionalidad: "INDETERMINADA", 
      doc: "SIN DOCUMENTACIÓN DETECTADA",
      visa: "NO AUTORIZADO",
      lastCheck: "SIN REGISTRO PREVIO",
      authCode: "DENIED-LOCKDOWN"
    }
  ];

  const addLog = (msg, type) => {
    setLogs(prev => [{ time: new Date().toLocaleTimeString(), msg, type }, ...prev].slice(0, 15));
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
        addLog("NODO DE CAPTURA 01-B CONECTADO AL SERVIDOR CENTRAL.", "info");
      }
    } catch (err) {
      addLog("FALLO CRÍTICO DE HARDWARE: DISPOSITIVO NO ENCONTRADO.", "err");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setUptime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Motor de Seguimiento de Perímetro (Trayectoria de Escaneo Humano)
  useEffect(() => {
    let frameId;
    let angle = 0;
    
    const trackObject = () => {
      if (streamActive) {
        angle += 0.015;
        const targetX = 35 + Math.sin(angle) * 30;
        const targetY = 30 + Math.cos(angle * 0.8) * 20;

        setBoxPos(prev => ({
          x: targetX,
          y: targetY,
          w: 230 + Math.sin(angle * 2) * 15,
          h: 300 + Math.cos(angle * 2) * 15
        }));

        setMetrics({
          cpu: 45 + Math.floor(Math.random() * 10),
          mem: (1.4 + Math.random() * 0.2).toFixed(1)
        });
      }
      frameId = requestAnimationFrame(trackObject);
    };
    trackObject();
    return () => cancelAnimationFrame(frameId);
  }, [streamActive]);

  useEffect(() => {
    if (!streamActive) return;
    const rotateIdentity = () => {
      const sub = subjects[Math.floor(Math.random() * subjects.length)];
      setDetectedSubject(sub);
      setIsAlert(sub.riesgo.includes('CRÍTICO'));
      addLog(`EXTRACCIÓN DE METADATOS: ${sub.id}`, sub.riesgo.includes('CRÍTICO') ? 'err' : 'info');
      setTimeout(rotateIdentity, 7000);
    };
    const initialDelay = setTimeout(rotateIdentity, 2000);
    return () => clearTimeout(initialDelay);
  }, [streamActive]);

  return (
    <div className="min-h-screen bg-[#050505] text-[#d1d5db] font-mono flex flex-col p-4 overflow-hidden select-none border-4 border-[#1a1a1a]">
      
      {/* HEADER TÁCTICO MIGRATORIO */}
      <header className="flex justify-between items-center border-b border-[#333] pb-4 mb-4 bg-black/40 p-2">
        <div className="flex items-center gap-5">
          <div className="bg-[#111] border border-[#333] p-2 flex flex-col items-center">
             <Fingerprint size={28} className="text-blue-500 mb-1" />
             <span className="text-[8px] font-bold text-blue-500">BIO_ID</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-[0.2em] text-white">
              SISTEMA DE CONTROL FRONTERIZO <span className="text-blue-600">S-X 3.0</span>
            </h1>
            <div className="flex gap-4 items-center">
               <span className="text-[9px] text-[#555] font-bold">TERMINAL: 4-NORD</span>
               <span className="text-[9px] text-[#555] font-bold">SERVIDOR: LOCAL_SEC_HUB</span>
               <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[9px] text-emerald-500">RED_ACTIVA</span>
               </div>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4 items-center">
          {!streamActive && (
            <button 
              onClick={startCamera}
              className="bg-[#1a1a1a] border border-[#444] hover:border-blue-500 text-white px-5 py-2 text-xs font-bold transition-all flex items-center gap-3 group"
            >
              <Camera size={16} className="group-hover:text-blue-500" /> VINCULAR SENSORES
            </button>
          )}
          <div className="bg-[#111] px-4 py-1 border border-[#222] text-right">
            <p className="text-[8px] text-[#555]">REGISTRO_UPTIME</p>
            <p className="text-xs font-bold text-white tracking-widest uppercase">
              {Math.floor(uptime/60).toString().padStart(2, '0')}:{ (uptime % 60).toString().padStart(2, '0') }
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* VIDEO FEED CON PANEL DE CAMPO */}
        <section className="col-span-12 lg:col-span-9 flex flex-col gap-4 relative">
          <div className="relative flex-1 bg-black border-2 border-[#222] overflow-hidden group">
            
            {/* HUD OVERLAY */}
            <div className="absolute inset-0 z-20 pointer-events-none p-4">
              {/* Retículo de cámara profesional */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 opacity-10">
                 <div className="absolute top-0 left-0 w-full h-px bg-white"></div>
                 <div className="absolute top-0 left-0 w-px h-full bg-white"></div>
                 <div className="absolute top-1/2 left-0 w-full h-px bg-white opacity-40"></div>
                 <div className="absolute top-0 left-1/2 w-px h-full bg-white opacity-40"></div>
              </div>

              {/* CUADRO DE ESCANEO Y PANEL DE DATOS REALES */}
              {streamActive && detectedSubject && (
                <div 
                  className="absolute transition-all duration-75 flex gap-0"
                  style={{ 
                    left: `${boxPos.x}%`, 
                    top: `${boxPos.y}%`,
                  }}
                >
                  {/* Bounding Box Técnico */}
                  <div 
                    className={`border relative ${isAlert ? 'border-red-600' : 'border-blue-600/50'}`}
                    style={{ width: `${boxPos.w}px`, height: `${boxPos.h}px` }}
                  >
                    <div className={`absolute top-0 left-0 bg-black/80 px-2 py-0.5 text-[8px] font-bold border-b border-r ${isAlert ? 'border-red-600 text-red-500' : 'border-blue-600 text-blue-400'}`}>
                       TARGET_LOCK: {detectedSubject.id}
                    </div>
                    {/* Crosshairs corners */}
                    <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-current opacity-60"></div>
                    <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-current opacity-60"></div>
                  </div>

                  {/* FICHA TÉCNICA DE CAMPO (A LADO DEL ROSTRO) */}
                  <div className={`w-72 bg-black/90 border border-[#333] border-l-0 p-4 self-start animate-in fade-in zoom-in-95 duration-200`}>
                     <div className="flex justify-between items-center mb-3 border-b border-[#333] pb-2">
                        <span className="text-[10px] font-black text-white/40">DATO_REGISTRAL_MIGRATORIO</span>
                        <div className={`text-[9px] font-bold ${isAlert ? 'text-red-600' : 'text-blue-500'}`}>{detectedSubject.authCode}</div>
                     </div>
                     
                     <div className="space-y-3">
                        <div className="border-l-2 border-blue-600 pl-3">
                          <p className="text-[7px] text-slate-600 uppercase font-bold">Nombre Completo del Ciudadano</p>
                          <p className="text-sm font-black text-white leading-tight uppercase">{detectedSubject.nombre}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                          <div>
                            <p className="text-[7px] text-slate-600 uppercase font-bold">Fecha de Nacimiento</p>
                            <p className="text-[10px] font-bold text-slate-200">{detectedSubject.dob}</p>
                          </div>
                          <div>
                            <p className="text-[7px] text-slate-600 uppercase font-bold">País de Emisión</p>
                            <p className="text-[10px] font-bold text-slate-200">{detectedSubject.nacionalidad}</p>
                          </div>
                          <div className="col-span-2 bg-[#111] p-1.5 border border-[#222]">
                            <p className="text-[7px] text-slate-600 uppercase font-bold">Documento / Visa</p>
                            <p className={`text-[10px] font-black ${isAlert ? 'text-red-500' : 'text-blue-400'}`}>
                              {detectedSubject.doc} | {detectedSubject.visa}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-[#222] pt-2">
                          <p className="text-[7px] text-slate-600 uppercase font-bold">Historial_Reciente</p>
                          <p className="text-[9px] text-slate-400 leading-none italic mt-1">"{detectedSubject.lastCheck}"</p>
                        </div>

                        <div className={`py-1.5 px-2 text-[10px] font-black text-center ${isAlert ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                          RIESGO: {detectedSubject.riesgo}
                        </div>
                     </div>
                  </div>
                </div>
              )}
            </div>

            {/* FEED DE VIDEO REAL */}
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              muted
              className={`w-full h-full object-cover transition-opacity duration-1000 ${streamActive ? 'opacity-80' : 'opacity-0'} scale-x-[-1]`}
            />

            {/* ESTADO DE ESPERA */}
            {!streamActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#050505]">
                <div className="border-2 border-[#111] p-10 bg-black shadow-inner flex flex-col items-center">
                   <Lock size={48} className="text-[#222] mb-4" />
                   <h3 className="text-slate-700 text-xs font-bold tracking-[0.5em]">CANAL_RESERVADO</h3>
                   <button onClick={startCamera} className="mt-6 text-[10px] text-blue-600 hover:text-white underline font-bold uppercase">Solicitar autorización de acceso</button>
                </div>
              </div>
            )}

            {/* Efectos de lente y terminal */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]"></div>
          </div>

          {/* TELEMETRÍA DE SERVIDOR */}
          <div className="grid grid-cols-4 gap-4 h-16 bg-[#111] border border-[#222] p-2">
            {[
              { label: 'SERVER_LOAD', val: `${metrics.cpu}%`, color: 'text-blue-500' },
              { label: 'BUFFER_DELAY', val: '0.002s', color: 'text-emerald-500' },
              { label: 'DB_PARSING', val: 'SYNC', color: 'text-white' },
              { label: 'THREAD_ID', val: '0x992B-01', color: 'text-[#444]' }
            ].map((m, i) => (
              <div key={i} className="flex flex-col justify-center border-r border-[#222] last:border-none px-4">
                <span className="text-[8px] text-[#555] font-black uppercase">{m.label}</span>
                <span className={`text-sm font-bold ${m.color}`}>{m.val}</span>
              </div>
            ))}
          </div>
        </section>

        {/* REGISTRO DE EVENTOS (DERECHA) */}
        <section className="col-span-12 lg:col-span-3 flex flex-col gap-4">
          
          <div className="flex-1 bg-[#111] border border-[#222] p-4 flex flex-col min-h-0 relative">
            <h2 className="text-[10px] font-black text-[#555] tracking-widest flex items-center gap-2 border-b border-[#222] pb-3 mb-4">
              <Search size={14}/> CONSOLA_EVENTOS
            </h2>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
              {logs.map((log, i) => (
                <div key={i} className="text-[9px] font-mono leading-tight animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-[#444] font-bold">[{log.time}]</span>
                    <span className={log.type === 'err' ? 'text-red-700 font-bold' : 'text-blue-900 font-bold'}>
                      {log.type === 'err' ? '!!' : '>>'}
                    </span>
                  </div>
                  <p className={`pl-4 ${log.type === 'err' ? 'text-red-500 font-bold' : 'text-slate-500'}`}>
                    {log.msg}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-[#222] pt-4">
              <div className="bg-black p-2 border border-[#333]">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-[8px] text-[#555] font-black">LOCAL_STATUS</span>
                    <div className="flex gap-1">
                       <div className="w-1 h-1 bg-blue-500"></div>
                       <div className="w-1 h-1 bg-blue-500"></div>
                       <div className="w-1 h-1 bg-blue-500 opacity-20"></div>
                    </div>
                 </div>
                 <p className="text-[9px] text-blue-700 font-bold uppercase">Iniciando protocolo de respaldo...</p>
              </div>
            </div>
          </div>

          <div className="bg-black border border-[#222] p-4 text-[9px] text-[#444] font-bold flex flex-col gap-2">
            <div className="flex justify-between uppercase">
               <span>Versión Sistema</span>
               <span>v3.0.1-BUILD_FINAL</span>
            </div>
            <div className="flex justify-between uppercase text-[#222]">
               <span>Licencia_ID</span>
               <span>992-001-A-Z</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-4 flex justify-between items-center text-[8px] text-[#333] font-black tracking-widest px-2">
        <div className="flex gap-10">
          <span>COORDS: 40.6413° N, 73.7781° W (JFK_TERM_4)</span>
          <span>TEMP_SERVER: 42°C</span>
          <span>ENC_METHOD: RSA_4096</span>
        </div>
        <div>DOCUMENT_INTERNAL_USE_ONLY // NIVEL DE ACCESO 5</div>
      </footer>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

export default App;