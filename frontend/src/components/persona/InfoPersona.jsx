import React, { useState } from 'react';
import { actualizarPersona } from '../../servicios/Api'; 

function InfoPersona({ usuario }) {
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: usuario.nombre || '',
    apellido: usuario.apellido || '', // ✅ AGREGADO
    telefono: usuario.telefono || '',
    direccion: usuario.direccion || '',
    ciudad: usuario.ciudad || '',
    provincia: usuario.provincia || '',
    sexo: usuario.sexo || '',
    fecha_nacimiento: usuario.fecha_nacimiento || ''
    // ❌ NO incluir email, sexo, fecha_nacimiento si no se pueden editar
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
      nombre: usuario.nombre || '',
      apellido: usuario.apellido || '', // ✅ AGREGADO
      telefono: usuario.telefono || '',
      direccion: usuario.direccion || '',
      ciudad: usuario.ciudad || '',
      provincia: usuario.provincia || ''
    });
    setEditando(false);
    setError('');
  };

  const handleGuardar = async () => {
    // Validaciones mejoradas
    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }
    
    if (!formData.apellido.trim()) { // ✅ AGREGADO
      setError('El apellido es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Limpiar datos antes de enviar (convertir strings vacíos a null)
      const datosLimpios = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key, 
          value === "" ? null : value
        ])
      );
      
      await actualizarPersona(usuario.dni, datosLimpios);
      console.log('✅ Datos actualizados correctamente');
      setEditando(false);
      alert('✅ Datos actualizados correctamente');
      // Podrías recargar los datos del usuario aquí si es necesario
   
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
          <h2 className="form-titulo">Editar Mi Información</h2>
          <button 
            type="button" 
            onClick={handleCancelar}
            className="btn-volver"
          >
            Cancelar
          </button>
        </div>

        <form className="formulario" onSubmit={(e) => e.preventDefault()}>
          {/* Campos de Nombre y Apellido en misma línea */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="nombre">Nombre *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Ej: Juan"
              />
            </div>

            <div>
              <label htmlFor="apellido">Apellido *</label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Ej: Pérez"
              />
            </div>
          </div>

          <div>
            <label htmlFor="dni">DNI</label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={usuario.dni || ''}
              disabled
              style={{ backgroundColor: 'var(--primary-light)', color: 'var(--text-secondary)' }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              El DNI no se puede modificar
            </small>
          </div>

          {/* Campos que NO se pueden editar pero se muestran */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={usuario.email || ''}
                disabled
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--text-secondary)' }}
                placeholder="No editable"
              />
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                Contacta al administrador para cambiar el email
              </small>
            </div>

            <div>
              <label htmlFor="sexo">Sexo</label>
              <input
                type="text"
                id="sexo"
                name="sexo"
                value={usuario.sexo || ''}
                disabled
                style={{ backgroundColor: 'var(--primary-light)', color: 'var(--text-secondary)' }}
                placeholder="No editable"
              />
            </div>
          </div>

          <div>
            <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
            <input
              type="text"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={usuario.fecha_nacimiento || ''}
              disabled
              style={{ backgroundColor: 'var(--primary-light)', color: 'var(--text-secondary)' }}
              placeholder="No editable"
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

  // VISTA DE SOLO LECTURA (MEJORADA)
  return (
    <div className="form-container">
      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="form-titulo">👤 Mi Información Personal</h2>
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
        {/* Nombre Completo (Nombre + Apellido) */}
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
            Nombre Completo
          </strong>
          <span style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.1rem',
            display: 'block'
          }}>
            {`${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || 'No especificado'}
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
              DNI
            </strong>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem',
              display: 'block'
            }}>
              {usuario.dni || 'No especificado'}
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
              {usuario.email || '—'}
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
              Sexo
            </strong>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem',
              display: 'block'
            }}>
              {usuario.sexo || '—'}
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
              Fecha Nacimiento
            </strong>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.1rem',
              display: 'block'
            }}>
              {usuario.fecha_nacimiento || '—'}
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

export default InfoPersona;