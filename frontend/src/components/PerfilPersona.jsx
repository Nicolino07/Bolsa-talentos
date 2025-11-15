import { useState } from "react";
import SidebarPersona from "./persona/SidebarPersona";
import InfoPersona from "./persona/InfoPersona";
import HabilidadesPersona from "./persona/HabilidadesPersona";
import "../styles/FormStyles.css";

export default function PerfilPersona({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("info");

  return (
    <div className="perfil-container">
      <SidebarPersona setSeccion={setSeccion} onLogout={onLogout} />

      <div className="perfil-content">
        {seccion === "info" && <InfoPersona usuario={usuario} />}
        {seccion === "habilidades" && <HabilidadesPersona />}
      </div>
    </div>
  );
}
