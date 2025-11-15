
const API_BASE_URL = 'http://localhost:3000';

/* ==================== AUTENTICACIÓN ==================== */

export const login = async (email, password) => {
  try {
    console.log('🔐 Enviando credenciales:', { email, password });
    
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    });

    const data = await response.json();
    console.log('📨 Respuesta del backend:', data);
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error en login');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
};

export const getUsuarioCompleto = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/usuario/completo`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Error al obtener usuario');
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Error al obtener usuario:', error);
    throw error;
  }
};


// mejora el manejo de errores
export const registroEmpresa = async (empresaData) => {
  try {
    const response = await fetch(`${API_BASE}/auth/registro/empresa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(empresaData),
    });

    const responseData = await response.json();
    console.log('📨 EMPRESA - Respuesta del backend:', responseData);

    if (!response.ok) {
      // Manejar errores de Pydantic
      if (responseData.detail && Array.isArray(responseData.detail)) {
        const errorMessages = responseData.detail.map(err => 
          `Campo: ${err.loc[1]}, Error: ${err.msg}`
        ).join('; ');
        throw new Error(`Errores de validación: ${errorMessages}`);
      } else if (responseData.detail) {
        throw new Error(responseData.detail);
      } else {
        throw new Error('Error desconocido del servidor');
      }
    }

    return responseData;
  } catch (error) {
    console.log('🔥 EMPRESA - Error en fetch:', error);
    throw error;
  }
};

export const registroPersona = async (personaData) => {
  try {
    const response = await fetch(`${API_BASE}/auth/registro/persona`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(personaData),
    });

    const responseData = await response.json();
    console.log('📨 PERSONA - Respuesta del backend:', responseData);

    if (!response.ok) {
      if (responseData.detail && Array.isArray(responseData.detail)) {
        const errorMessages = responseData.detail.map(err => 
          `Campo: ${err.loc[1]}, Error: ${err.msg}`
        ).join('; ');
        throw new Error(`Errores de validación: ${errorMessages}`);
      } else if (responseData.detail) {
        throw new Error(responseData.detail);
      } else {
        throw new Error('Error desconocido del servidor');
      }
    }

    return responseData;
  } catch (error) {
    console.log('🔥 PERSONA - Error en fetch:', error);
    throw error;
  }
};

export const getPerfilUsuario = async (token) => {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener perfil');
  }

  return await response.json();
};

/* ==================== PERSONAS ==================== */

export const obtenerPersona = async (dni, token) => {
  const response = await fetch(`${API_BASE}/api/personas/${dni}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) throw new Error('Persona no encontrada');
  return await response.json();
};

export const listarPersonas = async (token) => {
  const response = await fetch(`${API_BASE}/api/personas/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) throw new Error('Error al obtener personas');
  return await response.json();
};

/* ==================== EMPRESAS ==================== */

export const obtenerEmpresa = async (id_empresa, token) => {
  const response = await fetch(`${API_BASE}/api/empresas/${id_empresa}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) throw new Error('Empresa no encontrada');
  return await response.json();
};

export const listarEmpresas = async (token) => {
  const response = await fetch(`${API_BASE}/api/empresas/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) throw new Error('Error al obtener empresas');
  return await response.json();
};

/* ==================== OFERTAS ==================== */

export const crearOferta = async (ofertaData, token) => {
  const response = await fetch(`${API_BASE}/api/ofertas/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(ofertaData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error al crear oferta');
  }

  return await response.json();
};

export const listarOfertas = async (token) => {
  const response = await fetch(`${API_BASE}/api/ofertas/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) throw new Error('Error al obtener ofertas');
  return await response.json();
};

/* ==================== ACTIVIDADES ==================== */

export const listarActividades = async (token) => {
  const response = await fetch(`${API_BASE}/api/actividades/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
  });
  
  if (!response.ok) throw new Error('Error al obtener actividades');
  return await response.json();
};



// Helper para obtener headers con autenticación
export const getAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});