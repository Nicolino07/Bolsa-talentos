import { useState } from 'react'
import { crearEmpresa } from '../servicios/Api'
import '../styles/FormStyles.css'

/**
 * Componente EmpresaForm para capturar datos y crear una nueva empresa.
 * 
 * Utiliza useState para manejar el estado del formulario y controlar 
 * los inputs controlados.
 * 
 * Al enviar el formulario, llama a la función crearEmpresa para registrar
 * la empresa y muestra mensajes de éxito o error.
 */
const EmpresaForm = () => {
  // Estado local para los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
    mail: '',
    telefono: ''
  })

  // Estado para mostrar mensajes informativos
  const [mensaje, setMensaje] = useState('')
  // Estado para controlar el indicador de carga durante el envío
  const [loading, setLoading] = useState(false)

  /** 
   * Actualiza el estado del formulario al cambiar cualquier campo
   * @param {Event} e Evento change del input 
   */
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  /**
   * Maneja el envío del formulario, previene envío por defecto,
   * llama al API para crear la empresa y controla estados de mensaje
   * y loading.
   * @param {Event} e Evento submit del formulario
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')

    try {
      // Llamar servicio para crear empresa con los datos del formulario
      const resultado = await crearEmpresa(formData)
      setMensaje(`✅ ${resultado.mensaje}`)

      // Limpiar formulario tras éxito
      setFormData({
        nombre: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        mail: '',
        telefono: ''
      })

    } catch (error) {
      setMensaje(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // JSX que representa el formulario con inputs controlados y botón de enviar
  return (
    <div className="form-container">
      <h2>🏢 Agregar Nueva Empresa</h2>
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label>Nombre de la Empresa *</label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            placeholder="Mi Empresa S.A."
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="mail"
            value={formData.mail}
            onChange={handleChange}
            required
            placeholder="empresa@email.com"
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
            placeholder="Av. Principal 123"
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

         {/* Botón de submit con estado dinámico de carga y mensajes */}
        <button 
          type="submit" 
          className="submit-btn success"
          disabled={loading}
        >
          {loading ? '⏳ Guardando...' : '💾 Guardar Empresa'}
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

export default EmpresaForm