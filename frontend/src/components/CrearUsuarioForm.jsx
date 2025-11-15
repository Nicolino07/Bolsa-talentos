import React, { useState } from 'react'
import '../styles/FormStyles.css'
import { registroPersona, registroEmpresa } from '../servicios/Api'

function CrearUsuarioForm({ onVolver, onRegistroSuccess }) {
  const [tipo, setTipo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estados inicializados con strings vacíos
  const [formPersona, setFormPersona] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    fecha_nacimiento: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    sexo: '',
    telefono: ''
  })

  const [formEmpresa, setFormEmpresa] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    telefono: ''
  })

  // Manejar cambios con verificación
  const handleChangePersona = (e) => {
    const { name, value } = e.target
    console.log(`📝 PERSONA - Campo: "${name}", Valor: "${value}"`)
    setFormPersona(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleChangeEmpresa = (e) => {
    const { name, value } = e.target
    console.log(`📝 EMPRESA - Campo: "${name}", Valor: "${value}"`)
    setFormEmpresa(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Validar contraseñas
  const validarPassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return "Las contraseñas no coinciden"
    }
    if (password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres"
    }
    return null
  }

  // Enviar formulario empresa
  const handleSubmitEmpresa = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log('🔍 EMPRESA - Estado actual:', formEmpresa)

    const errorPassword = validarPassword(formEmpresa.password, formEmpresa.confirmPassword)
    if (errorPassword) {
      setError(errorPassword)
      setLoading(false)
      return
    }

    try {
      const datosEnvio = {
        nombre: formEmpresa.nombre,
        email: formEmpresa.email,
        password: formEmpresa.password,
        direccion: formEmpresa.direccion,
        ciudad: formEmpresa.ciudad,
        provincia: formEmpresa.provincia,
        telefono: formEmpresa.telefono || null
      }

      console.log('📤 EMPRESA - Datos a enviar:', datosEnvio)
      
      const resultado = await registroEmpresa(datosEnvio)
      alert('✅ Empresa registrada exitosamente!')
      onRegistroSuccess(resultado)
      
    } catch (error) {
      console.log('❌ EMPRESA - Error:', error)
      setError(error.message || 'Error al registrar empresa')
    } finally {
      setLoading(false)
    }
  }

  // Enviar formulario persona
  const handleSubmitPersona = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    console.log('🔍 PERSONA - Estado actual:', formPersona)

    const errorPassword = validarPassword(formPersona.password, formPersona.confirmPassword)
    if (errorPassword) {
      setError(errorPassword)
      setLoading(false)
      return
    }

    try {
      const datosEnvio = {
        dni: parseInt(formPersona.dni),
        nombre: formPersona.nombre,
        apellido: formPersona.apellido,
        email: formPersona.email,
        password: formPersona.password,
        fecha_nacimiento: formPersona.fecha_nacimiento,
        direccion: formPersona.direccion,
        ciudad: formPersona.ciudad,
        provincia: formPersona.provincia,
        sexo: formPersona.sexo,
        telefono: formPersona.telefono || null
      }

      console.log('📤 PERSONA - Datos a enviar:', datosEnvio)
      
      const resultado = await registroPersona(datosEnvio)
      alert('✅ Persona registrada exitosamente!')
      onRegistroSuccess(resultado)
      
    } catch (error) {
      console.log('❌ PERSONA - Error:', error)
      setError(error.message || 'Error al registrar persona')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-container">
      <button className="btn-volver" onClick={onVolver}>← Volver</button>
      <h2 className="form-titulo">Crear Cuenta</h2>

      {error && (
        <div style={{
          color: "#d32f2f", 
          backgroundColor: "#ffebee", 
          padding: "12px", 
          borderRadius: "8px", 
          marginBottom: "20px", 
          border: "1px solid #f44336"
        }}>
          {error}
        </div>
      )}

      <div className="selector-tipo">
        <button className={`selector-btn ${tipo === "persona" ? "activo" : ""}`} onClick={() => setTipo("persona")}>
          👤 Soy Persona
        </button>
        <button className={`selector-btn ${tipo === "empresa" ? "activo" : ""}`} onClick={() => setTipo("empresa")}>
          🏢 Soy Empresa
        </button>
      </div>

      {/* FORMULARIO EMPRESA - VERIFICAR TODOS LOS NAME */}
      {tipo === "empresa" && (
        <form className="formulario" onSubmit={handleSubmitEmpresa}>
          <div className="campo">
            <label>Nombre de la empresa</label>
            <input type="text" name="nombre" value={formEmpresa.nombre} onChange={handleChangeEmpresa} placeholder="Ingrese el nombre de la empresa" required />
          </div>

          <div className="campo">
            <label>Email</label>
            <input type="email" name="email" value={formEmpresa.email} onChange={handleChangeEmpresa} placeholder="empresa@correo.com" required />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input type="password" name="password" value={formEmpresa.password} onChange={handleChangeEmpresa} placeholder="Mínimo 6 caracteres" required />
          </div>

          <div className="campo">
            <label>Confirmar Contraseña</label>
            <input type="password" name="confirmPassword" value={formEmpresa.confirmPassword} onChange={handleChangeEmpresa} placeholder="Repita su contraseña" required />
          </div>

          <div className="campo">
            <label>Dirección</label>
            <input type="text" name="direccion" value={formEmpresa.direccion} onChange={handleChangeEmpresa} placeholder="Ingrese la dirección" required />
          </div>

          <div className="campo">
            <label>Ciudad</label>
            <input type="text" name="ciudad" value={formEmpresa.ciudad} onChange={handleChangeEmpresa} placeholder="Ingrese la ciudad" required />
          </div>

          <div className="campo">
            <label>Provincia</label>
            <input type="text" name="provincia" value={formEmpresa.provincia} onChange={handleChangeEmpresa} placeholder="Ingrese la provincia" required />
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input type="tel" name="telefono" value={formEmpresa.telefono} onChange={handleChangeEmpresa} placeholder="Ingrese el teléfono de contacto" />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar Empresa"}
          </button>
        </form>
      )}

      {/* FORMULARIO PERSONA - VERIFICAR TODOS LOS NAME */}
      {tipo === "persona" && (
        <form className="formulario" onSubmit={handleSubmitPersona}>
          <div className="campo">
            <label>DNI</label>
            <input type="number" name="dni" value={formPersona.dni} onChange={handleChangePersona} placeholder="Ingrese su DNI" required />
          </div>

          <div className="campo">
            <label>Apellido</label>
            <input type="text" name="apellido" value={formPersona.apellido} onChange={handleChangePersona} placeholder="Ingrese su apellido" required />
          </div>

          <div className="campo">
            <label>Nombre</label>
            <input type="text" name="nombre" value={formPersona.nombre} onChange={handleChangePersona} placeholder="Ingrese su nombre" required />
          </div>

          <div className="campo">
            <label>Email</label>
            <input type="email" name="email" value={formPersona.email} onChange={handleChangePersona} placeholder="ejemplo@correo.com" required />
          </div>

          <div className="campo">
            <label>Contraseña</label>
            <input type="password" name="password" value={formPersona.password} onChange={handleChangePersona} placeholder="Mínimo 6 caracteres" required />
          </div>

          <div className="campo">
            <label>Confirmar Contraseña</label>
            <input type="password" name="confirmPassword" value={formPersona.confirmPassword} onChange={handleChangePersona} placeholder="Repita su contraseña" required />
          </div>

          <div className="campo">
            <label>Fecha de nacimiento</label>
            <input type="date" name="fecha_nacimiento" value={formPersona.fecha_nacimiento} onChange={handleChangePersona} required />
          </div>

          <div className="campo">
            <label>Dirección</label>
            <input type="text" name="direccion" value={formPersona.direccion} onChange={handleChangePersona} placeholder="Ingrese su dirección" required />
          </div>

          <div className="campo">
            <label>Ciudad</label>
            <input type="text" name="ciudad" value={formPersona.ciudad} onChange={handleChangePersona} placeholder="Ingrese su ciudad" required />
          </div>

          <div className="campo">
            <label>Provincia</label>
            <input type="text" name="provincia" value={formPersona.provincia} onChange={handleChangePersona} placeholder="Ingrese su provincia" required />
          </div>

          <div className="campo">
            <label>Sexo</label>
            <select name="sexo" value={formPersona.sexo} onChange={handleChangePersona} required>
              <option value="">Seleccione...</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
              <option value="Prefiero no decir">Prefiero no decir</option>
            </select>
          </div>

          <div className="campo">
            <label>Teléfono</label>
            <input type="tel" name="telefono" value={formPersona.telefono} onChange={handleChangePersona} placeholder="Ingrese su teléfono" />
          </div>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Registrando..." : "Registrar Persona"}
          </button>
        </form>
      )}
    </div>
  )
}

export default CrearUsuarioForm