
function SidebarPersona({ onSelect, onLogout }) {
  return (
    <div className="sidebar-perfil">
      <button onClick={() => onSelect("datos")}>Mis Datos</button>
      <button onClick={() => onSelect("actividades")}>Mis Actividades</button>
      <button onClick={() => onSelect("agregar")}>Agregar Actividad</button>

    </div>
  );
}

export default SidebarPersona;
