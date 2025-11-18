import React, { useState, useEffect } from 'react';

const MisActividades = ({ usuario, tipo }) => {
  const [misActividades, setMisActividades] = useState([]);
  const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cargandoActividades, setCargandoActividades] = useState(true);
  const [error, setError] = useState('');
  const [mostrarFormNuevaActividad, setMostrarFormNuevaActividad] = useState(false);
  const [mostrarFormAgregarActividad, setMostrarFormAgregarActividad] = useState(false);
  
  // Estado para nueva actividad global
  const [nuevaActividadData, setNuevaActividadData] = useState({
    nombre: '',
    area: '',
    especialidad: '',
    descripcion: ''
  });

  // Estado para agregar actividad existente
  const [actividadSeleccionada, setActividadSeleccionada] = useState({
    id_actividad: '',
    nivel_experiencia: 'INTERMEDIO',
    años_experiencia: 0,
    especializacion: ''
  });

  const esPersona = tipo === 'persona';
  const esEmpresa = tipo === 'empresa';

  useEffect(() => {
    cargarActividadesDisponibles();
    cargarMisActividades();
  }, [usuario, tipo]);

  const cargarActividadesDisponibles = async () => {
    try {
      setCargandoActividades(true);
      const API_BASE_URL = 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/actividades/?skip=0&limit=100`);
      
      if (!response.ok) throw new Error('Error cargando actividades');
      
      const data = await response.json();
      setActividadesDisponibles(data);
    } catch (error) {
      console.error('Error cargando actividades:', error);
      setError('Error al cargar las actividades disponibles');
    } finally {
      setCargandoActividades(false);
    }
  };

  const cargarMisActividades = async () => {
    try {
      const API_BASE_URL = 'http://localhost:3000';
      let url = '';
      
      if (esPersona) {
        url = `${API_BASE_URL}/api/actividades/persona/${usuario.dni}`;
      } else if (esEmpresa) {
        url = `${API_BASE_URL}/api/actividades/empresa/${usuario.id_empresa}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Error cargando mis actividades');
      
      const data = await response.json();
      setMisActividades(data);
    } catch (error) {
      console.error('Error cargando mis actividades:', error);
      setError('Error al cargar tus actividades');
    }
  };

  const handleNuevaActividadChange = (e) => {
    const { name, value } = e.target;
    setNuevaActividadData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleActividadSeleccionadaChange = (e) => {
    const { name, value } = e.target;
    setActividadSeleccionada(prev => ({
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
      setLoading(true);
      const API_BASE_URL = 'http://localhost:3000';
      
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
      
      // Agregar la nueva actividad a la lista disponible
      setActividadesDisponibles(prev => [...prev, actividadCreada]);
      
      // Seleccionar automáticamente la nueva actividad
      setActividadSeleccionada(prev => ({
        ...prev,
        id_actividad: actividadCreada.id_actividad.toString()
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
      alert('✅ Actividad creada exitosamente');

    } catch (error) {
      console.error('❌ Error creando actividad:', error);
      setError(error.message || 'Error al crear la actividad');
    } finally {
      setLoading(false);
    }
  };

  const agregarActividadExistente = async () => {
    if (!actividadSeleccionada.id_actividad) {
      setError('Selecciona una actividad');
      return;
    }

    try {
      setLoading(true);
      const API_BASE_URL = 'http://localhost:3000';
      let url = '';
      let body = {};

      if (esPersona) {
        url = `${API_BASE_URL}/api/actividades/persona`;
        body = {
          dni: usuario.dni,
          id_actividad: parseInt(actividadSeleccionada.id_actividad),
          nivel_experiencia: actividadSeleccionada.nivel_experiencia,
          años_experiencia: actividadSeleccionada.años_experiencia || 0
        };
      } else if (esEmpresa) {
        url = `${API_BASE_URL}/api/actividades/empresa`;
        body = {
          id_empresa: usuario.id_empresa,
          id_actividad: parseInt(actividadSeleccionada.id_actividad),
          especializacion: actividadSeleccionada.especializacion
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Error agregando actividad: ' + errorText);
      }

      // Recargar la lista de actividades
      await cargarMisActividades();
      
      // Resetear formulario
      setActividadSeleccionada({
        id_actividad: '',
        nivel_experiencia: 'INTERMEDIO',
        años_experiencia: 0,
        especializacion: ''
      });
      
      setMostrarFormAgregarActividad(false);
      setError('');
      alert('✅ Actividad agregada exitosamente');

    } catch (error) {
      console.error('❌ Error agregando actividad:', error);
      setError(error.message || 'Error al agregar la actividad');
    } finally {
      setLoading(false);
    }
  };

  const eliminarActividad = async (id_actividad) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      return;
    }

    try {
      // Nota: Necesitarías crear un endpoint DELETE en el backend
      // Por ahora, solo eliminamos del estado local
      setMisActividades(prev => 
        prev.filter(actividad => actividad.id_actividad !== id_actividad)
      );
      
      alert('Actividad eliminada');
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      setError('Error al eliminar la actividad');
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-titulo">
        {esPersona ? 'Mis Habilidades y Competencias' : 'Especializaciones de la Empresa'}
      </h2>

      {/* Botones de acción */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => setMostrarFormAgregarActividad(!mostrarFormAgregarActividad)}
          className="btn-submit"
          style={{ 
            padding: '12px 20px', 
            fontSize: '0.9rem',
            background: 'var(--primary-main)'
          }}
        >
          ➕ Agregar Actividad Existente
        </button>
        
        <button
          type="button"
          onClick={() => setMostrarFormNuevaActividad(!mostrarFormNuevaActividad)}
          className="btn-submit"
          style={{ 
            padding: '12px 20px', 
            fontSize: '0.9rem',
            background: 'var(--accent-color)'
          }}
        >
          🆕 Crear Nueva Actividad
        </button>
      </div>

      {/* Formulario para crear nueva actividad */}
      {mostrarFormNuevaActividad && (
        <div style={{ 
          background: 'var(--primary-light)', 
          padding: '25px', 
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <h3 style={{ 
            color: 'var(--primary-dark)', 
            marginBottom: '20px',
            borderBottom: '2px solid var(--primary-main)',
            paddingBottom: '10px'
          }}>
            Crear Nueva Actividad
          </h3>
          
          <div className="formulario">
            <div>
              <label htmlFor="nombre">Nombre de la Actividad *</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={nuevaActividadData.nombre}
                onChange={handleNuevaActividadChange}
                placeholder="Ej: React Native, Marketing Digital, etc."
                disabled={loading}
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
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={loading}
              />
            </div>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setMostrarFormNuevaActividad(false)}
                className="btn-volver"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={crearNuevaActividad}
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Actividad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulario para agregar actividad existente */}
      {mostrarFormAgregarActividad && (
        <div style={{ 
          background: 'var(--primary-light)', 
          padding: '25px', 
          borderRadius: '12px',
          marginBottom: '25px'
        }}>
          <h3 style={{ 
            color: 'var(--primary-dark)', 
            marginBottom: '20px',
            borderBottom: '2px solid var(--primary-main)',
            paddingBottom: '10px'
          }}>
            Agregar Actividad Existente
          </h3>
          
          <div className="formulario">
            <div>
              <label htmlFor="id_actividad">Seleccionar Actividad *</label>
              <select
                id="id_actividad"
                name="id_actividad"
                value={actividadSeleccionada.id_actividad}
                onChange={handleActividadSeleccionadaChange}
                disabled={loading || cargandoActividades}
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

            {esPersona && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label htmlFor="nivel_experiencia">Nivel de Experiencia</label>
                    <select
                      id="nivel_experiencia"
                      name="nivel_experiencia"
                      value={actividadSeleccionada.nivel_experiencia}
                      onChange={handleActividadSeleccionadaChange}
                      disabled={loading}
                    >
                      <option value="PRINCIPIANTE">Principiante</option>
                      <option value="INTERMEDIO">Intermedio</option>
                      <option value="AVANZADO">Avanzado</option>
                      <option value="EXPERTO">Experto</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="años_experiencia">Años de Experiencia</label>
                    <input
                      type="number"
                      id="años_experiencia"
                      name="años_experiencia"
                      value={actividadSeleccionada.años_experiencia}
                      onChange={handleActividadSeleccionadaChange}
                      min="0"
                      max="50"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {esEmpresa && (
              <div>
                <label htmlFor="especializacion">Especialización (Opcional)</label>
                <input
                  type="text"
                  id="especializacion"
                  name="especializacion"
                  value={actividadSeleccionada.especializacion}
                  onChange={handleActividadSeleccionadaChange}
                  placeholder="Ej: Desarrollo móvil, Consultoría estratégica..."
                  disabled={loading}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setMostrarFormAgregarActividad(false)}
                className="btn-volver"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={agregarActividadExistente}
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Agregando...' : 'Agregar Actividad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de mis actividades */}
      <div>
        <h3 style={{ 
          color: 'var(--primary-dark)', 
          marginBottom: '20px',
          borderBottom: '2px solid var(--primary-main)',
          paddingBottom: '10px'
        }}>
          {esPersona ? 'Mis Habilidades' : 'Especializaciones'} ({misActividades.length})
        </h3>

        {cargandoActividades ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Cargando actividades...
          </div>
        ) : misActividades.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: 'var(--text-secondary)',
            background: 'var(--primary-light)',
            borderRadius: '8px'
          }}>
            <p>No tienes actividades agregadas.</p>
            <p>Usa los botones arriba para agregar o crear actividades.</p>
          </div>
        ) : (
          <div className="habilidades-lista">
            {misActividades.map((actividad, index) => (
              <div key={index} className="habilidad-item">
                <div style={{ flex: 1 }}>
                  <div className="habilidad-texto" style={{ fontWeight: 'bold' }}>
                    {actividad.nombre}
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>
                    {actividad.area && `Área: ${actividad.area}`}
                    {actividad.especialidad && ` • Especialidad: ${actividad.especialidad}`}
                    {esPersona && actividad.nivel_experiencia && ` • Nivel: ${actividad.nivel_experiencia}`}
                    {esPersona && actividad.años_experiencia > 0 && ` • ${actividad.años_experiencia} año(s)`}
                    {esEmpresa && actividad.especializacion && ` • Especialización: ${actividad.especializacion}`}
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => eliminarActividad(actividad.id_actividad)}
                  className="btn-eliminar"
                  disabled={loading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{
          color: "#d32f2f",
          backgroundColor: "#ffebee",
          padding: "12px",
          borderRadius: "8px",
          marginTop: "20px",
          border: "1px solid #f44336"
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
};

export default MisActividades;