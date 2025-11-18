import React, { useState, useEffect, useCallback, useRef } from 'react'; // ← Agrega useRef aquí
import CrearUsuarioForm from './components/CrearUsuarioForm.jsx';
import BuscarEmpleo from './components/BuscarEmpleo';
import PerfilPersona from './components/persona/PerfilPersona';
import PerfilEmpresa from './components/empresa/PerfilEmpresa'; 
import LoginForm from './components/LoginForm.jsx';
import './App.css';

function App() {
  const [vista, setVista] = useState('inicio');
  const [usuario, setUsuario] = useState(null);
  
  // Timeout de inactividad (10 minutos = 600000 ms)
  const INACTIVITY_TIMEOUT = 10 * 60 * 1000;

  const handleLogout = useCallback(() => {
    console.log('🔒 Cerrando sesión por inactividad');
    setUsuario(null);
    localStorage.removeItem('token');
    setVista("inicio");
  }, []);

  // SOLUCIÓN SIMPLE CON useRef
  const inactivityTimerRef = useRef(null);

  useEffect(() => {
    if (!usuario) return;

    const handleActivity = () => {
      // Limpiar timer anterior
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      // Crear nuevo timer
      inactivityTimerRef.current = setTimeout(() => {
        console.log('🔒 Cerrando sesión por inactividad');
        handleLogout();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Iniciar timer inicial
    handleActivity();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [usuario, handleLogout]);

  // Función de logout manual (para el botón)
  const handleManualLogout = () => {
    // Limpiar el timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    handleLogout();
  };

  const handleLoginSuccess = (datosUser) => {
    console.log('🚀 Login exitoso:', datosUser);
    setUsuario(datosUser);
    
    // Redirigir al perfil correspondiente
    if (datosUser.rol === "PERSONA") {
      setVista("perfil-persona");
    } else if (datosUser.rol === "EMPRESA") {
      setVista("perfil-empresa");
    } else {
      setVista("perfil-persona"); // Por defecto
    }
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <h1 className="titulo">Bolsa de Trabajo UNRN</h1>

        {!usuario ? (
          <div className="acciones-header">
            <button className="btn-header" onClick={() => setVista('ingresar')}>
              Ingresar
            </button>
            <button className="btn-header" onClick={() => setVista('registrar')}>
              Registrar
            </button>
          </div>
        ) : (
          <div className="acciones-header">
            
            <span className="usuario-info">
              Hola, {usuario.nombre || usuario.nombre_empresa || usuario.email}
              {inactivityTimerRef.current && ( // ← CAMBIA inactivityTimer por inactivityTimerRef.current
                <span style={{ 
                  fontSize: '0.8rem', 
                  display: 'block', 
                  color: '#666',
                  marginTop: '2px'
                }}>
                  Sesión activa
                </span>
              )}
            </span>

            <button className="btn-header" onClick={handleManualLogout}>
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>

      <main className="main">
        {/* LOGIN */}
        {vista === "ingresar" && (
          <LoginForm
            onVolver={() => setVista("inicio")}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* INICIO */}
        {vista === "inicio" && (
          <>
            <BuscarEmpleo />
            <section className="info">
              <div className="info-card">
                <h3>🎓 Para estudiantes</h3>
                <p>Encontrá oportunidades laborales y prácticas profesionales relacionadas con tu carrera.</p>
              </div>
              <div className="info-card">
                <h3>🏢 Para empresas</h3>
                <p>Publicá ofertas y encontrá talento formado en la UNRN.</p>
              </div>
              <div className="info-card">
                <h3>🚀 Crecé profesionalmente</h3>
                <p>Conectamos personas, empresas y conocimiento para impulsar el desarrollo regional.</p>
              </div>
            </section>
          </>
        )}

        {/* REGISTRO */}
        {vista === "registrar" && (
          <CrearUsuarioForm onVolver={() => setVista("inicio")} />
        )}

        {/* PERFIL PERSONA */}
        {vista === "perfil-persona" && usuario && (
          <>
            {console.log('🎯 Mostrando PerfilPersona')}
            <PerfilPersona 
              usuario={usuario}
              onLogout={handleManualLogout}
            />
          </>
        )}

        {/* PERFIL EMPRESA */}
        {vista === "perfil-empresa" && usuario && (
          <>
            {console.log('🎯 Mostrando PerfilEmpresa')}
            <PerfilEmpresa 
              usuario={usuario}
              onLogout={handleManualLogout}
            />
          </>
        )}

      </main>

      <footer className="footer">
        <p>© 2025 Vargas Nicolás - Bravo Santiago — Bolsa de Trabajo UNRN</p>
      </footer>
    </div>
  );
}

export default App;