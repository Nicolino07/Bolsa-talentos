import { useState } from "react";
import SidebarPersona from "./SidebarPersona";
import InfoPersona from "./InfoPersona";
import MisActividades from "../MisActividades";
import OfertaForm from "../OfertaForm";
import GestionOfertas from "../GestionOfertas";
import "../../styles/FormStyles.css";
import RecomendarHabilidades from "../RecomendarHabilidades";
import PostulantesPorOferta from "../PostulantesPorOferta";

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
    
        {seccion === "recomendar-habilidades" && (<RecomendarHabilidades dni={usuario.dni} />)}

        {seccion === "gestionar-postulaciones" && (<PostulantesPorOferta usuario={usuario} />)}

        {seccion === "crear-oferta" && (
          <OfertaForm 
            usuario={usuario}  // ← Pasar usuario completo
            onOfertaCreada={() => setSeccion("gestionar-ofertas")}
            onCancelar={() => setSeccion("gestionar-ofertas")}
          />
        )}

        {seccion === "gestionar-ofertas" && (
          <GestionOfertas 
            empresaId={usuario.dni} 
            usuario={usuario}
          />
        )}

      </div>
    </div>
  );
}

export default PerfilPersona