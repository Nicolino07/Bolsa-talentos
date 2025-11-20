import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PostulacionesPersona({ dni }) {
  const [postulaciones, setPostulaciones] = useState([]);
  const [detalleOfertas, setDetalleOfertas] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dni) return;

    const fetchData = async () => {
      try {
        console.log("📌 Cargando postulaciones para persona:", dni);

        // 1️⃣ Obtener todas las postulaciones
        const resp = await axios.get("/api/postulaciones/");
        const filtradas = resp.data.filter((p) => p.dni === dni);
        setPostulaciones(filtradas);

        // 2️⃣ Cargar detalles de cada oferta involucrada
        const detalles = {};

        for (const p of filtradas) {
          if (!detalles[p.id_oferta]) {
            try {
              const ofertaResp = await axios.get(`/api/ofertas/${p.id_oferta}`);
              detalles[p.id_oferta] = ofertaResp.data;
            } catch (e) {
              console.warn("⚠ No se pudo cargar detalle de oferta", p.id_oferta);
            }
          }
        }

        setDetalleOfertas(detalles);

      } catch (err) {
        console.error("❌ Error cargando postulaciones:", err);
        setError("No se pudieron cargar las postulaciones.");
      }
    };

    fetchData();
  }, [dni]);

  // 3️⃣ Cancelar postulación
  const cancelarPostulacion = async (id_oferta) => {
    try {
      await axios.delete(`/api/postulaciones/${dni}/${id_oferta}`);

      setPostulaciones((prev) =>
        prev.filter((p) => p.id_oferta !== id_oferta)
      );

      alert("Postulación cancelada.");
    } catch (err) {
      console.error("❌ Error al cancelar postulación:", err);
      alert("No se pudo cancelar la postulación.");
    }
  };

  return (
    <div>
      <h2>📄 Mis Postulaciones</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {postulaciones.length === 0 ? (
        <p>No tienes postulaciones.</p>
      ) : (
        postulaciones.map((p) => {
          const oferta = detalleOfertas[p.id_oferta];

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #ccc",
                padding: 15,
                marginBottom: 10,
                background: "#fafafa",
                borderRadius: 6,
              }}
            >
              <h3 style={{ margin: 0 }}>
                {oferta?.titulo || "⏳ Cargando título..."}
              </h3>

              <p style={{ color: "#555" }}>
                {oferta?.descripcion || "⏳ Cargando descripción..."}
              </p>

              <p>
                <strong>Estado:</strong> {p.estado}
              </p>

              <button
                style={{
                  background: "#d9534f",
                  color: "white",
                  padding: "8px 15px",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
                onClick={() => cancelarPostulacion(p.id_oferta)}
              >
                Cancelar postulación
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
