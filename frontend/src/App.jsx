
import React, { useState } from 'react';
import CrearUsuarioForm from './components/CrearUsuarioForm.jsx';
import BuscarEmpleo from './components/BuscarEmpleo';
import PerfilPersona from './components/PerfilPersona';
import PerfilEmpresa from './components/PerfilEmpresa'; 
import LoginForm from './components/LoginForm.jsx';
import './App.css';

function App() {
  const [vista, setVista] = useState('inicio');
  const [usuario, setUsuario] = useState(null);

  const handleLogout = () => {
    setUsuario(null);
    localStorage.removeItem('token');
    setVista("inicio");
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
            </span>
            <button className="btn-header" onClick={handleLogout}>
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
              onLogout={handleLogout}
            />
          </>
        )}

        {/* PERFIL EMPRESA */}
        {vista === "perfil-empresa" && usuario && (
          <>
            {console.log('🎯 Mostrando PerfilEmpresa')}
            <PerfilEmpresa 
              usuario={usuario}
              onLogout={handleLogout}
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