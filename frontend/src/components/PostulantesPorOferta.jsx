import { useEffect, useState } from "react";
import axios from "axios";

function PostulantesPorOferta({ dni }) {
  const [usuario, setUsuario] = useState(null);
  const [ofertas, setOfertas] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // ==========================
  //   CARGA DE USUARIO
  // ==========================
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await axios.get(`/api/usuario/dni/${dni}`);
        console.log("👤 Usuario detectado en PostulantesPorOferta:", res.data);
        setUsuario(res.data);
      } catch (err) {
        console.error("❌ Error cargando usuario:", err);
      }
    };
    fetchUsuario();
  }, [dni]);

  // ==========================
  //   CARGA SEGÚN ROL
  // ==========================
  useEffect(() => {
    if (!usuario) return;

    const cargarDatos = async () => {
      try {
        if (usuario.rol === "EMPRESA") {
          await cargarDatosEmpresa();
        } else if (usuario.rol === "PERSONA") {
          await cargarDatosPersona();
        }
        setCargando(false);
      } catch (err) {
        console.error("❌ Error", err);
      }
    };

    cargarDatos();
  }, [usuario]);

  // ==========================
  //   MODO EMPRESA
  // ==========================
  const cargarDatosEmpresa = async () => {
    try {
      const resOfertas = await axios.get(`/api/ofertas/empresa/${usuario.id_empresa}`);
      const resPost = await axios.get(`/api/postulaciones/empresa/${usuario.id_empresa}`);

      console.log("📌 Ofertas empresa:", resOfertas.data);
      console.log("📌 Postulantes:", resPost.data);

      setOfertas(resOfertas.data);
      setPostulaciones(resPost.data);
    } catch (err) {
      console.error("❌ Error cargando datos empresa:", err);
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    try {
      await axios.put(`/api/postulaciones/${id}`, { estado: nuevoEstado });

      setPostulaciones((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado: nuevoEstado } : p))
      );
      alert("Estado actualizado.");
    } catch (err) {
      console.error("❌ Error cambiando estado:", err);
    }
  };

  // ==========================
  //   MODO PERSONA
  // ==========================
  const cargarDatosPersona = async () => {
    try {
      const res = await axios.get(`/api/postulaciones/persona/${usuario.dni}`);
      console.log("🧍 Postulaciones de persona:", res.data);
      setPostulaciones(res.data);
    } catch (err) {
      console.error("❌ Error cargando postulaciones persona:", err);
    }
  };

  // ==========================
  //   CARGANDO
  // ==========================
  if (cargando) return <p>Cargando usuario...</p>;

  // ==========================
  //   VISTA PERSONA
  // ==========================
  if (usuario.rol === "PERSONA") {
    return (
      <div>
        <h2>Mis Postulaciones</h2>

        {postulaciones.map((p) => (
          <div key={p.id} className="postulacion-card">
            <h3>{p.titulo}</h3>
            <p>{p.descripcion}</p>
            <p>Estado: <b>{p.estado}</b></p>
            <p>Empresa: {p.nombre_empresa}</p>
          </div>
        ))}
      </div>
    );
  }

  // ==========================
  //   VISTA EMPRESA
  // ==========================
  return (
    <div>
      <h2>Postulantes a Mis Ofertas</h2>

      {ofertas.map((oferta) => (
        <div key={oferta.id_oferta} className="card-oferta">
          
          <h3>{oferta.titulo}</h3>
          <p>{oferta.descripcion}</p>

          <h4>Postulantes</h4>

          {postulaciones
            .filter((p) => p.id_oferta === oferta.id_oferta)
            .map((p) => (
              <div key={p.id} className="postulante-card">
                
                <strong>{p.nombre} {p.apellido}</strong>
                <p>DNI: {p.dni}</p>
                <p>Email: {p.email}</p>
                <p>Teléfono: {p.telefono}</p>
                <p>Estado actual: <b>{p.estado}</b></p>

                <div className="acciones-empresa">

                  {/* Aceptar */}
                  <button
                    className="btn-submit"
                    onClick={() => cambiarEstado(p.id, "entrevista")}
                  >
                    Aceptar
                  </button>

                  {/* Rechazar */}
                  <button
                    className="btn-volver"
                    onClick={() => cambiarEstado(p.id, "rechazado")}
                  >
                    Rechazar
                  </button>

                  {/* Dropdown cambio de estado */}
                  <select
                    value={p.estado}
                    onChange={(e) => cambiarEstado(p.id, e.target.value)}
                    className="selector-estado"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="revisando">Revisando</option>
                    <option value="entrevista">Entrevista</option>
                    <option value="contratado">Contratado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>

                  {/* Ver perfil */}
                  <button
                    className="btn-info"
                    onClick={() => alert("Mostrar modal con datos de la persona")}
                  >
                    Ver Perfil
                  </button>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

export default PostulantesPorOferta;
