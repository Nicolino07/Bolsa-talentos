import React, { useState } from "react";
import "../styles/FormStyles.css";

function LoginForm({ onVolver, onLoginSuccess }) {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulación login correcto
    const fakeUser = {
      nombre: "Juan Pérez",
      dni: 12345678,
      mail,
      ciudad: "Viedma"
    };

    onLoginSuccess(fakeUser);   // 👈 Enviamos datos falsos
  };

  return (
    <div className="form-container">
      <button className="btn-volver" onClick={onVolver}>
        ⬅ Volver
      </button>

      <h2 className="form-titulo">Iniciar Sesión</h2>

      <form className="formulario" onSubmit={handleSubmit}>
        <div>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
          />
        </div>

        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
            required
          />
        </div>

        <button className="btn-submit" type="submit">
          Ingresar
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
