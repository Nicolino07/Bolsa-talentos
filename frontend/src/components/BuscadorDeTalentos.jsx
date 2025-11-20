import React, { useState } from 'react'
import '../styles/FormStyles.css'
import axios from 'axios'

export default function BuscarEmpleo() {
  const [consulta, setConsulta] = useState("")  
  const [filtros, setFiltros] = useState({
    actividad: '',
    area: '',
    especialidad: '',
    localidad: ''
  })

  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    setFiltros(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const realizarBusqueda = async () => {
    setCargando(true)
    try {
      let data

      if (consulta.trim() !== "") {
        console.log("🔍 Buscando SEMÁNTICO:", consulta)

        const resp = await axios.get("/api/matching/buscar_semantica", {
          params: { consulta }
        })

        data = resp.data

      } else {
        console.log("🔍 Buscando por filtros:", filtros)

        const resp = await axios.get("/api/ofertas/buscar", {
          params: filtros
        })

        data = resp.data
      }

      setResultados(data)

    } catch (error) {
      console.error("❌ Error buscando ofertas:", error)
    } finally {
      setCargando(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    realizarBusqueda()
  }

  const hayFiltros = Object.values(filtros).some(v => v.trim() !== "")
  const habilitado = consulta.trim() !== "" || hayFiltros

  return (
    <section className="form-container">
      
      <h2 className="form-titulo">💼 Buscar Empleo</h2>
      <p className="form-subtitulo">
        Usa términos naturales para una búsqueda inteligente (semántica)
      </p>

      <form onSubmit={handleSubmit} className="formulario">

        {/* 🌟 BÚSQUEDA SEMÁNTICA */}
        <div className="campo">
          <label>Búsqueda Semántica</label>
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Ej: mozo, atención al cliente, mantenimiento..."
          />
        </div>

        <hr className="separador" />

        {/* 🔎 FILTROS EN 2 COLUMNAS */}
        <div className="filtros-grid">
          
          <div className="campo">
            <label>Actividad</label>
            <input
              type="text"
              name="actividad"
              value={filtros.actividad}
              onChange={handleChange}
              placeholder="Ej: Tecnología, Turismo, Construcción"
            />
          </div>

          <div className="campo">
            <label>Área</label>
            <input
              type="text"
              name="area"
              value={filtros.area}
              onChange={handleChange}
              placeholder="Ej: Ingeniería, Administración"
            />
          </div>

          <div className="campo">
            <label>Especialidad</label>
            <input
              type="text"
              name="especialidad"
              value={filtros.especialidad}
              onChange={handleChange}
              placeholder="Ej: Programador, Contador, Mozo"
            />
          </div>

          <div className="campo">
            <label>Ciudad</label>
            <input
              type="text"
              name="localidad"
              value={filtros.localidad}
              onChange={handleChange}
              placeholder="Ej: Bariloche, Viedma"
            />
          </div>

        </div>

        {/* BOTÓN CENTRADO */}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button 
            type="submit" 
            className="btn-submit" 
            disabled={!habilitado || cargando}
          >
            {cargando ? "⏳ Buscando..." : "🔍 Buscar Ofertas"}
          </button>
        </div>

      </form>

      {/* RESULTADOS */}
      <div className="resultados" style={{ marginTop: "30px" }}>
        {resultados.length > 0 && (
          <>
            <h3>📌 Resultados ({resultados.length})</h3>

            {resultados.map((oferta) => (
              <div key={oferta.id_oferta} className="tarjeta-resultado">
                <h4>{oferta.titulo}</h4>
                <p>{oferta.descripcion}</p>
                <p><strong>Ciudad:</strong> {oferta.ciudad}</p>
              </div>
            ))}
          </>
        )}

        {resultados.length === 0 && habilitado && !cargando && (
          <p>No se encontraron resultados.</p>
        )}
      </div>

    </section>
  )
}
