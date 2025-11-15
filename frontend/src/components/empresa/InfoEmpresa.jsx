
function InfoEmpresa({ usuario }) {
  return (
    <div>
      
      <h2>🏢 Información de la Empresa</h2>
      <p><strong>Nombre de la Empresa:</strong> {usuario.nombre_empresa}</p>
      <p><strong>Email:</strong> {usuario.email}</p>
      <p><strong>Teléfono:</strong> {usuario.telefono || "—"}</p>
      <p><strong>Dirección:</strong> {usuario.direccion || "—"}</p>
      <p><strong>Ciudad:</strong> {usuario.ciudad || "—"}</p>
      <p><strong>Provincia:</strong> {usuario.provincia || "—"}</p>
    </div>
    
  );
}

export default InfoEmpresa;