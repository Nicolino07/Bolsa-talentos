

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
     
    </div>
  );
}

export default SidebarEmpresa