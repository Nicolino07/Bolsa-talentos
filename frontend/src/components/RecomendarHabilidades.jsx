import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RecomendarHabilidades({ dni }) {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dni) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `/api/actividades/recomendaciones/habilidades/${dni}`
        );

        const postResp = await axios.get(`/api/postulaciones/`);

        setRecomendaciones(response.data.recomendaciones || []);
        setPostulaciones(postResp.data || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar recomendaciones");
      }
    };

    fetchData();
  }, [dni]);

  const yaPostulado = (id_oferta) =>
    postulaciones.some((p) => p.dni === dni && p.id_oferta === id_oferta);

  const eliminarPostulacion = async (id_oferta) => {
    try {
      await axios.delete(`/api/postulaciones/${dni}/${id_oferta}`);
      setPostulaciones((p) =>
        p.filter((x) => !(x.dni === dni && x.id_oferta === id_oferta))
      );
    } catch (err) {
      console.error(err.response?.data || err);
      alert("No se pudo cancelar la postulación.");
    }
  };

  const crearPostulacion = async (id_oferta) => {
    const payload = { dni, id_oferta };

    try {
      const resp = await axios.post("/api/postulaciones/", payload);
      setPostulaciones((prev) => [...prev, resp.data]);
    } catch (err) {
      console.error("Error al postular:", err.response?.data || err);
      alert("No se pudo postular.");
    }
  };

  const pct = (c) => Math.round(c * 100);

  return (
    <div className="perfil-content">
      <div className="form-container">
        <h2 className="form-titulo">🎯 Recomendaciones según tus habilidades</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div className="formulario">
          {recomendaciones.map((rec, i) => {
            const match = pct(rec.confianza);

            // 🔥 Si no hay ofertas → crear 1 oferta virtual para habilitar botones
            const ofertas =
              rec.ofertas?.length > 0
                ? rec.ofertas
                : [
                    {
                      id_oferta: `virtual_${i}`, // ID único ficticio
                      titulo: `Recomendación para ${rec.habilidad}`,
                      descripcion:
                        "Postulación basada en tu habilidad recomendada.",
                    },
                  ];

            return (
              <div
                key={i}
                className="card"
                style={{
                  background: "white",
                  padding: 20,
                  borderRadius: 12,
                  marginBottom: 25,
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                }}
              >
                {/* HEADER */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 15,
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, color: "var(--primary-dark)" }}>
                      {rec.habilidad}
                    </h3>

                    <span
                      style={{
                        display: "inline-block",
                        marginTop: 5,
                        padding: "4px 10px",
                        borderRadius: 6,
                        background: "var(--accent-color)",
                        fontSize: "0.8rem",
                      }}
                    >
                      Match: {match}%
                    </span>
                  </div>

                  <span
                    style={{
                      padding: "6px 12px",
                      borderRadius: 6,
                      background: "var(--primary-main)",
                      color: "white",
                      fontSize: "0.8rem",
                    }}
                  >
                    {ofertas.length} coincidencia{ofertas.length > 1 ? "s" : ""}
                  </span>
                </div>

                {/* RAZÓN */}
                <p style={{ marginBottom: 20, color: "var(--text-secondary)" }}>
                  <strong>Razón:</strong> {rec.razon}
                </p>

                {/* OFERTAS (siempre hay 1 mínima) */}
                <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
                  {ofertas.map((oferta) => {
                    const postulado = yaPostulado(oferta.id_oferta);

                    return (
                      <div
                        key={oferta.id_oferta}
                        style={{
                          border: "1px solid #ddd",
                          padding: 15,
                          borderRadius: 10,
                          background: "#fafafa",
                        }}
                      >
                        <h5
                          style={{
                            margin: "0 0 5px 0",
                            color: "var(--primary-main)",
                          }}
                        >
                          {oferta.titulo}
                        </h5>

                        <p
                          style={{
                            margin: "0 0 15px 0",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {oferta.descripcion}
                        </p>

                        {/* BOTONES SIEMPRE */}
                        {!postulado ? (
                          <button
                            className="btn-submit"
                            onClick={() => crearPostulacion(oferta.id_oferta)}
                          >
                            Postularme
                          </button>
                        ) : (
                          <div style={{ display: "flex", gap: 10 }}>
                            <button
                              className="btn-submit"
                              disabled
                              style={{ background: "gray" }}
                            >
                              Ya postulado
                            </button>

                            <button
                              className="btn-volver"
                              style={{
                                background: "#e53935",
                                color: "white",
                                border: "none",
                              }}
                              onClick={() => eliminarPostulacion(oferta.id_oferta)}
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
