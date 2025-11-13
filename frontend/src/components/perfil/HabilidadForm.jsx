import { useState } from "react";

function HabilidadForm({ onAgregar }) {
  const [actividad, setActividad] = useState("");
  const [nivel, setNivel] = useState("PRINCIPIANTE");
  const [anios, setAnios] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();

    onAgregar({
      actividad,
      nivel_experiencia: nivel,
      años_experiencia: Number(anios),
    });

    setActividad("");
    setAnios(0);
    setNivel("PRINCIPIANTE");
  };

  return (
    <form className="formulario" onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      <div>
        <label>Actividad</label>
        <input
          type="text"
          value={actividad}
          onChange={(e) => setActividad(e.target.value)}
          placeholder="Ej: Programación, Carpintería..."
          required
        />
      </div>

      <div>
        <label>Nivel de experiencia</label>
        <select value={nivel} onChange={(e) => setNivel(e.target.value)}>
          <option>PRINCIPIANTE</option>
          <option>INTERMEDIO</option>
          <option>AVANZADO</option>
          <option>EXPERTO</option>
        </select>
      </div>

      <div>
        <label>Años de experiencia</label>
        <input
          type="number"
          min="0"
          value={anios}
          onChange={(e) => setAnios(e.target.value)}
        />
      </div>

      <button className="btn-submit">Agregar</button>
    </form>
  );
}

export default HabilidadForm;
