import { useState } from "react";
import "../../styles/FormStyles.css";

export default function HabilidadesPersona() {
  const [habilidades, setHabilidades] = useState([]);
  const [nuevaHabilidad, setNuevaHabilidad] = useState("");

  const agregarHabilidad = () => {
    if (nuevaHabilidad.trim() && !habilidades.includes(nuevaHabilidad)) {
      setHabilidades([...habilidades, nuevaHabilidad.trim()]);
      setNuevaHabilidad("");
    }
  };

  const eliminarHabilidad = (habilidad) => {
    setHabilidades(habilidades.filter(h => h !== habilidad));
  };

  return (
    <div className="form-container">
      <h2 className="form-titulo">Mis Habilidades</h2>
      <div className="formulario">
        <div>
          <label htmlFor="habilidad">Agregar habilidad</label>
          <input 
            type="text" 
            id="habilidad" 
            value={nuevaHabilidad}
            onChange={(e) => setNuevaHabilidad(e.target.value)}
            placeholder="Ej: JavaScript, React, Photoshop..."
            onKeyPress={(e) => e.key === 'Enter' && agregarHabilidad()}
          />
        </div>
        
        <button 
          className="btn-submit" 
          type="button" 
          onClick={agregarHabilidad}
        >
          Agregar Habilidad
        </button>

        {habilidades.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3 style={{ 
              color: 'var(--primary-dark)', 
              marginBottom: '15px',
              fontSize: '1.2rem'
            }}>
              Mis Habilidades:
            </h3>
            <div className="habilidades-lista">
              {habilidades.map((habilidad, index) => (
                <div 
                  key={index}
                  className="habilidad-item"
                >
                  <span className="habilidad-texto">{habilidad}</span>
                  <button 
                    className="btn-eliminar"
                    onClick={() => eliminarHabilidad(habilidad)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}