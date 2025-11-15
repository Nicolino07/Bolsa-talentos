import { useState } from "react";
import SidebarEmpresa from "./empresa/SidebarEmpresa";
import InfoEmpresa from "./empresa/InfoEmpresa";


export default function PerfilEmpresa({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("info");

  return (
    <div className="perfil-container">
      <SidebarEmpresa setSeccion={setSeccion} onLogout={onLogout} />

      <div className="perfil-content">
        {seccion === "info" && <InfoEmpresa usuario={usuario} />}

      </div>
    </div>
  );
}
