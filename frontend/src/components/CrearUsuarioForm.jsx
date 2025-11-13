import React, { useState } from 'react'
import '../styles/FormStyles.css'

function CrearUsuarioForm({ onVolver }) {
  const [tipo, setTipo] = useState("") // persona o empresa

  const handleSubmit = (e) => {
    e.preventDefault()
    // Lógica de envío del formulario
    console.log("Formulario enviado:", tipo)
  }

  return (
    <div className="form-container">
      {/* === BOTÓN VOLVER === */}
      <button className="btn-volver" onClick={onVolver}>
        ← Volver
      </button>

      <h2 className="form-titulo">Crear Cuenta</h2>

      {/* Selección de tipo */}
      <div className="selector-tipo">
        <button 
          className={`selector-btn ${tipo === "persona" ? "activo" : ""}`}
          onClick={() => setTipo("persona")}
          type="button"
        >
          👤 Soy Persona
        </button>
        
        <button 
          className={`selector-btn ${tipo === "empresa" ? "activo" : ""}`}
          onClick={() => setTipo("empresa")}
          type="button"
        >
          🏢 Soy Empresa
        </button>
      </div>

      {/* --- FORMULARIO PERSONA --- */}
      {tipo === "persona" && (
        <form className="formulario" onSubmit={handleSubmit}>
          <div className="campo">
            <label>DNI</label>
            <input type="number" placeholder="Ingrese su DNI" required />
          </div>

          <div className="campo">
            <label>Apellido</label>
            <input type="text" placeholder="Ingrese su apellido" required />
          </div>

          <div className="campo">
            <label>Nombre</label>
            <input type="text" placeholder="Ingrese su nombre" required />
          </div>

          <div className="campo">
            <label>Fecha de nacimiento</label>
            <input type="date" required />
          </div>

          <div className="campo">
            <label>Dirección</label>
            <input type="text" placeholder="Ingrese su dirección" required />
          </div>

          <div className="campo">
            <label>Ciudad</label>
            <input type="text" placeholder="Ingrese su ciudad" required />
          </div>

          <div className="campo">
            <label>Provincia</label>
            <input type="text" placeholder="Ingrese su provincia" required />
          </div>

          <div className="campo">
            <label>Sexo</label>
            <select required>
              <option value="">Seleccione...</option>
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero-no-decir">Prefiero no decir</option>
            </select>
          </div>

          <div className="campo">
            <label>Email</label>
            <input type="email" placeholder="ejemplo@correo.com" required />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input type="tel" placeholder="Ingrese su teléfono" />
          </div>

          <button className="btn-submit" type="submit">
            Registrar Persona
          </button>
        </form>
      )}

      {/* --- FORMULARIO EMPRESA --- */}
      {tipo === "empresa" && (
        <form className="formulario" onSubmit={handleSubmit}>
          <div className="campo">
            <label>Nombre de la empresa</label>
            <input type="text" placeholder="Ingrese el nombre de la empresa" required />
          </div>

          <div className="campo">
            <label>Dirección</label>
            <input type="text" placeholder="Ingrese la dirección" required />
          </div>

          <div className="campo">
            <label>Ciudad</label>
            <input type="text" placeholder="Ingrese la ciudad" required />
          </div>

          <div className="campo">
            <label>Provincia</label>
            <input type="text" placeholder="Ingrese la provincia" required />
          </div>

          <div className="campo">
            <label>Correo electrónico</label>
            <input type="email" placeholder="empresa@correo.com" required />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input type="tel" placeholder="Ingrese el teléfono de contacto" />
          </div>

          <button className="btn-submit" type="submit">
            Registrar Empresa
          </button>
        </form>
      )}
    </div>
  )
}

export default CrearUsuarioForm