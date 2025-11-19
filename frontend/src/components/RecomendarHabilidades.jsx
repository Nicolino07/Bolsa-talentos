import React, { useEffect, useState } from "react";
import axios from "axios";

export default function RecomendarHabilidades({ dni }) {
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [postulaciones, setPostulaciones] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!dni) {
      console.error("❌ No se recibió DNI.");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("📡 Solicitando recomendaciones para DNI:", dni);

        const response = await axios.get(
          `/api/actividades/recomendaciones/habilidades/${dni}`
        );
        const postResp = await axios.get(`/api/postulaciones/`);

        console.log("📊 Respuesta del backend:", response.data);

        setRecomendaciones(response.data.recomendaciones || []);
        setPostulaciones(postResp.data);

      } catch (err) {
        console.error("❌ Error cargando recomendaciones:", err);
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
      alert("Postulación cancelada.");
      setPostulaciones((prev) =>
        prev.filter((p) => !(p.dni === dni && p.id_oferta === id_oferta))
      );
    } catch (err) {
      console.error("❌ Error al eliminar postulación:", err);
      alert("No se pudo cancelar la postulación.");
    }
  };

  const crearPostulacion = async (id_oferta) => {
    const payload = {
      dni,
      id_oferta,
      estado: "pendiente",
    };

    console.log("📨 Enviando postulación:", payload);

    try {
      const resp = await axios.post("/api/postulaciones/", payload);

      alert("Postulación realizada!");

      setPostulaciones((prev) => [...prev, payload]);

    } catch (err) {
      console.error("❌ Error al postular:", err.response?.data || err);
      alert("No se pudo postular.");
    }
  };

  return (
    <div className="perfil-content">
      <div className="form-container">
        <h2 className="form-titulo">Recomendaciones según tus habilidades</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        {recomendaciones.length === 0 && !error && (
          <div className="seccion-placeholder">
            <p>No hay recomendaciones disponibles en este momento.</p>
          </div>
        )}

        <div className="formulario">
          {recomendaciones.map((rec, index) => (
            <div key={index} className="oferta-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h3 style={{ color: 'var(--primary-dark)', margin: '0 0 8px 0' }}>{rec.habilidad}</h3>
                  <div className="habilidad-item" style={{ display: 'inline-flex', marginBottom: '0' }}>
                    Confianza: {rec.confianza}%
                  </div>
                </div>
                <div className="habilidad-item" style={{ background: 'var(--primary-main)' }}>
                  {rec.ofertas?.length || 0} ofertas
                </div>
              </div>
              
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                <strong>Razón:</strong> {rec.razon}
              </p>

              {rec.ofertas?.length > 0 ? (
                <div>
                  <h4 style={{ color: 'var(--primary-dark)', marginBottom: '15px' }}>Ofertas disponibles</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {rec.ofertas.map((oferta) => {
                      const postulado = yaPostulado(oferta.id_oferta);

                      return (
                        <div key={oferta.id_oferta} className="oferta-item" style={{ background: '#f8f9fa', padding: '20px' }}>
                          <div style={{ marginBottom: '15px' }}>
                            <h5 style={{ color: 'var(--primary-main)', margin: '0 0 8px 0' }}>{oferta.titulo}</h5>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{oferta.descripcion}</p>
                          </div>
                          
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {!postulado ? (
                              <button 
                                className="btn-submit"
                                onClick={() => crearPostulacion(oferta.id_oferta)}
                                style={{ padding: '10px 20px', fontSize: '0.9rem' }}
                              >
                                Postularme
                              </button>
                            ) : (
                              <>
                                <button 
                                  className="btn-submit" 
                                  disabled 
                                  style={{ 
                                    background: 'var(--text-secondary)',
                                    padding: '10px 20px',
                                    fontSize: '0.9rem'
                                  }}
                                >
                                  Ya Postulado
                                </button>
                                <button
                                  className="btn-volver"
                                  onClick={() => eliminarPostulacion(oferta.id_oferta)}
                                  style={{ 
                                    background: '#f44336',
                                    color: 'white',
                                    padding: '10px 20px',
                                    fontSize: '0.9rem',
                                    border: 'none'
                                  }}
                                >
                                  Cancelar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="seccion-placeholder" style={{ padding: '20px', margin: '10px 0' }}>
                  <p>No hay ofertas para esta habilidad</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
