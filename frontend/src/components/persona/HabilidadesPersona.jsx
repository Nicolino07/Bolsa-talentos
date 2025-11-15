import { useState } from "react";
import HabilidadForm from "./HabilidadForm";

function HabilidadesPersona() {
  const [habilidades, setHabilidades] = useState([
    { actividad: "Programación", nivel_experiencia: "INTERMEDIO", años_experiencia: 2 },
    { actividad: "Atención al Cliente", nivel_experiencia: "AVANZADO", años_experiencia: 4 },
  ]);

  const handleAgregar = (hab) => {
    setHabilidades([...habilidades, hab]);
  };

  return (
    <div>
      <h2>🛠 Mis Habilidades</h2>

      <ul>
        {habilidades.map((h, i) => (
          <li key={i}>
            <strong>{h.actividad}</strong> — {h.nivel_experiencia} ({h.años_experiencia} años)
          </li>
        ))}
      </ul>

      <HabilidadForm onAgregar={handleAgregar} />
    </div>
  );
}

export default HabilidadesPersona;
