import React, { useState, useEffect } from 'react'
import '../../styles/FormStyles.css'

const RecomendarEmpleo = ({ usuario }) => {
  const [recomendaciones, setRecomendaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (usuario?.dni) {
      cargarRecomendaciones()
    }
  }, [usuario])

  const cargarRecomendaciones = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log("🎯 Cargando recomendaciones personalizadas para:", usuario.dni)
      
      const response = await fetch(`http://localhost:3000/api/matching/matching/${usuario.dni}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener recomendaciones')
      }
      
      const data = await response.json()
      console.log("📊 Recomendaciones Prolog:", data)
      
      setRecomendaciones(data.recomendaciones || [])
      
    } catch (error) {
      console.error("❌ Error:", error)
      setError('No se pudieron cargar las recomendaciones personalizadas')
      setRecomendaciones([])
    } finally {
      setLoading(false)
    }
  }

  const getColorPuntaje = (puntaje) => {
    if (puntaje >= 80) return '#4caf50'
    if (puntaje >= 60) return '#ff9800' 
    return '#f44336'
  }

  return (
    <section className="form-container">
      <div className="form-header">
        <h2 className="form-titulo">🎯 Ofertas Recomendadas para Ti</h2>
        <p className="form-subtitulo">
          Basado en tu perfil, habilidades y experiencia
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔄</div>
          <p>Analizando tu perfil...</p>
        </div>
      ) : error ? (
        <div style={{
          color: "#d32f2f",
          backgroundColor: "#ffebee", 
          padding: "20px",
          borderRadius: "8px",
          textAlign: 'center'
        }}>
          <strong>Error:</strong> {error}
        </div>
      ) : recomendaciones.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🔍</div>
          <h4>No hay recomendaciones personalizadas</h4>
          <p>Actualiza tus habilidades para recibir ofertas más relevantes.</p>
        </div>
      ) : (
        <div className="ofertas-grid">
          {recomendaciones.map((oferta, index) => (
            <div key={index} className="info-card" style={{
              borderLeft: `4px solid ${getColorPuntaje(oferta.puntaje)}`
            }}>
              <div style={{
                position: 'absolute',
                top: '15px', 
                right: '15px',
                background: getColorPuntaje(oferta.puntaje),
                color: 'white',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {Math.round(oferta.puntaje)}% Match
              </div>

              <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-dark)' }}>
                {oferta.titulo || `Oferta #${oferta.oferta}`}
              </h3>
              
              <div style={{ marginTop: '15px' }}>
                <button className="btn-submit" style={{ marginRight: '10px' }}>
                  📨 Postularme
                </button>
                <button className="btn-volver">
                  💾 Guardar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center' 
      }}>
        <button 
          onClick={cargarRecomendaciones}
          className="btn-volver"
          disabled={loading}
        >
          {loading ? '🔄 Actualizando...' : '🔄 Actualizar Recomendaciones'}
        </button>
      </div>
    </section>
  )
}

export default RecomendarEmpleo