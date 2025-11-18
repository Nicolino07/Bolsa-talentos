import { useState } from "react";
import SidebarEmpresa from "./SidebarEmpresa";
import InfoEmpresa from "./InfoEmpresa";
import OfertaForm from "../OfertaForm";
import GestionOfertas from "../GestionOfertas";
import MisActividades from "../MisActividades";
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
            empresaId={usuario.id_empresa} 
            onOfertaCreada={() => setSeccion("gestionar-ofertas")}
            onCancelar={() => setSeccion("gestionar-ofertas")}
          />
        )}
        {seccion === "gestionar-ofertas" && (
          <GestionOfertas empresaId={usuario.id_empresa} />
        )}
      </div>
    </div>
  );
}