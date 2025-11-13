
function InfoPersona({ usuario }) {
  return (
    <div>
      <h2>👤 Mi Información</h2>
      <p><strong>Nombre:</strong> {usuario.nombre}</p>
      <p><strong>DNI:</strong> {usuario.dni}</p>
      <p><strong>Email:</strong> {usuario.mail}</p>
      <p><strong>Ciudad:</strong> {usuario.ciudad || "—"}</p>
    </div>
  );
}

export default InfoPersona;