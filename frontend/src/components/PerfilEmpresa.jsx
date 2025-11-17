import { useState } from "react";
import SidebarEmpresa from "./empresa/SidebarEmpresa";
import InfoEmpresa from "./empresa/InfoEmpresa";
import OfertaForm from "./OfertaForm";
import GestionOfertas from "./GestionOfertas";


export default function PerfilEmpresa({ usuario, onLogout }) {
  const [seccion, setSeccion] = useState("info");

  console.log("👤 Usuario en PerfilEmpresa:", usuario); // Para debug

  return (
    <div className="perfil-container">
      <SidebarEmpresa setSeccion={setSeccion} onLogout={onLogout} />

      <div className="perfil-content">
        {seccion === "info" && <InfoEmpresa usuario={usuario} />}
        {seccion === "actividades" && (
          <div className="seccion-placeholder">
            <h2>Mis Actividades</h2>
            <p>Esta sección estará disponible próximamente.</p>
          </div>
        )}
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