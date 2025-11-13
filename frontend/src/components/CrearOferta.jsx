import { useState } from 'react'
import '../styles/FormStyles.css'


function CrearOferta() {
  const [oferta, setOferta] = useState({
    titulo: '',
    descripcion: '',
    empresaId: '',
    tipoContrato: 'Full-time',
    actividadesRequeridas: [],
    nuevaActividad: ''
  })

  const [empresas] = useState([
    { id: 1, nombre: "TechSolutions SA" },
    { id: 2, nombre: "DataDriven Labs" },
    { id: 3, nombre: "Bodega Río Negro" }
  ])

  const actividadesDisponibles = [
    "JavaScript", "Python", "React", "Node.js", "Machine Learning",
    "Data Analysis", "Viticultura", "Turismo", "Marketing", "Ventas"
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setOferta(prev => ({ ...prev, [name]: value }))
  }

  const agregarActividad = () => {
    if (oferta.nuevaActividad && !oferta.actividadesRequeridas.includes(oferta.nuevaActividad)) {
      setOferta(prev => ({
        ...prev,
        actividadesRequeridas: [...prev.actividadesRequeridas, prev.nuevaActividad],
        nuevaActividad: ''
      }))
    }
  }

  const quitarActividad = (actividad) => {
    setOferta(prev => ({
      ...prev,
      actividadesRequeridas: prev.actividadesRequeridas.filter(a => a !== actividad)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Oferta creada:', oferta)
    alert('✅ Oferta de trabajo creada exitosamente (simulación)')
    
    // Reset form
    setOferta({
      titulo: '',
      descripcion: '',
      empresaId: '',
      tipoContrato: 'Full-time',
      actividadesRequeridas: [],
      nuevaActividad: ''
    })
  }

  return (
    <div className="form-container">
      <h3>📝 Crear Nueva Oferta de Trabajo</h3>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Título del Puesto *</label>
          <input
            type="text"
            name="titulo"
            value={oferta.titulo}
            onChange={handleChange}
            placeholder="Ej: Desarrollador Full Stack Senior"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label>Empresa *</label>
          <select
            name="empresaId"
            value={oferta.empresaId}
            onChange={handleChange}
            className="form-input"
            required
          >
            <option value="">Seleccionar empresa...</option>
            {empresas.map(empresa => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de Contrato</label>
          <select
            name="tipoContrato"
            value={oferta.tipoContrato}
            onChange={handleChange}
            className="form-input"
          >
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Remote">Remote</option>
            <option value="Freelance">Freelance</option>
            <option value="Pasantía">Pasantía</option>
          </select>
        </div>

        <div className="form-group">
          <label>Descripción del Puesto</label>
          <textarea
            name="descripcion"
            value={oferta.descripcion}
            onChange={handleChange}
            placeholder="Describe las responsabilidades, requisitos y beneficios del puesto..."
            className="form-input"
            rows="5"
          />
        </div>

        <div className="form-group">
          <label>Actividades/Habilidades Requeridas</label>
          <div className="actividades-selector">
            <select
              value={oferta.nuevaActividad}
              onChange={(e) => setOferta(prev => ({ ...prev, nuevaActividad: e.target.value }))}
              className="form-input"
            >
              <option value="">Seleccionar actividad...</option>
              {actividadesDisponibles.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
            <button 
              type="button" 
              onClick={agregarActividad}
              className="btn btn-secondary"
            >
              Agregar
            </button>
          </div>
          
          <div className="selected-actividades">
            {oferta.actividadesRequeridas.map((act, index) => (
              <span key={index} className="tag with-remove">
                {act}
                <button 
                  type="button" 
                  onClick={() => quitarActividad(act)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            🚀 Publicar Oferta
          </button>
          <button type="button" className="btn btn-secondary">
            Borrar Formulario
          </button>
        </div>
      </form>
    </div>
  )
}

export default CrearOferta