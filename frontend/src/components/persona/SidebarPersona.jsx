

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
      <button onClick={() => setSeccion("trabajo")}>
        🔍 Buscar Trabajo
      </button>
  
    </div>
  );
}

export default SidebarPersona