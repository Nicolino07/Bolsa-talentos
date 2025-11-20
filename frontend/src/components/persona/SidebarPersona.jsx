

function SidebarPersona({ setSeccion, onLogout }) {
  return (
    <div className="sidebar-perfil">
      <button onClick={() => setSeccion("info")}>
        👤 Mis Datos
      </button>
      {/*Boton mis habilidades usa componente MisActividades */}
      <button onClick={() => setSeccion("mis-actividades")}>  
        🛠 Mis Habilidades
      </button>

      <button onClick={() => setSeccion("matching")}>
        🔍 Busqueda de empleo
      </button>

     
      <button onClick={() => setSeccion("recomendar-habilidades")}>
        🧠 Busqueda avanzada
      </button>

      <button onClick={() => setSeccion("crear-oferta")}>
        ➕ Crear Oferta
      </button>
      <button onClick={() => setSeccion("gestionar-ofertas")}>
        📋 Gestionar Ofertas
      </button>
      <button onClick={() => setSeccion("gestionar-postulaciones")}>
        📋 Gestionar Postulaciones
      </button>
  
    </div>
  );
}

export default SidebarPersona