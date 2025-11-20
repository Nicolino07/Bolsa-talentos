import React, { useEffect, useState } from "react";
import axios from "axios";

function MatchingPersona({ dni }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dni) return;

    const fetchMatching = async () => {
      try {
        const resp = await axios.get(
          `http://localhost:3000/api/matching/matching/${dni}`
        );
        setData(resp.data);
      } catch (err) {
        console.error(err);
        setError("Error al obtener coincidencias.");
      } finally {
        setLoading(false);
      }
    };

    fetchMatching();
  }, [dni]);

  return (
    <div className="perfil-content">
      <h2 className="form-titulo">🔍 Resultados de la Busqueda</h2>

      {loading && <p>Cargando coincidencias...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && data && (
        <div style={{ marginTop: "20px" }}>
          {data.recomendaciones?.length > 0 ? (
            data.recomendaciones.map((rec) => (
              <div
                key={rec.oferta}
                style={{
                  padding: "15px",
                  borderRadius: "10px",
                  marginBottom: "15px",
                  background: "white",
                  border: "1px solid #ddd",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ margin: "0 0 8px 0" }}>{rec.titulo}</h3>
                <p style={{ margin: 0 }}>
                  <strong>Puntaje:</strong> {rec.puntaje}%
                </p>
                <p style={{ margin: 0 }}>
                  <strong>ID Oferta:</strong> {rec.oferta}
                </p>
              </div>
            ))
          ) : (
            <p>No se encontraron coincidencias.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default MatchingPersona;
