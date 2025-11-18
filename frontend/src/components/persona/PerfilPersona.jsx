import { useState } from "react";
import SidebarPersona from "./SidebarPersona";
import InfoPersona from "./InfoPersona";
import MisActividades from "../MisActividades";
import BuscarTrabajo from "../BuscarEmpleo"; 
import "../../styles/FormStyles.css";

function PerfilPersona({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("info");

  // Función para manejar el cambio de sección
  const handleSeccionChange = (nuevaSeccion) => {
    setSeccion(nuevaSeccion);
  };

  return (
    <div className="perfil-container">
      <SidebarPersona 
        setSeccion={handleSeccionChange} 
        onLogout={onLogout} 
      />

      <div className="perfil-content">
        {seccion === "info" && <InfoPersona usuario={usuario} />}
        {seccion === "mis-actividades" && <MisActividades usuario={usuario} tipo="persona" />}
        {seccion === "trabajo" && <BuscarTrabajo />}
      </div>
    </div>
  );
}

export default PerfilPersona