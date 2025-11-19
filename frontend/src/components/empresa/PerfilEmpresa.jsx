import { useState } from "react";
import SidebarEmpresa from "./SidebarEmpresa";
import InfoEmpresa from "./InfoEmpresa";
import OfertaForm from "../OfertaForm";
import GestionOfertas from "../GestionOfertas";
import MisActividades from "../MisActividades";
import PostulantesPorOferta from "../PostulantesPorOferta";
import BuscadorDeTalentos from "../BuscadorDeTalentos";

import "../../styles/FormStyles.css";


export default function PerfilEmpresa({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("info");

  console.log("👤 Usuario en PerfilEmpresa:", usuario); // Para debug

  return (
    <div className="perfil-container">
      <SidebarEmpresa setSeccion={setSeccion} onLogout={onLogout} />

      <div className="perfil-content">
        {seccion === "info" && <InfoEmpresa usuario={usuario} />}
        {seccion === "mis-actividades" && <MisActividades usuario={usuario} tipo="empresa" />}
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

        {seccion === "postulantes" && (
          <PostulantesPorOferta usuario={usuario} />
        )}

        {seccion === "buscar-talentos" && (
          <BuscadorDeTalentos />
        )}


      </div>
    </div>
  );
}