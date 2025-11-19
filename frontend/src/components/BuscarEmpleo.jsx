import React, { useState } from 'react'
import '../styles/FormStyles.css'

export default function BuscarEmpleo() {
  const [filtros, setFiltros] = useState({
    actividad: '',
    area: '',
    especialidad: '', 
    localidad: ''
  })

  const handleChange = (e) => {
    setFiltros(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('🔍 Buscando con filtros:', filtros)
    // Aquí iría la lógica de búsqueda general
  }

  return (
    <section className="busqueda form-container">
      <h2 className="form-titulo">💼 Buscar Empleo</h2>
      <p className="form-subtitulo">Encuentra oportunidades basadas en tus criterios de búsqueda</p>

      <form onSubmit={handleSubmit} className="form-busqueda formulario">
        <div className="campo">
          <label>Actividad</label>
          <input 
            type="text" 
            name="actividad"
            value={filtros.actividad}
            onChange={handleChange}
            placeholder="Ej: Tecnología, Educación..." 
          />
        </div>

        <div className="campo">
          <label>Área</label>
          <input 
            type="text" 
            name="area"
            value={filtros.area}
            onChange={handleChange}
            placeholder="Ej: Ingeniería, Administración..." 
          />
        </div>

        <div className="campo">
          <label>Especialidad</label>
          <input 
            type="text" 
            name="especialidad"
            value={filtros.especialidad}
            onChange={handleChange}
            placeholder="Ej: Programador, Contador..." 
          />
        </div>

        <div className="campo">
          <label>Localidad</label>
          <input 
            type="text" 
            name="localidad"
            value={filtros.localidad}
            onChange={handleChange}
            placeholder="Ej: Bariloche, Viedma..." 
          />
        </div>

        <button type="submit" className="btn-submit">
          🔍 Buscar Ofertas
        </button>
      </form>
    </section>
  )
}