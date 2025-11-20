import React, { useState } from 'react'
import '../styles/FormStyles.css'
import axios from 'axios'

export default function BuscarEmpleo() {
  const [consulta, setConsulta] = useState("")
  const [resultados, setResultados] = useState([])
  const [cargando, setCargando] = useState(false)

  const realizarBusqueda = async () => {
    if (!consulta.trim()) return
    setCargando(true)

    try {
      console.log("🔍 Buscando SEMÁNTICO:", consulta)

      const resp = await axios.get("/api/matching/buscar_semantica", {
        params: { consulta }
      })

      setResultados(resp.data)

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

  const habilitado = consulta.trim() !== ""

  return (
    <section className="busqueda form-container">
      
      <h2 className="form-titulo">💼 Buscar Empleo</h2>
      <p className="form-subtitulo">
        Usa lenguaje natural para una búsqueda inteligente (semántica)
      </p>

      {/* FORMULARIO */}
      <form onSubmit={handleSubmit} className="form-busqueda formulario">

        {/* 🔍 Campo de búsqueda */}
        <div className="campo">
          <label>Búsqueda Semántica</label>
          <input
            type="text"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
            placeholder="Ej: mozo, atención al cliente, mantenimiento..."
          />
        </div>

        {/* Botón */}
        <button
          type="submit"
          className="btn-submit"
          disabled={!habilitado || cargando}
        >
          {cargando ? "⏳ Buscando..." : "🔍 Buscar Ofertas"}
        </button>

      </form>

      {/* RESULTADOS */}
      <div className="resultados" style={{ marginTop: "30px" }}>
        {resultados.length > 0 && (
          <>
            <h3>📌 Resultados encontrados ({resultados.length})</h3>

            {resultados.map((oferta) => (
              <div key={oferta.id_oferta} className="oferta-item">
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
