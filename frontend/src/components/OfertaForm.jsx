import React, { useState, useEffect } from 'react';
import '../styles/OfertaForm.css';


const OfertaForm = ({ empresaId, onOfertaCreada, onCancelar }) => {
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

  useEffect(() => {
    cargarActividades();
  }, []);

  const cargarActividades = async () => {
    try {
      setCargandoActividades(true);
      
      // ✅ USAR URL COMPLETA con el puerto correcto
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
      
      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
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
      // 1. Crear la oferta principal
      const API_BASE_URL = 'http://localhost:3000';
      
      console.log('📤 Creando oferta:', {
        id_empresa: empresaId,
        titulo: formData.titulo,
        descripcion: formData.descripcion
      });

      const ofertaResponse = await fetch(`${API_BASE_URL}/api/ofertas/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id_empresa: empresaId,
          titulo: formData.titulo,
          descripcion: formData.descripcion
        }),
      });

      if (!ofertaResponse.ok) {
        const errorText = await ofertaResponse.text();
        console.error('❌ Error respuesta oferta:', errorText);
        throw new Error('Error creando la oferta: ' + errorText);
      }

      const ofertaCreada = await ofertaResponse.json();
      console.log('✅ Oferta creada:', ofertaCreada);

      // 2. Agregar las actividades relacionadas
      console.log('📤 Agregando actividades:', formData.actividades);

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
      
      // Verificar cada respuesta
      for (let i = 0; i < resultados.length; i++) {
        if (!resultados[i].ok) {
          const errorText = await resultados[i].text();
          console.error(`❌ Error en actividad ${i}:`, errorText);
        }
      }

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
    <div className="oferta-form-container">
      <div className="form-header">
        <h2 className="subtitulo">Crear Nueva Oferta de Empleo</h2>
        {onCancelar && (
          <button 
            type="button" 
            onClick={onCancelar}
            className="btn-header btn-cancelar"
          >
            Cancelar
          </button>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="form-busqueda oferta-form">
        {/* Información Básica */}
        <div className="form-section">
          <h3>Información del Puesto</h3>
          
          <div className="campo">
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

          <div className="campo">
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
              className="campo-textarea"
            />
          </div>
        </div>

        {/* Actividades Requeridas */}
        <div className="form-section">
          <h3>Habilidades y Competencias Requeridas</h3>
          <p className="section-description">
            Agrega las habilidades y competencias necesarias para este puesto.
          </p>
          
          {cargandoActividades ? (
            <div className="loading-actividades">Cargando actividades...</div>
          ) : (
            <>
              {/* Selector de nueva actividad */}
              <div className="actividad-selector">
                <div className="selector-grid">
                  <div className="campo">
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

                  <div className="campo">
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

                  <div className="campo btn-agregar-container">
                    <label>&nbsp;</label>
                    <button 
                      type="button" 
                      onClick={agregarActividad}
                      className="btn-agregar"
                      disabled={loading}
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>

              {/* Lista de actividades agregadas */}
              {formData.actividades.length > 0 && (
                <div className="actividades-lista">
                  <h4>Actividades Agregadas ({formData.actividades.length})</h4>
                  <div className="actividades-grid">
                    {formData.actividades.map((actividad, index) => (
                      <div key={index} className="actividad-item info-card">
                        <div className="actividad-content">
                          <span className="actividad-nombre">
                            {actividad.nombre}
                            {actividad.area && <span className="actividad-area"> - {actividad.area}</span>}
                          </span>
                          <span className="actividad-nivel">{actividad.nivel_requerido}</span>
                        </div>
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
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || formData.actividades.length === 0}
            className="btn-buscar btn-submit"
          >
            {loading ? 'Creando Oferta...' : 'Publicar Oferta de Empleo'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfertaForm;