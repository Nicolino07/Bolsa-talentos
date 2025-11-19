import React, { useState, useEffect } from 'react'
import '../styles/FormStyles.css'

const RecomendarHabilidades = ({ usuario }) => {
  const [recomendaciones, setRecomendaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [aprendizajeEjecutado, setAprendizajeEjecutado] = useState(false)

  useEffect(() => {
    if (usuario?.dni) {
      cargarRecomendacionesHabilidades()
    }
  }, [usuario])

  const cargarRecomendacionesHabilidades = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log("🧠 Cargando recomendaciones de habilidades para:", usuario.dni)
      
      const response = await fetch(`http://localhost:3000/api/actividades/recomendaciones/habilidades/${usuario.dni}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("📊 Respuesta COMPLETA del backend:", data)
      
      // Manejar diferentes estructuras de respuesta
      let recomendacionesObtenidas = []
      
      if (Array.isArray(data)) {
        // Si la respuesta es directamente un array
        recomendacionesObtenidas = data
      } else if (data.recomendaciones && Array.isArray(data.recomendaciones)) {
        // Si viene en formato {recomendaciones: [...]}
        recomendacionesObtenidas = data.recomendaciones
      } else if (data.habilidades && Array.isArray(data.habilidades)) {
        // Si viene en formato {habilidades: [...]}
        recomendacionesObtenidas = data.habilidades
      } else if (data.data && Array.isArray(data.data)) {
        // Si viene en formato {data: [...]}
        recomendacionesObtenidas = data.data
      }
      
      console.log("📊 Recomendaciones procesadas:", recomendacionesObtenidas)
      
      // Filtrar recomendaciones vacías o inválidas
      const recomendacionesValidas = recomendacionesObtenidas.filter(item => 
        item && (item.habilidad || item.nombre || item.skill)
      )
      
      setRecomendaciones(recomendacionesValidas)
      
      if (recomendacionesValidas.length === 0) {
        console.log("⚠️ No se encontraron recomendaciones válidas en la respuesta")
      }
      
    } catch (error) {
      console.error("❌ Error:", error)
      setError(`Error al cargar recomendaciones: ${error.message}`)
      setRecomendaciones([])
    } finally {
      setLoading(false)
    }
  }

  const ejecutarAprendizaje = async () => {
    try {
        setLoading(true)
        setDebugInfo('Ejecutando aprendizaje y sincronización...')
        console.log("🎓 Ejecutando aprendizaje automático...")
        
        // Paso 1: Ejecutar aprendizaje en Prolog
        const responseAprendizaje = await fetch('http://localhost:3000/api/actividades/sistema-aprendizaje/ejecutar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
        })
        
        if (!responseAprendizaje.ok) {
        throw new Error(`Error en aprendizaje automático: ${responseAprendizaje.status}`)
        }
    
        const dataAprendizaje = await responseAprendizaje.json()
        console.log("✅ Aprendizaje completado:", dataAprendizaje)
        
        setDebugInfo('Aprendizaje completado. Sincronizando relaciones...')
        
        // Paso 2: Sincronizar relaciones con PostgreSQL
        try {
        const responseSincronizar = await fetch('http://localhost:3000/api/actividades/sistema-aprendizaje/sincronizar-relaciones', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            }
        })
        
        if (responseSincronizar.ok) {
            const dataSync = await responseSincronizar.json()
            console.log("✅ Sincronización completada:", dataSync)
            setDebugInfo('Aprendizaje y sincronización completados')
        }
        } catch (syncError) {
        console.log("⚠️ Sincronización manual no disponible:", syncError)
        }
        
        setAprendizajeEjecutado(true)
        
        // Esperar y recargar recomendaciones
        setTimeout(() => {
        console.log("🔄 Recargando recomendaciones...")
        cargarRecomendacionesHabilidades()
        }, 2000)
        
        } catch (error) {
            console.error("❌ Error en aprendizaje:", error)
            setError(`Error en el sistema de aprendizaje: ${error.message}`)
            setDebugInfo('Error en el proceso')
        }
    }

  const getNombreHabilidad = (habilidad) => {
    return habilidad.habilidad || habilidad.nombre || habilidad.skill || 'Habilidad sin nombre'
  }

  const getConfianza = (habilidad) => {
    return habilidad.confianza || habilidad.score || habilidad.puntuacion || 0.5
  }

  const getRazon = (habilidad) => {
    return habilidad.razon || habilidad.motivo || 'co_ocurrencia'
  }

  const getColorConfianza = (confianza) => {
    if (confianza >= 0.7) return '#4caf50'
    if (confianza >= 0.4) return '#ff9800'
    return '#f44336'
  }

  const getNivelConfianza = (confianza) => {
    if (confianza >= 0.7) return 'Alta'
    if (confianza >= 0.4) return 'Media'
    return 'Baja'
  }

  return (
    <section className="form-container">
      <div className="form-header">
        <h2 className="form-titulo">🧠 Empleos Recomendados</h2>
        <p className="form-subtitulo">
          Basado en aprendizaje automático de co-ocurrencias
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>⏳</div>
          <p>Analizando patrones de habilidades...</p>
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
          <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🤔</div>
          <h4>No hay recomendaciones de habilidades</h4>
          <p>El sistema está analizando patrones. Intenta ejecutar el aprendizaje automático.</p>
          <button 
            onClick={ejecutarAprendizaje}
            className="btn-submit"
            style={{ marginTop: '15px' }}
          >
            🎓 Ejecutar Aprendizaje Automático
          </button>
        </div>
      ) : (
        <div className="habilidades-grid">
          {recomendaciones.map((habilidad, index) => (
            <div key={index} className="info-card" style={{
              borderLeft: `4px solid ${getColorConfianza(getConfianza(habilidad))}`
            }}>
              <div style={{
                position: 'absolute',
                top: '15px', 
                right: '15px',
                background: getColorConfianza(getConfianza(habilidad)),
                color: 'white',
                padding: '5px 10px',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {getNivelConfianza(getConfianza(habilidad))}
              </div>

              <h3 style={{ margin: '0 0 10px 0', color: 'var(--primary-dark)' }}>
                {getNombreHabilidad(habilidad)}
              </h3>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Confianza:</strong> {(getConfianza(habilidad) * 100).toFixed(1)}%
              </div>
              
              <div style={{ 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)',
                fontStyle: 'italic'
              }}>
                🎯 {getRazon(habilidad) === 'co_ocurrencia' ? 
                  'Recomendada por aprendizaje automático' : 
                  getRazon(habilidad)}
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <button className="btn-submit" style={{ marginRight: '10px' }}>
                  📚 Aprender
                </button>
                <button className="btn-volver">
                  💾 Interesado
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        gap: '10px'
      }}>
        <button 
          onClick={cargarRecomendacionesHabilidades}
          className="btn-volver"
          disabled={loading}
        >
          {loading ? '🔄 Actualizando...' : '🔄 Actualizar Recomendaciones'}
        </button>
        
        <button 
          onClick={ejecutarAprendizaje}
          className="btn-submit"
          disabled={loading}
        >
          🎓 Ejecutar Aprendizaje
        </button>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: 'var(--text-secondary)'
      }}>
        <strong>💡 ¿Cómo funciona?</strong>
        <p style={{ margin: '5px 0 0 0' }}>
          El sistema analiza patrones de habilidades que suelen aparecer juntas 
          en personas con perfiles similares al tuyo usando inteligencia artificial.
        </p>
        {aprendizajeEjecutado && (
          <p style={{ margin: '5px 0 0 0', color: '#4caf50' }}>
            ✅ El aprendizaje automático se ejecutó correctamente. Actualiza las recomendaciones.
          </p>
        )}
      </div>
    </section>
  )
}

export default RecomendarHabilidades