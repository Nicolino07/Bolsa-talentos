import { useState } from "react";
import SidebarPerfil from "./perfil/SidebarPerfil";
import InfoPersona from "./perfil/InfoPersona";
import HabilidadesPersona from "./perfil/HabilidadesPersona";

export default function PerfilPersona({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("info");

  return (
    <div className="perfil-container">
      <SidebarPerfil setSeccionSeleccionada={setSeccion} onLogout={onLogout} />

      <div className="perfil-content">
        {seccion === "info" && <InfoPersona usuario={usuario} />}
        {seccion === "habilidades" && <HabilidadesPersona />}
      </div>
    </div>
  );
}
