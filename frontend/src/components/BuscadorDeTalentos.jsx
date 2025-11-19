import React, { useState } from "react";
import axios from "axios";

export default function BuscadorDeTalentos() {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);

  const buscar = async () => {
    const { data } = await axios.get(`/api/personas/buscar?q=${query}`);
    setResultados(data);
  };

  return (
    <div>
      <h2>Buscar Talentos</h2>

      <input 
        type="text"
        value={query}
        placeholder="Habilidad, ciudad, experiencia…"
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={buscar}>Buscar</button>

      <div style={{ marginTop: 20 }}>
        {resultados.map((p) => (
          <div key={p.dni} style={{ padding: 10, margin: 10, border: "1px solid #ccc" }}>
            <h3>{p.nombre} {p.apellido}</h3>
            <p>DNI: {p.dni}</p>
            <p>Ciudad: {p.ciudad}</p>
            <p>Habilidades: {p.habilidades?.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
