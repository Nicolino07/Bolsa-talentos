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
    <div style={{ padding: "20px" }}>
      <h2>🔍 Resultados de Matching</h2>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && data.recomendaciones && (
        <div style={{ marginTop: "20px" }}>
          <h3>Ofertas recomendadas:</h3>

          {data.recomendaciones.map((item, index) => (
            <div
              key={index}
              style={{
                background: "#f7f7f7",
                padding: "12px",
                marginBottom: "10px",
                borderRadius: "10px",
                border: "1px solid #ddd",
              }}
            >
              <p>
                <strong>Título:</strong> {item.titulo}
              </p>
              <p>
                <strong>Puntaje:</strong> {item.puntaje}
              </p>
              <p>
                <strong>ID Oferta:</strong> {item.oferta}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Opcional: dejar el JSON para debugging */}
      <details style={{ marginTop: "20px" }}>
        <summary>Ver JSON completo</summary>
        <pre
          style={{
            background: "#eee",
            padding: "15px",
            borderRadius: "8px",
            overflowX: "auto",
            marginTop: "10px",
          }}
        >
  {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );

}
