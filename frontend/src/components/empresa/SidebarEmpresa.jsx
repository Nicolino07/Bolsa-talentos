

function SidebarEmpresa({ setSeccion, onLogout }) {
  return (
    <div className="sidebar-perfil">
      <button onClick={() => setSeccion("info")}>
        👤 Mis Datos
      </button>
      <button onClick={() => setSeccion("mis-actividades")}>
        🛠 Actividades
      </button>
      <button onClick={() => setSeccion("crear-oferta")}>
        ➕ Crear Oferta
      </button>
      <button onClick={() => setSeccion("gestionar-ofertas")}>
        📋 Gestionar Ofertas
      </button>

      <button onClick={() => setSeccion("gestionar-postulaciones")}>Postulantes</button>
      <button onClick={() => setSeccion("buscar-talentos")}>Buscar Talentos</button>
     
    </div>
  );
}

export default SidebarEmpresa