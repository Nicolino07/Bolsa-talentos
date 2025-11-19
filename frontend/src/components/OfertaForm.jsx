import React, { useState, useEffect } from 'react';

const OfertaForm = ({ usuario, onOfertaCreada, onCancelar }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    actividades: [],
    nuevaActividad: {
      id_actividad: '',
      nivel_requerido: 'INTERMEDIO'
    }
  });

  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cargandoActividades, setCargandoActividades] = useState(true);
  const [mostrarFormNuevaActividad, setMostrarFormNuevaActividad] = useState(false);
  const [nuevaActividadData, setNuevaActividadData] = useState({
    nombre: '',
    area: '',
    especialidad: '',
    descripcion: ''
  });

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      setCargandoActividades(true);
      
      const API_BASE_URL = 'http://localhost:3000';
      const url = `${API_BASE_URL}/api/actividades/?skip=0&limit=100`;
      
      console.log('🔄 Cargando actividades desde:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Actividades cargadas correctamente:', data);
      setActividadesDisponibles(data);
      
    } catch (error) {
      console.error('❌ Error cargando actividades:', error);
      setError('Error al cargar las actividades disponibles: ' + error.message);
      
      // Datos de ejemplo como fallback
      const actividadesEjemplo = [
        { id_actividad: 1, nombre: 'Python', area: 'Programación', especialidad: 'Backend', descripcion: 'Lenguaje de programación Python' },
        { id_actividad: 2, nombre: 'JavaScript', area: 'Programación', especialidad: 'Frontend', descripcion: 'Lenguaje de programación JavaScript' },
        { id_actividad: 3, nombre: 'SQL', area: 'Bases de Datos', especialidad: 'Database', descripcion: 'Lenguaje de consulta SQL' },
        { id_actividad: 4, nombre: 'Carpinteria', area: 'Construcion', especialidad: 'Obra', descripcion: 'Carpinteria de Obra' }
      ];
      setActividadesDisponibles(actividadesEjemplo);
    } finally {
      setCargandoActividades(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActividadChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      nuevaActividad: {
        ...prev.nuevaActividad,
        [name]: value
      }
    }));
  };

  const handleNuevaActividadChange = (e) => {
    const { name, value } = e.target;
    setNuevaActividadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const crearNuevaActividad = async () => {
    if (!nuevaActividadData.nombre.trim()) {
      setError('El nombre de la actividad es obligatorio');
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:3000';
      
      console.log('📤 Creando nueva actividad:', nuevaActividadData);

      const response = await fetch(`${API_BASE_URL}/api/actividades/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaActividadData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Error creando la actividad: ' + errorText);
      }

      const actividadCreada = await response.json();
      console.log('✅ Nueva actividad creada:', actividadCreada);

      // Agregar la nueva actividad a la lista disponible
      setActividadesDisponibles(prev => [...prev, actividadCreada]);
      
      // Seleccionar automáticamente la nueva actividad
      setFormData(prev => ({
        ...prev,
        nuevaActividad: {
          ...prev.nuevaActividad,
          id_actividad: actividadCreada.id_actividad.toString()
        }
      }));

      // Cerrar el formulario y resetear
      setMostrarFormNuevaActividad(false);
      setNuevaActividadData({
        nombre: '',
        area: '',
        especialidad: '',
        descripcion: ''
      });

      setError('');

    } catch (error) {
      console.error('❌ Error creando actividad:', error);
      setError(error.message || 'Error al crear la actividad');
    }
  };

  const agregarActividad = () => {
    if (!formData.nuevaActividad.id_actividad) {
      setError('Selecciona una actividad');
      return;
    }

    const actividadSeleccionada = actividadesDisponibles.find(
      a => a.id_actividad === parseInt(formData.nuevaActividad.id_actividad)
    );

    const existe = formData.actividades.some(
      a => a.id_actividad === actividadSeleccionada.id_actividad
    );

    if (existe) {
      setError('Esta actividad ya fue agregada');
      return;
    }

    if (actividadSeleccionada) {
      setFormData(prev => ({
        ...prev,
        actividades: [
          ...prev.actividades,
          {
            ...actividadSeleccionada,
            nivel_requerido: formData.nuevaActividad.nivel_requerido
          }
        ],
        nuevaActividad: {
          id_actividad: '',
          nivel_requerido: 'INTERMEDIO'
        }
      }));
      setError('');
    }
  };

  const eliminarActividad = (index) => {
    setFormData(prev => ({
      ...prev,
      actividades: prev.actividades.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      setLoading(false);
      return;
    }

    if (!formData.descripcion.trim()) {
      setError('La descripción es obligatoria');
      setLoading(false);
      return;
    }

    if (formData.actividades.length === 0) {
      setError('Debe agregar al menos una actividad requerida');
      setLoading(false);
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:3000';
      
      // DEBUG del usuario completo
      console.log('🔍 USUARIO COMPLETO:', usuario);
      
      const datosOferta = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        activa: true
      };

      // DETERMINAR AUTOMÁTICAMENTE según el usuario
      if (usuario?.id_empresa) {
        // Es una empresa
        datosOferta.id_empresa = usuario.id_empresa;
        console.log('🏢 Creando oferta como EMPRESA');
      } else if (usuario?.dni) {
        // Es una persona
        datosOferta.persona_dni = usuario.dni;
        console.log('👤 Creando oferta como PERSONA');
      } else {
        throw new Error('No se pudo determinar el tipo de usuario');
      }

      console.log('📤 DATOS FINALES A ENVIAR:', datosOferta);

      const ofertaResponse = await fetch(`${API_BASE_URL}/api/ofertas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosOferta),
      });

      if (!ofertaResponse.ok) {
        const errorText = await ofertaResponse.text();
        console.error('❌ Error respuesta oferta:', errorText);
        throw new Error('Error creando la oferta: ' + errorText);
      }

      const ofertaCreada = await ofertaResponse.json();
      console.log('✅ Oferta creada:', ofertaCreada);

      // Agregar las actividades relacionadas
      const actividadesPromises = formData.actividades.map(actividad =>
        fetch(`${API_BASE_URL}/api/ofertas/${ofertaCreada.id_oferta}/actividades/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id_actividad: actividad.id_actividad,
            nivel_requerido: actividad.nivel_requerido
          }),
        })
      );

      const resultados = await Promise.all(actividadesPromises);
      const errores = resultados.filter(response => !response.ok);

      if (errores.length > 0) {
        throw new Error(`Error agregando ${errores.length} actividades`);
      }

      console.log('✅ Todas las actividades agregadas correctamente');

      // Éxito
      if (onOfertaCreada) {
        onOfertaCreada(ofertaCreada);
      }

      // Resetear formulario
      setFormData({
        titulo: '',
        descripcion: '',
        actividades: [],
        nuevaActividad: {
          id_actividad: '',
          nivel_requerido: 'INTERMEDIO'
        }
      });

      alert('✅ Oferta creada exitosamente');

    } catch (error) {
      console.error('❌ Error en submit:', error);
      setError(error.message || 'Error al crear la oferta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 className="form-titulo">Crear Nueva Oferta de Empleo</h2>
        {onCancelar && (
          <button 
            type="button" 
            onClick={onCancelar}
            className="btn-volver"
          >
            ← Volver
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="formulario">
        {/* Información Básica */}
        <div className="form-section">
          <h3 style={{ color: 'var(--primary-dark)', marginBottom: '20px', paddingBottom: '10px', borderBottom: '1px solid var(--divider-color)' }}>
            Información del Puesto
          </h3>
          
          <div>
            <label htmlFor="titulo">Título del Puesto *</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              required
              placeholder="Ej: Desarrollador Full Stack Senior"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="descripcion">Descripción del Puesto *</label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              required
              rows="6"
              placeholder="Describe las responsabilidades, requisitos, beneficios..."
              disabled={loading}
            />
          </div>
        </div>

        {/* Actividades Requeridas */}
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: 'var(--primary-dark)', margin: 0, paddingBottom: '10px', borderBottom: '1px solid var(--divider-color)' }}>
              Habilidades y Competencias Requeridas
            </h3>
            <button
              type="button"
              onClick={() => setMostrarFormNuevaActividad(!mostrarFormNuevaActividad)}
              className="btn-volver"
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              {mostrarFormNuevaActividad ? '← Volver' : '➕ Crear Nueva'}
            </button>
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.95rem' }}>
            Agrega las habilidades y competencias necesarias para este puesto.
          </p>
          
          {cargandoActividades ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
              Cargando actividades...
            </div>
          ) : (
            <>
              {mostrarFormNuevaActividad ? (
                // Formulario para crear nueva actividad
                <div style={{ 
                  background: 'var(--primary-light)', 
                  padding: '20px', 
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{ color: 'var(--primary-dark)', marginBottom: '15px' }}>
                    Crear Nueva Actividad/Especialidad
                  </h4>
                  
                  <div style={{ display: 'grid', gap: '15px' }}>
                    <div>
                      <label htmlFor="nombre">Nombre de la Actividad *</label>
                      <input
                        type="text"
                        id="nombre"
                        name="nombre"
                        value={nuevaActividadData.nombre}
                        onChange={handleNuevaActividadChange}
                        placeholder="Ej: React Native, Marketing Digital, etc."
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div>
                        <label htmlFor="area">Área</label>
                        <input
                          type="text"
                          id="area"
                          name="area"
                          value={nuevaActividadData.area}
                          onChange={handleNuevaActividadChange}
                          placeholder="Ej: Programación, Diseño, Ventas"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="especialidad">Especialidad</label>
                        <input
                          type="text"
                          id="especialidad"
                          name="especialidad"
                          value={nuevaActividadData.especialidad}
                          onChange={handleNuevaActividadChange}
                          placeholder="Ej: Frontend, Backend, UX/UI"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="descripcion">Descripción</label>
                      <textarea
                        id="descripcion"
                        name="descripcion"
                        value={nuevaActividadData.descripcion}
                        onChange={handleNuevaActividadChange}
                        rows="3"
                        placeholder="Breve descripción de la actividad..."
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setMostrarFormNuevaActividad(false)}
                        className="btn-volver"
                        style={{ fontSize: '0.9rem' }}
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={crearNuevaActividad}
                        className="btn-submit"
                        style={{ fontSize: '0.9rem', padding: '10px 20px' }}
                      >
                        Crear Actividad
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Selector de actividades existentes
                <>
                  <div style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                      <div>
                        <label htmlFor="id_actividad">Actividad/Especialidad *</label>
                        <select
                          id="id_actividad"
                          name="id_actividad"
                          value={formData.nuevaActividad.id_actividad}
                          onChange={handleActividadChange}
                          disabled={loading}
                        >
                          <option value="">Selecciona una actividad</option>
                          {actividadesDisponibles.map(actividad => (
                            <option key={actividad.id_actividad} value={actividad.id_actividad}>
                              {actividad.nombre} {actividad.area && `- ${actividad.area}`} 
                              {actividad.especialidad && ` (${actividad.especialidad})`}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="nivel_requerido">Nivel Requerido</label>
                        <select
                          id="nivel_requerido"
                          name="nivel_requerido"
                          value={formData.nuevaActividad.nivel_requerido}
                          onChange={handleActividadChange}
                          disabled={loading}
                        >
                          <option value="PRINCIPIANTE">Principiante</option>
                          <option value="INTERMEDIO">Intermedio</option>
                          <option value="AVANZADO">Avanzado</option>
                          <option value="EXPERTO">Experto</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ visibility: 'hidden' }}>&nbsp;</label>
                        <button 
                          type="button" 
                          onClick={agregarActividad}
                          className="btn-submit"
                          style={{ padding: '12px 20px', fontSize: '0.9rem', marginTop: '0' }}
                          disabled={loading}
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de actividades agregadas */}
                  {formData.actividades.length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--primary-dark)', marginBottom: '15px' }}>
                        Actividades Agregadas ({formData.actividades.length})
                      </h4>
                      <div className="habilidades-lista">
                        {formData.actividades.map((actividad, index) => (
                          <div key={index} className="habilidad-item">
                            <span className="habilidad-texto">
                              {actividad.nombre}
                              {actividad.area && <span style={{ opacity: 0.8 }}> - {actividad.area}</span>}
                              <span style={{ 
                                marginLeft: '10px', 
                                fontSize: '0.8rem',
                                background: 'rgba(255,255,255,0.2)',
                                padding: '2px 8px',
                                borderRadius: '10px'
                              }}>
                                {actividad.nivel_requerido}
                              </span>
                            </span>
                            <button 
                              type="button"
                              onClick={() => eliminarActividad(index)}
                              className="btn-eliminar"
                              disabled={loading}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
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

        <div style={{ marginTop: '30px' }}>
          <button 
            type="submit" 
            disabled={loading || formData.actividades.length === 0}
            className="btn-submit"
          >
            {loading ? 'Creando Oferta...' : 'Publicar Oferta de Empleo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfertaForm;