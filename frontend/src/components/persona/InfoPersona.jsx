
function InfoPersona({ usuario }) {
  return (
    <div>
      <h2>👤 Mi Información</h2>
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>DNI:</strong> {usuario.dni}</p>
      <p><strong>Teléfono:</strong> {usuario.telefono || "—"}</p>
      <p><strong>Dirección:</strong> {usuario.direccion || "—"}</p>
      <p><strong>Ciudad:</strong> {usuario.ciudad || "—"}</p>
      <p><strong>Provincia:</strong> {usuario.provincia || "—"}</p>
    </div>
  );
}

export default InfoPersona;