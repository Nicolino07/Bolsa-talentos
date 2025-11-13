import React from 'react'
import '../styles/FormStyles.css'

export default function BuscarEmpleo() {
  return (
    <section className="busqueda form-container">
      <h2 className="form-titulo">💼 Buscar Empleo</h2>

      <form className="form-busqueda formulario">

        <div className="campo">
          <label>Actividad</label>
          <input type="text" placeholder="Ej: Tecnología, Educación..." />
        </div>

        <div className="campo">
          <label>Área</label>
          <input type="text" placeholder="Ej: Ingeniería, Administración..." />
        </div>

        <div className="campo">
          <label>Especialidad</label>
          <input type="text" placeholder="Ej: Programador, Contador..." />
        </div>

        <div className="campo">
          <label>Localidad</label>
          <input type="text" placeholder="Ej: Bariloche, Viedma..." />
        </div>

        <button type="submit" className="btn-submit">
          Buscar
        </button>
      </form>
    </section>
  )
}
