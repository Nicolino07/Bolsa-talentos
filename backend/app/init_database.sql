-- Script de inicialización de la base de datos 
-- Solo se ejecuta una vez al crear la base de datos

-- Eliminar tablas si existen (en orden correcto por dependencias)
DROP TABLE IF EXISTS oferta_empleo CASCADE;
DROP TABLE IF EXISTS empresa CASCADE;
DROP TABLE IF EXISTS actividad CASCADE;
DROP TABLE IF EXISTS persona CASCADE;

-- Crear tablas
CREATE TABLE persona (
    dni                 INTEGER PRIMARY KEY CHECK (dni > 10000000),
    apellido            VARCHAR(100) NOT NULL,
    nombre              VARCHAR(100) NOT NULL,
    fecha_nacimiento    DATE NOT NULL CHECK (fecha_nacimiento BETWEEN '1900-01-01' AND '3000-12-31'),
    direccion           VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    provincia           VARCHAR(100) NOT NULL,
    sexo                VARCHAR(50) NOT NULL,
    mail                VARCHAR(100) UNIQUE NOT NULL,
    telefono            VARCHAR(30),   -- varchar permite +54-294-1234567
    activa              BOOLEAN DEFAULT TRUE
);

CREATE TABLE empresa (
    id_empresa          SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) UNIQUE NOT NULL,
    direccion           VARCHAR(100) NOT NULL,
    ciudad              VARCHAR(100) NOT NULL,
    provincia           VARCHAR(100) NOT NULL,
    mail                VARCHAR(100) NOT NULL,
    telefono            VARCHAR(30),
    fecha_registro      TIMESTAMP DEFAULT NOW(),
    activa              BOOLEAN DEFAULT TRUE
);

CREATE TABLE actividad (
    id_actividad        SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    area                VARCHAR(100),
    especialidad        VARCHAR(100),
    nivel               VARCHAR(50),
    descripcion         TEXT
);

CREATE TABLE persona_actividad (
    id_relacion             SERIAL PRIMARY KEY,
    dni                     INTEGER NOT NULL REFERENCES persona(dni) ON DELETE CASCADE,
    id_actividad            INTEGER NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    nivel_experiencia       VARCHAR(50) CHECK (nivel_experiencia IN ('PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO', 'EXPERTO')),
    años_experiencia        INTEGER DEFAULT 0 CHECK (años_experiencia >= 0),
    UNIQUE(dni, id_actividad)
);

CREATE TABLE empresa_actividad (
    id_empresa INTEGER NOT NULL REFERENCES empresa(id_empresa) ON DELETE CASCADE,
    id_actividad INTEGER NOT NULL REFERENCES actividad(id_actividad) ON DELETE CASCADE,
    especializacion VARCHAR(100), -- 'desarrollo', 'consultoria', 'producto'
    PRIMARY KEY (id_empresa, id_actividad)
);

CREATE TABLE oferta_empleo (
    id_oferta                   SERIAL PRIMARY KEY,
    id_empresa                  INTEGER NOT NULL REFERENCES empresa(id_empresa) ON DELETE CASCADE,
    titulo                      VARCHAR(200) NOT NULL,
    descripcion                 TEXT,
    tipo_contrato               VARCHAR(50),
    fecha_publicacion           TIMESTAMP DEFAULT NOW(),
    activa BOOLEAN DEFAULT TRUE
);

-- Índices para mejorar performance
CREATE INDEX idx_persona_actividad_dni ON persona_actividad(dni);
CREATE INDEX idx_persona_actividad_actividad ON persona_actividad(id_actividad);
