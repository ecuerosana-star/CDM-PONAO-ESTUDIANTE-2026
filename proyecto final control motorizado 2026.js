import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  doc, 
  setDoc, 
  getDoc,
  where
} from 'firebase/firestore';
import { Camera, Clipboard, Clock, History, LogOut, User, Mail, IdCard, Calendar, CameraOff, Lock } from 'lucide-react';

// --- Configuración de Firebase ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'motorized-control-v1';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('login'); 
  const [history, setHistory] = useState([]);
  
  // Lógica de Autenticación
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        try { 
          await signInWithCustomToken(auth, __initial_auth_token); 
        } catch (e) { 
          await signInAnonymously(auth);
        }
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Intentar cargar perfil si ya existe
        const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'data');
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setView('dashboard');
        } else {
          setView('login');
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Escucha del Historial en tiempo real
  useEffect(() => {
    if (!user || !userData) return;
    
    const q = collection(db, 'artifacts', appId, 'users', user.uid, 'logs');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
      setHistory(sortedLogs);
    }, (error) => {
      console.error("Error en Firestore:", error);
    });
    
    return () => unsubscribe();
  }, [user, userData]);

  const handleLogout = async () => {
    await signOut(auth);
    setUserData(null);
    setView('login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {view === 'login' && <LoginView setView={setView} setUserData={setUserData} user={user} />}
      {view === 'register' && <RegisterView setView={setView} setUserData={setUserData} user={user} />}
      
      {user && userData && (
        <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white shadow-xl relative">
          <header className="p-4 bg-indigo-700 text-white flex justify-between items-center shadow-md">
            <div>
              <h1 className="font-bold text-lg">Control Motorizado</h1>
              <p className="text-xs opacity-90">{userData.nombre}</p>
            </div>
            <button onClick={handleLogout} className="p-2 bg-indigo-600 rounded-full hover:bg-indigo-800 transition">
              <LogOut size={20} />
            </button>
          </header>

          <main className="flex-1 p-4 overflow-y-auto pb-24">
            {view === 'dashboard' && <Dashboard user={user} userData={userData} />}
            {view === 'history' && <HistoryView history={history} />}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 flex justify-around p-3 z-10">
            <button 
              onClick={() => setView('dashboard')}
              className={`flex flex-col items-center ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <Clock size={24} />
              <span className="text-xs mt-1 font-medium">Reportar</span>
            </button>
            <button 
              onClick={() => setView('history')}
              className={`flex flex-col items-center ${view === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <History size={24} />
              <span className="text-xs mt-1 font-medium">Historial</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

// --- Vistas de Acceso ---

function LoginView({ setView, setUserData, user }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccess = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsProcessing(true);

    try {
      // Simulación de acceso flexible:
      // Buscamos si existe un perfil con ese correo en nuestra base de datos pública de usuarios
      // Nota: En un entorno real usaríamos Auth, aquí simplificamos según la petición.
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUserData(userDoc.data());
        setView('dashboard');
      } else {
        // Si no existe perfil para esta sesión anónima, invitamos a registrar
        setView('register');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-indigo-700">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-indigo-100 rounded-2xl text-indigo-700">
            <Lock size={48} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-center mb-2 text-slate-800">Acceso Rápido</h2>
        <p className="text-center text-slate-500 text-sm mb-8">Ingresa tus datos para continuar</p>
        
        <form onSubmit={handleAccess} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario / Correo</label>
            <input 
              type="text" required
              placeholder="ejemplo@correo.com"
              className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña (Cualquiera)</label>
            <input 
              type="password" required
              placeholder="••••••••"
              className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full py-4 bg-indigo-700 text-white rounded-xl font-bold hover:bg-indigo-800 transition shadow-lg flex items-center justify-center"
          >
            {isProcessing ? "Cargando..." : "Entrar al Sistema"}
          </button>
        </form>
        <button onClick={() => setView('register')} className="w-full mt-6 text-indigo-600 font-medium text-sm">
          ¿Primera vez? Registra tus datos aquí
        </button>
      </div>
    </div>
  );
}

function RegisterView({ setView, setUserData, user }) {
  const [form, setForm] = useState({ nombre: '', cedula: '', edad: '', correo: '', password: '' });
  const [isSaving, setIsSaving] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const profileData = {
        nombre: form.nombre,
        cedula: form.cedula,
        edad: form.edad,
        correo: form.correo,
        uid: user.uid,
        fechaRegistro: new Date().toISOString()
      };
      
      // Guardar en Firestore (Regla 1)
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data'), profileData);
      
      setUserData(profileData);
      setView('dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 flex items-center justify-center">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-bold mb-2 text-slate-800">Registro de Perfil</h2>
        <p className="text-slate-500 text-sm mb-6">Completa tu información de vigilante</p>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <User size={20} className="text-slate-400" />
            <input placeholder="Nombre completo" className="bg-transparent outline-none flex-1" required
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
          </div>
          <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <IdCard size={20} className="text-slate-400" />
            <input placeholder="Cédula" className="bg-transparent outline-none flex-1" required
              value={form.cedula} onChange={e => setForm({...form, cedula: e.target.value})} />
          </div>
          <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Calendar size={20} className="text-slate-400" />
            <input placeholder="Edad" type="number" className="bg-transparent outline-none flex-1" required
              value={form.edad} onChange={e => setForm({...form, edad: e.target.value})} />
          </div>
          <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Mail size={20} className="text-slate-400" />
            <input placeholder="Correo electrónico" type="email" className="bg-transparent outline-none flex-1" required
              value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
          </div>
          <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
            <Lock size={20} className="text-slate-400" />
            <input placeholder="Contraseña elegida" type="password" className="bg-transparent outline-none flex-1" required
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          
          <button 
            type="submit" 
            disabled={isSaving}
            className="w-full py-4 bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:bg-indigo-800 transition"
          >
            {isSaving ? "Guardando..." : "Crear mi Perfil"}
          </button>
        </form>
        <button onClick={() => setView('login')} className="w-full mt-4 text-slate-500 text-sm">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

// --- Dashboard y Reportes ---

function Dashboard({ user, userData }) {
  const [placa, setPlaca] = useState('');
  const [photo, setPhoto] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setCameraActive(false);
    }
  };

  const takePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    setPhoto(canvas.toDataURL('image/png'));
    
    const stream = videoRef.current.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const handleReport = async (tipo) => {
    if (!placa || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'logs'), {
        tipo,
        placa,
        fotoPlaca: photo,
        timestamp: Date.now(),
        fechaFormateada: new Date().toLocaleString(),
        vigilante: userData.nombre
      });
      
      setPlaca('');
      setPhoto(null);
    } catch (err) {
      console.error("Error al guardar reporte:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
          <Clock className="text-indigo-500" /> Registrar Turno
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1 tracking-tight">Número de Placa</label>
            <input 
              placeholder="XYZ-789"
              className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-2xl text-center"
              value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2 tracking-tight">Captura de Placa</label>
            {!cameraActive && !photo && (
              <button 
                onClick={startCamera}
                className="w-full py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:bg-slate-100 transition"
              >
                <Camera size={40} />
                <span className="text-sm mt-2">Tomar Foto</span>
              </button>
            )}

            {cameraActive && (
              <div className="relative rounded-2xl overflow-hidden bg-black shadow-inner">
                <video ref={videoRef} autoPlay playsInline className="w-full aspect-video object-cover" />
                <button 
                  onClick={takePhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-indigo-700 p-4 rounded-full shadow-2xl active:scale-95 transition"
                >
                  <Camera size={32} />
                </button>
              </div>
            )}

            {photo && (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <img src={photo} alt="Evidencia" className="w-full aspect-video object-cover" />
                <button 
                  onClick={() => setPhoto(null)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition"
                >
                  <CameraOff size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <button 
              disabled={!placa || isSubmitting}
              onClick={() => handleReport('Entrada')}
              className={`py-4 rounded-2xl font-bold text-white transition shadow-lg ${!placa || isSubmitting ? 'bg-slate-300' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'}`}
            >
              ENTRADA
            </button>
            <button 
              disabled={!placa || isSubmitting}
              onClick={() => handleReport('Salida')}
              className={`py-4 rounded-2xl font-bold text-white transition shadow-lg ${!placa || isSubmitting ? 'bg-slate-300' : 'bg-rose-600 hover:bg-rose-700 active:scale-95'}`}
            >
              SALIDA
            </button>
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
        <h4 className="font-bold text-indigo-800 text-sm mb-2 flex items-center gap-1">
          <User size={16} /> Perfil del Operador
        </h4>
        <div className="text-xs text-indigo-600 grid grid-cols-2 gap-y-1">
          <p><span className="font-semibold text-indigo-900">ID:</span> {userData.cedula}</p>
          <p><span className="font-semibold text-indigo-900">Edad:</span> {userData.edad} años</p>
          <p className="col-span-2 truncate"><span className="font-semibold text-indigo-900">Email:</span> {userData.correo}</p>
        </div>
      </div>
    </div>
  );
}

function HistoryView({ history }) {
  return (
    <div className="space-y-4 pb-12">
      <h3 className="text-xl font-bold text-slate-800 px-2 flex items-center gap-2">
        <History size={20} className="text-indigo-600" /> Mi Historial
      </h3>
      
      {history.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
          <History size={48} className="mx-auto mb-4 opacity-10" />
          <p className="text-sm">No has realizado reportes hoy.</p>
        </div>
      ) : (
        history.map((log) => (
          <div key={log.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 hover:border-indigo-200 transition">
            <div className={`w-1.5 rounded-full ${log.tipo === 'Entrada' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <div className="flex-1 overflow-hidden">
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${log.tipo === 'Entrada' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {log.tipo.toUpperCase()}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{log.fechaFormateada}</span>
              </div>
              <h4 className="font-bold text-lg font-mono tracking-wider text-slate-800">{log.placa}</h4>
              {log.fotoPlaca && (
                <div className="mt-2 rounded-xl overflow-hidden border border-slate-50 bg-slate-50">
                  <img src={log.fotoPlaca} alt="Placa" className="w-full h-32 object-cover" />
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}