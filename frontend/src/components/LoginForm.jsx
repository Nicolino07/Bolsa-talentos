import React, { useState } from "react";
import "../styles/FormStyles.css";
import { login } from "../servicios/Api"; 

function LoginForm({ onVolver, onLoginSuccess }) {
  const [email, setMail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await login(email, password);
      console.log('🔍 RESPUESTA COMPLETA DEL BACKEND:', data);

      // Construir objeto usuario con todos los datos disponibles
      const usuario = {
        token: data.access_token,
        rol: data.rol,
        dni: data.dni,
        id_empresa: data.id_empresa,
        email: data.usuario?.email || email, // Usar email del backend si está disponible
        // Incluir todos los datos del usuario si vienen del backend
        ...(data.usuario || {}),
        // Asegurar que tenemos id_usuario
        id_usuario: data.usuario?.id_usuario || data.id_usuario
      };

      console.log('✅ USUARIO FINAL PARA EL STATE:', usuario);
      
      // Guardar token en localStorage
      localStorage.setItem("token", data.access_token);
      
      // Pasar el usuario completo al callback
      onLoginSuccess(usuario);
      
    } catch (error) {
      setError(error.message || "Error en el login");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <button className="btn-volver" onClick={onVolver}>
        ⬅ Volver
      </button>

      <h2 className="form-titulo">Iniciar Sesión</h2>

      {error && (
        <div style={{
          color: "#d32f2f",
          backgroundColor: "#ffebee",
          padding: "12px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #f44336"
        }}>
          {error}
        </div>
      )}

      <form className="formulario" onSubmit={handleSubmit}>
        <div>
          <label>Correo electrónico</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setMail(e.target.value)}
            placeholder="ejemplo@correo.com"
            required
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        <button 
          className="btn-submit" 
          type="submit"
          disabled={loading}
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

export default LoginForm;