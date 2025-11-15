
function SidebarPerfil({ onSelect, onLogout }) {
  return (
    <div className="sidebar-perfil">
      <button onClick={() => onSelect("datos")}>Mis Datos</button>
      <button onClick={() => onSelect("actividades")}>Mis Actividades</button>
      <button onClick={() => onSelect("agregar")}>Agregar Actividad</button>
      <button className="btn-volver" onClick={onLogout}> ⬅ Cerrar Sesión</button>
    </div>
  );
}

export default SidebarPerfil;
