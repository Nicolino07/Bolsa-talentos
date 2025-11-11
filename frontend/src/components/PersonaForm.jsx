import React, { useState } from 'react'
import { crearPersona } from '../servicios/Api'
import '../styles/FormStyles.css'

/**
 * Componente PersonaForm para capturar datos y crear una nueva persona.
 * 
 * Usa el hook useState para gestionar el estado del formulario y control
 * de entrada para los campos.
 * 
 * Maneja el envío del formulario llamando a la función crearPersona y muestra
 * mensajes de éxito o error basados en el resultado.
 */
const PersonaForm = () => {
  // Estado local para los datos del formulario
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellido: '',
    fecha_nacimiento: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    sexo: '',
    mail: '',
    telefono: ''
  })

  // Estado para mostrar mensajes de éxito/error
  const [mensaje, setMensaje] = useState('')
  // Estado para indicar el proceso de envío en curso
  const [loading, setLoading] = useState(false)

  /**
   * Maneja el cambio de valor en cualquier campo del formulario
   * @param {Event} e Evento de cambio de input
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  /**
   * Maneja el envío del formulario, previene comportamiento por defecto,
   * convierte dni a número y llama a la API para crear persona.
   * Controla estados de loading y muestra mensajes correspondientemente.
   * @param {Event} e Evento de submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      // Convertir DNI a número antes de enviar
      const datosEnviar = {
        ...formData,
        dni: parseInt(formData.dni)
      }

      // Llamar servicio API para crear persona
      const resultado = await crearPersona(datosEnviar)
      setMensaje(`✅ ${resultado.mensaje}`)

      // Limpiar formulario tras éxito
      setFormData({
        dni: '',
        nombre: '',
        apellido: '',
        fecha_nacimiento: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        sexo: '',
        mail: '',
        telefono: ''
      })

    } catch (error) {
      setMensaje(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // JSX que representa el formulario con campos controlados y botón de submit
  return (
    <div className="form-container">
      <h2>👤 Agregar Nueva Persona</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <div className="form-group">
            <label>DNI *</label>
            <input
              type="number"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              required
              placeholder="12345678"
            />
          </div>

          <div className="form-group">
            <label>Nombre *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Juan"
            />
          </div>

          <div className="form-group">
            <label>Apellido *</label>
            <input
              type="text"
              name="apellido"
              value={formData.apellido}
              onChange={handleChange}
              required
              placeholder="Pérez"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            required
            placeholder="juan@email.com"
          />
        </div>

        <div className="form-group">
          <label>Fecha de Nacimiento *</label>
          <input
            type="date"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Dirección *</label>
          <input
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
            placeholder="Calle 123"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Ciudad *</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              required
              placeholder="Buenos Aires"
            />
          </div>

          <div className="form-group">
            <label>Provincia *</label>
            <input
              type="text"
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              required
              placeholder="Buenos Aires"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Sexo *</label>
            <select
              name="sexo"
              value={formData.sexo}
              onChange={handleChange}
              required
            >
              <option value="">Seleccionar</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="123456789"
            />
          </div>
        </div>

        {/* Botón de envío con estado de loading */}
        <button 
          type="submit" 
          className="submit-btn primary"
          disabled={loading}
        >
          {loading ? '⏳ Guardando...' : '💾 Guardar Persona'}
        </button>

        {/* Mensajes de éxito o error basados en el estado */}
        {mensaje && (
          <div className={`mensaje ${mensaje.includes('✅') ? 'success' : 'error'}`}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  )
}

export default PersonaForm