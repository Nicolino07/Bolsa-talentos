import { useState } from 'react'
import { crearEmpresa } from '../servicios/Api'
import '../styles/FormStyles.css'

const EmpresaForm = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    ciudad: '',
    provincia: '',
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
      const resultado = await crearEmpresa(formData)
      setMensaje(`✅ ${resultado.mensaje}`)
      
      // Limpiar formulario
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