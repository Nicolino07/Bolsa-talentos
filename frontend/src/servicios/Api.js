const API_BASE = 'http://localhost:3000/api'

/**
 * Crea una nueva persona en la base de datos.
 * @param {Object} personaData - Datos de la persona a crear.
 * @returns {Promise<Object>} Respuesta JSON del servidor con detalles.
 * @throws {Error} Si la creación falla, lanza un error con el detalle.
 */
export const crearPersona = async (personaData) => {
  const response = await fetch(`${API_BASE}/personas/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(personaData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al crear persona')
  }

  return await response.json()
}

/**
 * Obtiene una persona por DNI.
 * @param {number|string} dni - Documento Nacional de Identidad de la persona.
 * @returns {Promise<Object>} Detalles de la persona.
 * @throws {Error} Si la persona no es encontrada.
 */
export const obtenerPersona = async (dni) => {
  const response = await fetch(`${API_BASE}/personas/${dni}`)
  if (!response.ok) {
    throw new Error('Persona no encontrada')
  }
  return await response.json()
}

/**
 * Lista todas las personas registradas.
 * @returns {Promise<Array>} Arreglo con personas.
 * @throws {Error} Si ocurre un fallo al obtener la lista.
 */
export const listarPersonas = async () => {
  const response = await fetch(`${API_BASE}/personas/`)
  if (!response.ok) {
    throw new Error('Error al obtener personas')
  }
  return await response.json()
}

/**
 * Crea una nueva empresa en la base de datos.
 * @param {Object} empresaData - Datos de la empresa a crear.
 * @returns {Promise<Object>} Respuesta con detalles de la creación.
 * @throws {Error} Si la creación falla.
 */
export const crearEmpresa = async (empresaData) => {
  const response = await fetch(`${API_BASE}/empresas/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(empresaData),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.detail || 'Error al crear empresa')
  }

  return await response.json()
}

/**
 * Obtiene empresa por ID.
 * @param {number|string} id_empresa - Identificador de la empresa.
 * @returns {Promise<Object>} Datos de la empresa.
 * @throws {Error} Si la empresa no es encontrada.
 */
export const obtenerEmpresa = async (id_empresa) => {
  const response = await fetch(`${API_BASE}/empresas/${id_empresa}`)
  if (!response.ok) {
    throw new Error('Empresa no encontrada')
  }
  return await response.json()
}

/**
 * Lista todas las empresas registradas.
 * @returns {Promise<Array>} Arreglo con empresas.
 * @throws {Error} Si falla la obtención.
 */
export const listarEmpresas = async () => {
  const response = await fetch(`${API_BASE}/empresas/`)
  if (!response.ok) {
    throw new Error('Error al obtener empresas')
  }
  return await response.json()
}
