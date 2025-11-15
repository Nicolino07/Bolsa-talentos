-- Script de inicialización de la base de datos
-- Este script se ejecuta una sola vez para crear la estructura inicial de la base de datos

-- Eliminar tablas si existen para evitar conflictos y asegurar creación limpia
-- El orden de eliminación considera dependencias para evitar errores por claves foráneas

DROP TABLE IF EXISTS oferta_empleo CASCADE;
DROP TABLE IF EXISTS persona_actividad CASCADE;
DROP TABLE IF EXISTS empresa_actividad CASCADE;
DROP TABLE IF EXISTS empresa CASCADE;
DROP TABLE IF EXISTS actividad CASCADE;
DROP TABLE IF EXISTS persona CASCADE;
DROP TABLE IF EXISTS oferta_actividad CASCADE;

-- Creación de la tabla persona con restricciones y validaciones
CREATE TABLE persona (
    dni                 INTEGER PRIMARY KEY CHECK (dni > 10000000),
    apellido            VARCHAR(100) NOT NULL,
    nombre              VARCHAR(100) NOT NULL,
    fecha_nacimiento    DATE NOT NULL CHECK (fecha_nacimiento BETWEEN '1900-01-01' AND '3000-12-31'),
    direccion           VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    provincia           VARCHAR(100) NOT NULL,
    sexo                VARCHAR(50) NOT NULL,
    email                VARCHAR(100) UNIQUE NOT NULL,
    telefono            VARCHAR(30),
    activa              BOOLEAN DEFAULT TRUE
);

-- Creación de la tabla empresa registrando datos de empresas
CREATE TABLE empresa (
    id_empresa          SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) UNIQUE NOT NULL,
    direccion           VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    provincia           VARCHAR(100) NOT NULL,
    email                VARCHAR(100) NOT NULL,
    telefono            VARCHAR(30),
    fecha_registro      TIMESTAMP DEFAULT NOW(),
    activa              BOOLEAN DEFAULT TRUE
);

-- Creación de tabla actividad para registrar distintos tipos de actividades o áreas
CREATE TABLE actividad (
    id_actividad        SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    area                VARCHAR(100),
    especialidad        VARCHAR(100),
    descripcion         TEXT
);

-- Tabla intermedia persona_actividad relacionando personas con actividades y experiencia
CREATE TABLE persona_actividad (
    id_relacion             SERIAL PRIMARY KEY,
    dni                     INTEGER NOT NULL REFERENCES persona(dni) ON DELETE CASCADE,
    id_actividad            INTEGER NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    nivel_experiencia       VARCHAR(50) CHECK (nivel_experiencia IN ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO')),
    años_experiencia        INTEGER DEFAULT 0 CHECK (años_experiencia >= 0),
    UNIQUE(dni, id_actividad)
);

-- Tabla intermedia empresa_actividad para especializaciones asignadas a empresas
CREATE TABLE empresa_actividad (
    id_empresa INTEGER NOT NULL REFERENCES empresa(id_empresa) ON DELETE CASCADE,
    id_actividad INTEGER NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    especializacion VARCHAR(100),
    PRIMARY KEY (id_empresa, id_actividad)
);

-- Tabla oferta_empleo para registrar ofertas de trabajo relacionadas a empresas o personas
CREATE TABLE oferta_empleo (
    id_oferta                   SERIAL PRIMARY KEY,
    id_empresa                  INTEGER REFERENCES empresa(id_empresa) ON DELETE CASCADE,
    persona_dni                 INTEGER REFERENCES persona(dni) ON DELETE CASCADE,
    titulo                      VARCHAR(200) NOT NULL,
    descripcion                 TEXT,
    fecha_publicacion           TIMESTAMP DEFAULT NOW(),
    activa BOOLEAN DEFAULT TRUE
);

-- Tabla intermedia oferta_actividad relacionando ofertas de empleo con actividades requeridas
-- Es una tabla de muchos a muchos entre oferta_empleo y actividad
CREATE TABLE oferta_actividad (
    id_oferta                       INTEGER NOT NULL REFERENCES oferta_empleo(id_oferta) ON DELETE CASCADE,
    id_actividad                    INTEGER NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    nivel_requerido                 VARCHAR(50) CHECK (nivel_requerido IN ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO')),
    PRIMARY KEY (id_oferta, id_actividad)
);

-- Tabla usuario para gestionar autenticación y roles de usuarios (personas o empresas)
-- Seguridad tradicional con hash y sal
CREATE TABLE usuario (
    id_usuario          SERIAL PRIMARY KEY,
    dni                 INTEGER UNIQUE REFERENCES persona(dni) ON DELETE CASCADE,
    id_empresa          INTEGER UNIQUE REFERENCES empresa(id_empresa) ON DELETE CASCADE,
    email                VARCHAR(100) UNIQUE NOT NULL,
    password_hash       VARCHAR(255) NOT NULL,  -- Bcrypt
    salt                VARCHAR(100) NOT NULL,           -- Sal para el hash
    rol                 VARCHAR(20) CHECK (rol IN ('PERSONA', 'EMPRESA', 'ADMIN')),
    fecha_registro      TIMESTAMP DEFAULT NOW(),
    ultimo_login        TIMESTAMP,
    activo              BOOLEAN DEFAULT TRUE,
    intentos_login      INTEGER DEFAULT 0,
    bloqueado_hasta     TIMESTAMP,
    -- Restricción: solo puede ser persona o empresa
    CHECK ((dni IS NOT NULL AND id_empresa IS NULL) OR 
           (dni IS NULL AND id_empresa IS NOT NULL))
);

-- Índices para optimizar consultas en la tabla persona_actividad
CREATE INDEX idx_persona_actividad_dni ON persona_actividad(dni);
CREATE INDEX idx_persona_actividad_actividad ON persona_actividad(id_actividad);
