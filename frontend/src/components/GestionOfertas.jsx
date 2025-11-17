import React, { useState, useEffect } from 'react';
import OfertaForm from './OfertaForm';
import '../styles/OfertaForm.css';

const GestionOfertas = ({ empresaId }) => {
  const [vista, setVista] = useState('lista');
  const [ofertas, setOfertas] = useState([]);
  const [ofertaEditando, setOfertaEditando] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  console.log("🏢 Empresa ID en GestionOfertas:", empresaId, "Tipo:", typeof empresaId);

  // Cargar ofertas al montar el componente
  useEffect(() => {
    cargarOfertas();
  }, [empresaId]);

  const cargarOfertas = async () => {
    try {
      setLoading(true);
      const API_BASE_URL = 'http://localhost:3000';
      
      console.log("🔄 Cargando ofertas para empresa:", empresaId);
      
      // Cargar TODAS las ofertas
      const response = await fetch(`${API_BASE_URL}/api/ofertas/`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las ofertas');
      }
      
      const todasLasOfertas = await response.json();
      console.log("📦 Todas las ofertas crudas:", todasLasOfertas);
      
      // Convertir empresaId a número para comparación
      const empresaIdNum = Number(empresaId);
      
      // Filtrar SOLO las ofertas de esta empresa
      const ofertasEmpresa = todasLasOfertas.filter(oferta => {
        const ofertaEmpresaId = Number(oferta.id_empresa);
        const esDeEstaEmpresa = ofertaEmpresaId === empresaIdNum;
        
        console.log(`🔍 Oferta ${oferta.id_oferta}: 
          - empresaId en oferta: ${ofertaEmpresaId} (${typeof ofertaEmpresaId})
          - empresaId logueada: ${empresaIdNum} (${typeof empresaIdNum})
          - ¿Coincide?: ${esDeEstaEmpresa}
        `);
        
        return esDeEstaEmpresa;
      });
      
      console.log(`✅ Ofertas filtradas para empresa ${empresaId}:`, ofertasEmpresa);
      setOfertas(ofertasEmpresa);
      
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudieron cargar las ofertas');
      
      // En caso de error, mostrar array vacío para que no muestre ofertas de otras empresas
      setOfertas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOfertaCreada = (nuevaOferta) => {
    // Asegurarnos de que la nueva oferta tenga el empresaId correcto
    const ofertaConEmpresa = {
      ...nuevaOferta,
      id_empresa: Number(empresaId)
    };
    setOfertas(prev => [ofertaConEmpresa, ...prev]);
    setVista('lista');
  };

  const handleEliminarOferta = async (idOferta) => {
    // Verificar que la oferta pertenece a esta empresa antes de eliminar
    const ofertaAEliminar = ofertas.find(o => o.id_oferta === idOferta);
    
    if (!ofertaAEliminar) {
      alert('❌ Oferta no encontrada');
      return;
    }

    if (Number(ofertaAEliminar.id_empresa) !== Number(empresaId)) {
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
    // Verificar que la oferta pertenece a esta empresa antes de editar
    const ofertaAEditar = ofertas.find(o => o.id_oferta === idOferta);
    
    if (!ofertaAEditar) {
      alert('❌ Oferta no encontrada');
      return;
    }

    if (Number(ofertaAEditar.id_empresa) !== Number(empresaId)) {
      alert('❌ No tienes permisos para editar esta oferta');
      return;
    }

    try {
      const API_BASE_URL = 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/ofertas/${idOferta}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activa: !activaActual
        }),
      });

      if (response.ok) {
        const ofertaActualizada = await response.json();
        setOfertas(prev => prev.map(oferta =>
          oferta.id_oferta === idOferta ? ofertaActualizada : oferta
        ));
      } else {
        throw new Error('Error al actualizar la oferta');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al actualizar el estado de la oferta');
    }
  };

  const handleEditarOferta = (oferta) => {
    // Verificar que la oferta pertenece a esta empresa antes de editar
    if (Number(oferta.id_empresa) !== Number(empresaId)) {
      alert('❌ No tienes permisos para editar esta oferta');
      return;
    }

    setOfertaEditando(oferta);
    setVista('editar');
  };

  // Componente para editar oferta
  const EditarOferta = ({ oferta, onCancelar }) => {
    // Verificación adicional de seguridad
    if (Number(oferta.id_empresa) !== Number(empresaId)) {
      return (
        <div className="error-message">
          <strong>Error de permisos:</strong> No tienes acceso a esta oferta
        </div>
      );
    }

    const [formData, setFormData] = useState({
      titulo: oferta.titulo || '',
      descripcion: oferta.descripcion || '',
      activa: oferta.activa !== undefined ? oferta.activa : true
    });
    const [loadingEdit, setLoadingEdit] = useState(false);
    const [errorEdit, setErrorEdit] = useState('');

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoadingEdit(true);
      setErrorEdit('');

      try {
        const API_BASE_URL = 'http://localhost:3000';
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

          <div className="form-section">
            <h3>Información de la Oferta</h3>
            <div className="info-grid">
              <div className="info-item">
                <strong>ID Oferta:</strong> {oferta.id_oferta}
              </div>
              <div className="info-item">
                <strong>Empresa ID:</strong> {oferta.id_empresa}
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
                  <span className="stat-number">{empresaId}</span>
                  <span className="stat-label">Mi Empresa ID</span>
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
        <h2 className="subtitulo">Mis Ofertas de Empleo</h2>
        <div className="empresa-info">
          <span className="empresa-id">Empresa ID: {empresaId}</span>
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
            empresaId={empresaId}
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