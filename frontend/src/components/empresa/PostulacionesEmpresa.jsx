import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/FormStyles.css";

const ESTADOS = ["pendiente", "entrevista", "contratado", "rechazado"];

const PostulacionesEmpresa = ({ usuario }) => {
  const [ofertasAgrupadas, setOfertasAgrupadas] = useState([]);

  useEffect(() => {
    fetchPostulaciones();
  }, []);

  const fetchPostulaciones = async () => {
    try {
      const res = await axios.get(`/api/postulaciones/empresa/${usuario.id_empresa}`);

      // Agrupación por oferta
      const agrupadas = res.data.reduce((acc, p) => {
        const id = p.oferta.id_oferta;

        if (!acc[id]) {
          acc[id] = {
            oferta: p.oferta,
            postulantes: [],
            abierta: false,
          };
        }

        acc[id].postulantes.push(p);
        return acc;
      }, {});

      setOfertasAgrupadas(Object.values(agrupadas));
    } catch (error) {
      console.error("Error cargando postulaciones empresa:", error);
    }
  };

  const actualizarEstado = async (id_postulacion, nuevoEstado) => {
    try {
      await axios.put(`/api/postulaciones/${id_postulacion}/estado?estado=${nuevoEstado}`);
      fetchPostulaciones();
    } catch (err) {
      console.error("Error actualizando estado:", err);
    }
  };

  // Función para obtener el color del badge según el estado
  const getEstadoColor = (estado) => {
    switch (estado) {
      case "pendiente":
        return "var(--primary-main)";
      case "entrevista":
        return "var(--accent-color)";
      case "contratado":
        return "#4CAF50";
      case "rechazado":
        return "#f44336";
      default:
        return "var(--text-secondary)";
    }
  };

  return (
    <div className="perfil-content">
      <div className="form-container">
        <h2 className="form-titulo">Postulaciones Recibidas</h2>

        {ofertasAgrupadas.length === 0 ? (
          <div className="seccion-placeholder">
            <p>No hay postulaciones recibidas</p>
          </div>
        ) : (
          <div className="formulario">
            {ofertasAgrupadas.map((grupo, index) => (
              <div key={index} className="oferta-item">
                <div
                  className="card-header"
                  style={{ 
                    cursor: "pointer",
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    padding: '20px',
                    borderBottom: '1px solid var(--divider-color)'
                  }}
                  onClick={() => {
                    const copia = [...ofertasAgrupadas];
                    copia[index].abierta = !copia[index].abierta;
                    setOfertasAgrupadas(copia);
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'var(--primary-dark)', margin: '0 0 8px 0' }}>
                      {grupo.oferta.titulo}
                    </h3>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
                      {grupo.oferta.descripcion}
                    </p>
                  </div>

                  <div 
                    className="habilidad-item" 
                    style={{ 
                      background: 'var(--primary-main)',
                      marginLeft: '15px'
                    }}
                  >
                    {grupo.postulantes.length} postulante{grupo.postulantes.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {grupo.abierta && (
                  <div style={{ padding: '20px' }}>
                    {grupo.postulantes.map((p) => (
                      <div
                        key={p.id_postulacion}
                        className="oferta-item"
                        style={{ 
                          marginBottom: '16px',
                          background: 'var(--primary-light)'
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          marginBottom: '15px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ color: 'var(--primary-dark)', margin: '0 0 8px 0' }}>
                              {p.persona.apellido}, {p.persona.nombre}
                            </h4>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                              <div>DNI: {p.persona.dni}</div>
                              <div>Email: {p.persona.email}</div>
                            </div>
                          </div>

                          <div 
                            className="habilidad-item"
                            style={{ 
                              background: getEstadoColor(p.estado),
                              marginLeft: '15px'
                            }}
                          >
                            {p.estado}
                          </div>
                        </div>

                        <div>
                          <h5 style={{ 
                            color: 'var(--text-secondary)', 
                            margin: '0 0 12px 0',
                            fontSize: '0.95rem'
                          }}>
                            Cambiar estado:
                          </h5>
                          <div style={{ 
                            display: 'flex', 
                            gap: '8px', 
                            flexWrap: 'wrap'
                          }}>
                            {ESTADOS.map((estado) => (
                              <button
                                key={estado}
                                className={`selector-btn ${p.estado === estado ? 'activo' : ''}`}
                                onClick={() => actualizarEstado(p.id_postulacion, estado)}
                                style={{
                                  padding: '8px 16px',
                                  fontSize: '0.85rem',
                                  minWidth: 'auto'
                                }}
                              >
                                {estado}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostulacionesEmpresa;