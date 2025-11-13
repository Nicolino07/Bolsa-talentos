const API_BASE = 'http://localhost:3000/api';

/* -------------------- PERSONAS -------------------- */

export const crearPersona = async (personaData) => {
  const response = await fetch(`${API_BASE}/personas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(personaData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al crear persona');
  }

  return await response.json();
};

export const obtenerPersona = async (dni) => {
  const response = await fetch(`${API_BASE}/personas/${dni}`);
  if (!response.ok) throw new Error('Persona no encontrada');
  return await response.json();
};

export const listarPersonas = async () => {
  const response = await fetch(`${API_BASE}/personas/`);
  if (!response.ok) throw new Error('Error al obtener personas');
  return await response.json();
};

/* -------------------- EMPRESAS -------------------- */

export const crearEmpresa = async (empresaData) => {
  const response = await fetch(`${API_BASE}/empresas/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(empresaData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al crear empresa');
  }

  return await response.json();
};

export const obtenerEmpresa = async (id_empresa) => {
  const response = await fetch(`${API_BASE}/empresas/${id_empresa}`);
  if (!response.ok) throw new Error('Empresa no encontrada');
  return await response.json();
};

export const listarEmpresas = async () => {
  const response = await fetch(`${API_BASE}/empresas/`);
  if (!response.ok) throw new Error('Error al obtener empresas');
  return await response.json();
};

/* -------------------- LOGIN (FAKE) -------------------- */

export const loginFake = async (mail, password) => {
  return {
    ok: true,
    usuario: {
      dni: 12345678,
      nombre: "Juan Pérez",
      mail,
      es_empresa: false,
    }
  };
};

/* -------------------- LOGIN REAL (cuando esté listo) -------------------- */

export const login = async (mail, password) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mail, password }),
  });

  return await response.json();
};
