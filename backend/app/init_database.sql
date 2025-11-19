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
    email               VARCHAR(100) UNIQUE NOT NULL,
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
    email               VARCHAR(100) NOT NULL,
    telefono            VARCHAR(30),
    fecha_registro      TIMESTAMP DEFAULT NOW(),
    activa              BOOLEAN DEFAULT TRUE
);

-- Tabla para estudios de las personas

CREATE TABLE estudio (
    titulo              VARCHAR(200) NOT NULL,
    dni                 INTEGER NOT NULL REFERENCES persona(dni) ON DELETE CASCADE,
    institucion         VARCHAR(200) NOT NULL,
    fecha_inicio        DATE NOT NULL,
    fecha_fin           DATE,
    estado              VARCHAR(50) CHECK (estado IN ('COMPLETADO', 'EN CURSO', 'SIN TERMINAR')),
    descripcion         TEXT
    PRIMARY KEY (titulo, dni)
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
    activa                      BOOLEAN DEFAULT TRUE
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


-- =============================================
-- PARA MAS POSIBLE MEJORA APRENDIZAJE AUTOMATICO
-- =============================================

-- TABLA PARA RELACIONES APRENDIDAS

CREATE TABLE IF NOT EXISTS relaciones_aprendidas (
    id SERIAL PRIMARY KEY,
    
    
    habilidad_base          VARCHAR(100) NOT NULL,
    habilidad_objetivo      VARCHAR(100) NOT NULL,
    confianza               DECIMAL(3,2) DEFAULT 0.5 CHECK (confianza >= 0 AND confianza <= 1),
    frecuencia              INTEGER DEFAULT 1,
    fuente                  VARCHAR(20) DEFAULT 'co_ocurrencia' CHECK (fuente IN (
        'manual', 'co_ocurrencia', 'contratos')),
    activo                  BOOLEAN DEFAULT true,
    creado_en               TIMESTAMP DEFAULT NOW(),
    actualizado_en          TIMESTAMP DEFAULT NOW(),
    
    -- Una relación única por par de habilidades
    UNIQUE(habilidad_base, habilidad_objetivo)
);



-- TABLA DE POSTULACIONES

CREATE TABLE IF NOT EXISTS postulaciones (

    id          SERIAL PRIMARY KEY,
    dni         INTEGER NOT NULL REFERENCES persona(dni),
    id_oferta   INTEGER NOT NULL REFERENCES oferta_empleo(id_oferta),
    estado      VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN (
        'pendiente', 'revisando', 'entrevista', 'contratado', 'rechazado'
    )),
    creado_en           TIMESTAMP DEFAULT NOW(),
    actualizado_en      TIMESTAMP DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_postulaciones_dni ON postulaciones(dni);
CREATE INDEX idx_postulaciones_oferta ON postulaciones(id_oferta);
CREATE INDEX idx_postulaciones_estado ON postulaciones(estado);
CREATE INDEX idx_postulaciones_fecha ON postulaciones(creado_en);
CREATE INDEX idx_relaciones_base ON relaciones_aprendidas(habilidad_base);
CREATE INDEX idx_relaciones_confianza ON relaciones_aprendidas(confianza) WHERE activo = true;
CREATE INDEX idx_relaciones_activas ON relaciones_aprendidas(activo) WHERE activo = true;