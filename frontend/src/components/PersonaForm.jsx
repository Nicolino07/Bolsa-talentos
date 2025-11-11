import React, { useState } from 'react'
import { crearPersona } from '../servicios/Api'
import '../styles/FormStyles.css'


const PersonaForm = () => {
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

  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      // Convertir DNI a número
      const datosEnviar = {
        ...formData,
        dni: parseInt(formData.dni)
      }

      const resultado = await crearPersona(datosEnviar)
      setMensaje(`✅ ${resultado.mensaje}`)
      
      // Limpiar formulario
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

        <button 
          type="submit" 
          className="submit-btn primary"
          disabled={loading}
        >
          {loading ? '⏳ Guardando...' : '💾 Guardar Persona'}
        </button>

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