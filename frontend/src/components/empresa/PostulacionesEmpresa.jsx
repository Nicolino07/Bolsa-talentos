
import React, { useEffect, useState } from "react";
import axios from "axios";

function PostulacionesEmpresa({ usuario }) {
  const [postulaciones, setPostulaciones] = useState([]);
  const [ofertasEmpresa, setOfertasEmpresa] = useState([]);
  const [personas, setPersonas] = useState({});
  const [error, setError] = useState(null);

  // Identificador flexible
  const empresaId = usuario.id_empresa

  console.log("🟦 Usuario recibido en PostulacionesEmpresa:", usuario);
  console.log("🟩 empresaId detectado:", empresaId);

  useEffect(() => {
    if (!empresaId) {
      console.error("❌ No hay empresaId disponible");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("📌 Cargando postulaciones para empresa", empresaId);

        // 1) Ofertas creadas por la empresa
        const ofertasResp = await axios.get(`/api/ofertas/empresa/${empresaId}`);
        console.log("📦 Ofertas empresa:", ofertasResp.data);

        setOfertasEmpresa(ofertasResp.data);
        const idsOfertas = ofertasResp.data.map((o) => o.id);

        // 2) Todas las postulaciones
        const postResp = await axios.get("/api/postulaciones/");
        console.log("📦 Todas las postulaciones:", postResp.data);

        const filtradas = postResp.data.filter((p) =>
          idsOfertas.includes(p.id_oferta)
        );
        console.log("📨 Postulaciones filtradas:", filtradas);

        setPostulaciones(filtradas);

        // 3) Cargar información de personas
        const mapaPersonas = {};

        for (const p of filtradas) {
          if (!mapaPersonas[p.dni]) {
            try {
              const personaResp = await axios.get(`/api/personas/${p.dni}`);
              mapaPersonas[p.dni] = personaResp.data;
            } catch (e) {
              console.warn("⚠ No se pudo cargar persona", p.dni);
            }
          }
        }

        setPersonas(mapaPersonas);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las postulaciones.");
      }
    };

    fetchData();
  }, [empresaId]);

  // Cambiar estado
  const actualizarEstado = async (dni, id_oferta, estado) => {
    try {
      await axios.put(`/api/postulaciones/${dni}/${id_oferta}`, { estado });

      setPostulaciones((prev) =>
        prev.map((p) =>
          p.dni === dni && p.id_oferta === id_oferta
            ? { ...p, estado }
            : p
        )
      );
    } catch (err) {
      console.error("❌ Error cambiando estado:", err);
      alert("No se pudo actualizar el estado.");
    }
  };

  return (
    <div>
      <h2>📄 Postulaciones Recibidas</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {postulaciones.length === 0 ? (
        <p>No hay postulaciones.</p>
      ) : (
        postulaciones.map((p) => {
          const postulante = personas[p.dni];
          const oferta = ofertasEmpresa.find((o) => o.id === p.id_oferta);

          return (
            <div
              key={`${p.dni}-${p.id_oferta}`}
              style={{
                border: "1px solid #ccc",
                padding: 15,
                marginBottom: 10,
                background: "#f7f7f7",
                borderRadius: 6,
              }}
            >
              <h3>{oferta?.titulo || "Oferta desconocida"}</h3>

              <p>
                <strong>Postulante:</strong>{" "}
                {postulante
                  ? `${postulante.nombre} ${postulante.apellido}`
                  : p.dni}
              </p>

              <p>
                <strong>Email:</strong>{" "}
                {postulante?.email || "No disponible"}
              </p>

              <p>
                <strong>Estado:</strong> {p.estado}
              </p>

              <div style={{ marginTop: 10 }}>
                <button
                  style={{
                    background: "#5cb85c",
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                    marginRight: 10,
                  }}
                  onClick={() =>
                    actualizarEstado(p.dni, p.id_oferta, "aceptado")
                  }
                >
                  Aceptar
                </button>

                <button
                  style={{
                    background: "#d9534f",
                    color: "white",
                    padding: "8px 12px",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    actualizarEstado(p.dni, p.id_oferta, "rechazado")
                  }
                >
                  Rechazar
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default PostulacionesEmpresa