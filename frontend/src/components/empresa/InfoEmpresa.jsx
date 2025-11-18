import React, { useState } from 'react';
import { actualizarEmpresa} from '../../servicios/Api';

function InfoEmpresa({ usuario }) {
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre_empresa: usuario.nombre_empresa || '',
    email: usuario.email || '',
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    ciudad: usuario.ciudad || '',
    provincia: usuario.provincia || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditar = () => {
    setEditando(true);
  };

  const handleCancelar = () => {
    setFormData({
      nombre_empresa: usuario.nombre_empresa || '',
      email: usuario.email || '',
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      ciudad: usuario.ciudad || '',
      provincia: usuario.provincia || ''
    });
    setEditando(false);
    setError('');
  };

  const handleGuardar = async () => {
    if (!formData.nombre_empresa.trim()) {
      setError('El nombre de la empresa es obligatorio');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return;
    }

     // INTENTA ACTUALIZAR CON EL ENDPOINT REAL
    try {
      setLoading(true);
      setError('');

      await actualizarEmpresa(usuario.id_empresa, formData, usuario.token);
      console.log('✅ Datos actualizados correctamente');
      setEditando(false);
      alert('✅ Datos actualizados correctamente');
        
  

    } catch (error) {
      console.error('Error al guardar:', error);
      setError('Error al guardar los cambios: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (editando) {
    return (
      <div className="form-container">
        <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 className="form-titulo">Editar Información de la Empresa</h2>
          <button 
            type="button" 
            onClick={handleCancelar}
            className="btn-volver"
          >
            Cancelar
          </button>
        </div>

        <form className="formulario" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label htmlFor="nombre_empresa">Nombre de la Empresa *</label>
            <input
              type="text"
              id="nombre_empresa"
              name="nombre_empresa"
              value={formData.nombre_empresa}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="telefono">Teléfono</label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="Ej: +54 294 123-4567"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="direccion">Dirección</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Ej: Calle Principal 123"
              disabled={loading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="ciudad">Ciudad</label>
              <input
                type="text"
                id="ciudad"
                name="ciudad"
                value={formData.ciudad}
                onChange={handleInputChange}
                placeholder="Ej: San Carlos de Bariloche"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="provincia">Provincia</label>
              <input
                type="text"
                id="provincia"
                name="provincia"
                value={formData.provincia}
                onChange={handleInputChange}
                placeholder="Ej: Río Negro"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div style={{
              color: "#d32f2f",
              backgroundColor: "#ffebee",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #f44336"
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCancelar}
              className="btn-volver"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleGuardar}
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="form-titulo">🏢 Información de la Empresa</h2>
        <button 
          type="button" 
          onClick={handleEditar}
          className="btn-submit"
          style={{ padding: '10px 20px', fontSize: '0.9rem' }}
        >
          ✏️ Editar
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        <div className="info-campo" style={{
          padding: '20px',
          background: 'var(--primary-light)',
          borderRadius: '8px',
          borderLeft: '4px solid var(--accent-color)'
        }}>
          <strong style={{ 
            color: 'var(--primary-dark)', 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Nombre de la Empresa
          </strong>
          <span style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.1rem',
            display: 'block'
          }}>
            {usuario.nombre_empresa || 'No especificado'}
          </span>
        </div>

        <div className="info-campo" style={{
          padding: '20px',
          background: 'var(--primary-light)',
          borderRadius: '8px',
          borderLeft: '4px solid var(--accent-color)'
        }}>
          <strong style={{ 
            color: 'var(--primary-dark)', 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Email
          </strong>
          <span style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.1rem',
            display: 'block'
          }}>
            {usuario.email || 'No especificado'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="info-campo" style={{
            padding: '20px',
            background: 'var(--primary-light)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--accent-color)'
          }}>
            <strong style={{ 
              color: 'var(--primary-dark)', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Teléfono
            </strong>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem',
              display: 'block'
            }}>
              {usuario.telefono || '—'}
            </span>
          </div>

          <div className="info-campo" style={{
            padding: '20px',
            background: 'var(--primary-light)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--accent-color)'
          }}>
            <strong style={{ 
              color: 'var(--primary-dark)', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Dirección
            </strong>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem',
              display: 'block'
            }}>
              {usuario.direccion || '—'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="info-campo" style={{
            padding: '20px',
            background: 'var(--primary-light)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--accent-color)'
          }}>
            <strong style={{ 
              color: 'var(--primary-dark)', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Ciudad
            </strong>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem',
              display: 'block'
            }}>
              {usuario.ciudad || '—'}
            </span>
          </div>

          <div className="info-campo" style={{
            padding: '20px',
            background: 'var(--primary-light)',
            borderRadius: '8px',
            borderLeft: '4px solid var(--accent-color)'
          }}>
            <strong style={{ 
              color: 'var(--primary-dark)', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '0.9rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Provincia
            </strong>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem',
              display: 'block'
            }}>
              {usuario.provincia || '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoEmpresa;