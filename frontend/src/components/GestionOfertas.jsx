import React, { useState, useEffect } from 'react';
import OfertaForm from './OfertaForm';
import '../styles/OfertaForm.css';

const GestionOfertas = ({ empresaId, usuario }) => {
  const [vista, setVista] = useState('lista');
  const [ofertas, setOfertas] = useState([]);
  const [ofertaEditando, setOfertaEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log("👤 Usuario en GestionOfertas:", usuario);
  console.log("🏢 Empresa ID en GestionOfertas:", empresaId, "Tipo:", typeof empresaId);

  // Determinar si es empresa o persona
  const esEmpresa = usuario?.id_empresa;
  const esPersona = usuario?.dni;

  useEffect(() => {
    cargarOfertas();
  }, [empresaId, usuario]);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = 'http://localhost:3000';
      
      let url = `${API_BASE_URL}/api/ofertas/`;
      
      // Usar endpoint específico según el tipo de usuario
      if (esEmpresa) {
        console.log("🔄 Cargando ofertas para EMPRESA:", usuario.id_empresa);
        url = `${API_BASE_URL}/api/ofertas/empresa/${usuario.id_empresa}`;
      } else if (esPersona) {
        console.log("🔄 Cargando ofertas para PERSONA:", usuario.dni);
        url = `${API_BASE_URL}/api/ofertas/persona/${usuario.dni}`;
      } else {
        console.log("🔄 Cargando TODAS las ofertas (sin filtro)");
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Error al cargar las ofertas');
      }
      
      const ofertasCargadas = await response.json();
      console.log("📦 Ofertas cargadas:", ofertasCargadas);
      
      setOfertas(ofertasCargadas);
      
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudieron cargar las ofertas');
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOfertaCreada = (nuevaOferta) => {
    setOfertas(prev => [nuevaOferta, ...prev]);
    setVista('lista');
  };

  const handleEliminarOferta = async (idOferta) => {
    const ofertaAEliminar = ofertas.find(o => o.id_oferta === idOferta);
    
    if (!ofertaAEliminar) {
      alert('❌ Oferta no encontrada');
      return;
    }

    // Verificar permisos según tipo de usuario
    if (esEmpresa && Number(ofertaAEliminar.id_empresa) !== Number(usuario.id_empresa)) {
      alert('❌ No tienes permisos para eliminar esta oferta');
      return;
    }
    
    if (esPersona && ofertaAEliminar.persona_dni !== usuario.dni) {
      alert('❌ No tienes permisos para eliminar esta oferta');
      return;
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar esta oferta?')) {
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/ofertas/${idOferta}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOfertas(prev => prev.filter(oferta => oferta.id_oferta !== idOferta));
        alert('✅ Oferta eliminada correctamente');
      } else {
        throw new Error('Error al eliminar la oferta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al eliminar la oferta');
    }
  };

  const toggleActivaOferta = async (idOferta, activaActual) => {
    const ofertaAEditar = ofertas.find(o => o.id_oferta === idOferta);
    
    if (!ofertaAEditar) {
      alert('❌ Oferta no encontrada');
      return;
    }

    // Verificar permisos según tipo de usuario
    if (esEmpresa && Number(ofertaAEditar.id_empresa) !== Number(usuario.id_empresa)) {
      alert('❌ No tienes permisos para editar esta oferta');
      return;
    }
    
    if (esPersona && ofertaAEditar.persona_dni !== usuario.dni) {
      alert('❌ No tienes permisos para editar esta oferta');
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:3000';
      
      // Enviar todos los campos requeridos 
      const datosActualizacion = {
        titulo: ofertaAEditar.titulo,
        descripcion: ofertaAEditar.descripcion,
        activa: !activaActual
      };

      console.log('🔄 Actualizando oferta:', datosActualizacion);

      const response = await fetch(`${API_BASE_URL}/api/ofertas/${idOferta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizacion),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error respuesta:', errorText);
        throw new Error(`Error al actualizar la oferta: ${errorText}`);
      }

      const ofertaActualizada = await response.json();
      console.log('✅ Oferta actualizada:', ofertaActualizada);
      
      setOfertas(prev => prev.map(oferta =>
        oferta.id_oferta === idOferta ? ofertaActualizada : oferta
      ));
      
      alert(`✅ Oferta ${!activaActual ? 'activada' : 'desactivada'} correctamente`);
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar el estado de la oferta: ' + error.message);
    }
  };

  const handleEditarOferta = (oferta) => {
    // Verificar permisos según tipo de usuario
    if (esEmpresa && Number(oferta.id_empresa) !== Number(usuario.id_empresa)) {
      alert('❌ No tienes permisos para editar esta oferta');
      return;
    }
    
    if (esPersona && oferta.persona_dni !== usuario.dni) {
      alert('❌ No tienes permisos para editar esta oferta');
      return;
    }

    setOfertaEditando(oferta);
    setVista('editar');
  };

  
  // Componente para editar oferta
  const EditarOferta = ({ oferta, onCancelar }) => {
    const [formData, setFormData] = useState({
      titulo: oferta.titulo || '',
      descripcion: oferta.descripcion || '',
      activa: oferta.activa !== undefined ? oferta.activa : true
    });
    const [actividadesSeleccionadas, setActividadesSeleccionadas] = useState([]);
    const [actividadesDisponibles, setActividadesDisponibles] = useState([]);
    const [nuevaActividad, setNuevaActividad] = useState({
      id_actividad: '',
      nivel_requerido: 'INTERMEDIO'
    });
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [errorEdit, setErrorEdit] = useState('');
    const [cargandoActividades, setCargandoActividades] = useState(true);

    // Cargar actividades disponibles y las actividades actuales de la oferta
    useEffect(() => {
      cargarActividades();
    }, []);

    const cargarActividades = async () => {
      try {
        setCargandoActividades(true);
        const API_BASE_URL = 'http://localhost:3000';
        
        // Cargar actividades disponibles
        const response = await fetch(`${API_BASE_URL}/api/actividades/?skip=0&limit=100`);
        
        if (!response.ok) {
          throw new Error('Error al cargar actividades');
        }
        
        const actividades = await response.json();
        setActividadesDisponibles(actividades);
        
        // Cargar actividades actuales de la oferta
        const ofertaResponse = await fetch(`${API_BASE_URL}/api/ofertas/${oferta.id_oferta}`);
        
        if (ofertaResponse.ok) {
          const ofertaCompleta = await ofertaResponse.json();
          setActividadesSeleccionadas(ofertaCompleta.actividades || []);
        }
        
      } catch (error) {
        console.error('Error cargando actividades:', error);
        setErrorEdit('Error al cargar las actividades');
      } finally {
        setCargandoActividades(false);
      }
    };

    const agregarActividad = () => {
      if (!nuevaActividad.id_actividad) {
        setErrorEdit('Selecciona una actividad');
        return;
      }

      const actividadSeleccionada = actividadesDisponibles.find(
        a => a.id_actividad === parseInt(nuevaActividad.id_actividad)
      );

      const existe = actividadesSeleccionadas.some(
        a => a.id_actividad === actividadSeleccionada.id_actividad
      );

      if (existe) {
        setErrorEdit('Esta actividad ya fue agregada');
        return;
      }

      if (actividadSeleccionada) {
        setActividadesSeleccionadas(prev => [
          ...prev,
          {
            ...actividadSeleccionada,
            nivel_requerido: nuevaActividad.nivel_requerido
          }
        ]);
        setNuevaActividad({
          id_actividad: '',
          nivel_requerido: 'INTERMEDIO'
        });
        setErrorEdit('');
      }
    };

    const eliminarActividad = (index) => {
      setActividadesSeleccionadas(prev => prev.filter((_, i) => i !== index));
    };

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    const handleActividadChange = (e) => {
      const { name, value } = e.target;
      setNuevaActividad(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoadingEdit(true);
      setErrorEdit('');

      try {
        const API_BASE_URL = 'http://localhost:3000';
        
        // 1. Actualizar la oferta básica
        const response = await fetch(`${API_BASE_URL}/api/ofertas/${oferta.id_oferta}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Error actualizando la oferta');
        }

        const ofertaActualizada = await response.json();
        
        // 2. Actualizar las actividades (eliminar todas y agregar las nuevas)
        // Primero eliminar actividades existentes
        await fetch(`${API_BASE_URL}/api/ofertas/${oferta.id_oferta}/actividades/`, {
          method: 'DELETE'
        });

        // Luego agregar las nuevas actividades
        const actividadesPromises = actividadesSeleccionadas.map(actividad =>
          fetch(`${API_BASE_URL}/api/ofertas/${oferta.id_oferta}/actividades/`, {
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

        await Promise.all(actividadesPromises);
        
        // Actualizar la lista
        setOfertas(prev => prev.map(o =>
          o.id_oferta === oferta.id_oferta ? ofertaActualizada : o
        ));
        
        setVista('lista');
        setOfertaEditando(null);
        alert('✅ Oferta actualizada correctamente');

      } catch (error) {
        console.error('Error:', error);
        setErrorEdit(error.message || 'Error al actualizar la oferta');
      } finally {
        setLoadingEdit(false);
      }
    };

    return (
      <div className="oferta-form-container">
        <div className="form-header">
          <h2 className="subtitulo">Editar Oferta de Empleo</h2>
          <button 
            type="button" 
            onClick={onCancelar}
            className="btn-header btn-cancelar"
          >
            ← Volver a la Lista
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-busqueda oferta-form">
          {/* Sección de información básica (igual que antes) */}
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
                disabled={loadingEdit}
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
                disabled={loadingEdit}
                className="campo-textarea"
              />
            </div>

            <div className="campo checkbox-field">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="activa"
                  checked={formData.activa}
                  onChange={handleInputChange}
                  disabled={loadingEdit}
                />
                <span className="checkmark"></span>
                Oferta activa (visible para candidatos)
              </label>
            </div>
          </div>

          {/* NUEVA SECCIÓN: Gestión de actividades */}
          <div className="form-section">
            <h3>Habilidades y Competencias Requeridas</h3>
            
            {cargandoActividades ? (
              <div className="loading">Cargando actividades...</div>
            ) : (
              <>
                <div className="agregar-actividad">
                  <div className="campos-actividad">
                    <div className="campo">
                      <label>Actividad/Especialidad</label>
                      <select
                        name="id_actividad"
                        value={nuevaActividad.id_actividad}
                        onChange={handleActividadChange}
                        disabled={loadingEdit}
                      >
                        <option value="">Selecciona una actividad</option>
                        {actividadesDisponibles.map(actividad => (
                          <option key={actividad.id_actividad} value={actividad.id_actividad}>
                            {actividad.nombre} {actividad.area && `- ${actividad.area}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="campo">
                      <label>Nivel Requerido</label>
                      <select
                        name="nivel_requerido"
                        value={nuevaActividad.nivel_requerido}
                        onChange={handleActividadChange}
                        disabled={loadingEdit}
                      >
                        <option value="PRINCIPIANTE">Principiante</option>
                        <option value="INTERMEDIO">Intermedio</option>
                        <option value="AVANZADO">Avanzado</option>
                        <option value="EXPERTO">Experto</option>
                      </select>
                    </div>
                    
                    <div className="campo">
                      <label>&nbsp;</label>
                      <button 
                        type="button" 
                        onClick={agregarActividad}
                        className="btn-agregar"
                        disabled={loadingEdit}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Lista de actividades agregadas */}
                {actividadesSeleccionadas.length > 0 && (
                  <div className="actividades-lista">
                    <h4>Actividades Agregadas ({actividadesSeleccionadas.length})</h4>
                    <div className="habilidades-lista">
                      {actividadesSeleccionadas.map((actividad, index) => (
                        <div key={index} className="habilidad-item">
                          <span className="habilidad-texto">
                            {actividad.nombre}
                            {actividad.area && <span style={{ opacity: 0.8 }}> - {actividad.area}</span>}
                            <span className="nivel-requerido">
                              {actividad.nivel_requerido}
                            </span>
                          </span>
                          <button 
                            type="button"
                            onClick={() => eliminarActividad(index)}
                            className="btn-eliminar"
                            disabled={loadingEdit}
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

          {/* Información de la oferta */}
          <div className="form-section">
            <h3>Información de la Oferta</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>ID Oferta:</strong> {oferta.id_oferta}
              </div>
              <div className="info-item">
                <strong>{esEmpresa ? 'Empresa ID:' : 'Persona DNI:'}</strong> {esEmpresa ? oferta.id_empresa : oferta.persona_dni}
              </div>
              <div className="info-item">
                <strong>Fecha de publicación:</strong> {new Date(oferta.fecha_publicacion).toLocaleDateString()}
              </div>
              <div className="info-item">
                <strong>Estado actual:</strong> 
                <span className={`status ${oferta.activa ? 'activo' : 'inactivo'}`}>
                  {oferta.activa ? 'Activa' : 'Inactiva'}
                </span>
              </div>
            </div>
          </div>

          {errorEdit && (
            <div className="error-message">
              <strong>Error:</strong> {errorEdit}
            </div>
          )}

          <div className="form-actions">
            <button 
              type="submit" 
              disabled={loadingEdit}
              className="btn-buscar btn-submit"
            >
              {loadingEdit ? 'Actualizando Oferta...' : 'Actualizar Oferta'}
            </button>
            
            <button 
              type="button"
              onClick={onCancelar}
              className="btn-cancelar-form"
              disabled={loadingEdit}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };
  // Componente para lista de ofertas
  const ListaOfertas = () => {
    if (loading) {
      return <div className="loading">Cargando ofertas...</div>;
    }

    return (
      <div className="lista-ofertas">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {ofertas.length === 0 ? (
          <div className="empty-state">
            <h3>No tienes ofertas publicadas</h3>
            <p>Crea tu primera oferta de empleo para empezar a recibir candidatos.</p>
            <button 
              onClick={() => setVista('crear')}
              className="btn-header btn-crear"
            >
              + Crear Primera Oferta
            </button>
          </div>
        ) : (
          <>
            <div className="ofertas-stats">
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="stat-number">{ofertas.length}</span>
                  <span className="stat-label">Mis Ofertas</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">
                    {ofertas.filter(o => o.activa).length}
                  </span>
                  <span className="stat-label">Ofertas Activas</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number">
                    {esEmpresa ? usuario.id_empresa : usuario.dni}
                  </span>
                  <span className="stat-label">
                    {esEmpresa ? 'Mi Empresa ID' : 'Mi DNI'}
                  </span>
                </div>
              </div>
            </div>

            <div className="ofertas-grid">
              {ofertas.map(oferta => (
                <div key={oferta.id_oferta} className="oferta-card info-card">
                  <div className="oferta-header">
                    <h3 className="oferta-titulo">{oferta.titulo}</h3>
                    <span className={`oferta-estado ${oferta.activa ? 'activa' : 'inactiva'}`}>
                      {oferta.activa ? '🟢 Activa' : '🔴 Inactiva'}
                    </span>
                  </div>

                  <div className="oferta-descripcion">
                    {oferta.descripcion}
                  </div>

                  <div className="oferta-meta">
                    <span className="fecha">
                      Publicada: {new Date(oferta.fecha_publicacion).toLocaleDateString()}
                    </span>
                    {oferta.actividades && (
                      <span className="actividades">
                        {oferta.actividades.length} habilidad(es) requerida(s)
                      </span>
                    )}
                  </div>

                  <div className="oferta-actions">
                    <button
                      onClick={() => handleEditarOferta(oferta)}
                      className="btn-editar"
                    >
                      Editar
                    </button>
                    
                    <button
                      onClick={() => toggleActivaOferta(oferta.id_oferta, oferta.activa)}
                      className={`btn-toggle ${oferta.activa ? 'btn-desactivar' : 'btn-activar'}`}
                    >
                      {oferta.activa ? 'Desactivar' : 'Activar'}
                    </button>
                    
                    <button
                      onClick={() => handleEliminarOferta(oferta.id_oferta)}
                      className="btn-eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="gestion-ofertas">
      <div className="gestion-header">
        <h2 className="subtitulo">
          {esEmpresa ? 'Mis Ofertas de Empleo' : 'Mis Ofertas Publicadas'}
        </h2>
        <div className="empresa-info">
          <span className="empresa-id">
            {esEmpresa ? `Empresa ID: ${usuario.id_empresa}` : `Persona DNI: ${usuario.dni}`}
          </span>
        </div>
        
        <div className="gestion-actions">
          {vista === 'lista' && (
            <button 
              onClick={() => setVista('crear')}
              className="btn-header btn-crear"
            >
              + Crear Nueva Oferta
            </button>
          )}
          {(vista === 'crear' || vista === 'editar') && (
            <button 
              onClick={() => setVista('lista')}
              className="btn-header btn-volver"
            >
              ← Volver a Mis Ofertas
            </button>
          )}
        </div>
      </div>

      <div className="gestion-content">
        {vista === 'lista' && <ListaOfertas />}
        {vista === 'crear' && (
          <OfertaForm 
            usuario={usuario}
            onOfertaCreada={handleOfertaCreada}
            onCancelar={() => setVista('lista')}
          />
        )}
        {vista === 'editar' && ofertaEditando && (
          <EditarOferta 
            oferta={ofertaEditando}
            onCancelar={() => {
              setVista('lista');
              setOfertaEditando(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default GestionOfertas;

