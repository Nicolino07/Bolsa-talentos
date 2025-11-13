import { useState, useEffect } from 'react'
import '../styles/FormStyles.css'

function BuscarEmpresa() {
  const [empresas, setEmpresas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(false)

  // Simular carga de empresas
  useEffect(() => {
    setCargando(true)
    // Por ahora datos mock, luego conectar a API
    setTimeout(() => {
      setEmpresas([
        { id: 1, nombre: "TechSolutions SA", ciudad: "Buenos Aires", provincia: "Buenos Aires", actividades: ["Desarrollo Software", "AI"] },
        { id: 2, nombre: "DataDriven Labs", ciudad: "CABA", provincia: "Buenos Aires", actividades: ["Data Science", "Analytics"] },
        { id: 3, nombre: "Bodega Río Negro", ciudad: "General Roca", provincia: "Río Negro", actividades: ["Viticultura", "Turismo"] },
        { id: 4, nombre: "Petróleo Neuquino SA", ciudad: "Neuquén", provincia: "Neuquén", actividades: ["Energía", "Ingeniería"] }
      ])
      setCargando(false)
    }, 1000)
  }, [])

  const empresasFiltradas = empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    empresa.ciudad.toLowerCase().includes(filtro.toLowerCase()) ||
    empresa.actividades.some(act => act.toLowerCase().includes(filtro.toLowerCase()))
  )

  return (
    <div className="form-container">
      <div className="search-header">
        <h3>🔍 Buscar Empresas</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, ciudad o actividad..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="form-input search-input"
          />
        </div>
      </div>

      {cargando ? (
        <div className="loading">Cargando empresas...</div>
      ) : (
        <div className="results-grid">
          {empresasFiltradas.map(empresa => (
            <div key={empresa.id} className="empresa-card">
              <h4>{empresa.nombre}</h4>
              <p>📍 {empresa.ciudad}, {empresa.provincia}</p>
              <div className="actividades">
                <strong>Actividades:</strong>
                <div className="tags">
                  {empresa.actividades.map((act, index) => (
                    <span key={index} className="tag">{act}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-secondary btn-sm">
                Ver Detalles
              </button>
            </div>
          ))}
        </div>
      )}

      {!cargando && empresasFiltradas.length === 0 && (
        <div className="no-results">
          <p>No se encontraron empresas con ese criterio de búsqueda.</p>
        </div>
      )}
    </div>
  )
}

export default BuscarEmpresa