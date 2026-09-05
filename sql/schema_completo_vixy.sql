-- ==============================================================================
-- SISTEMA VIXY DELIVERY - SCHEMA COMPLETO UNIFICADO DE BASE DE DATOS
-- PROPIETARIO: Vixy Plataforma Central (Vixy Web, Pedidos, Store y Delivery)
-- MOTOR: MySQL 8.0+ / MariaDB 10.5+
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS vixy_platform_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE vixy_platform_db;

-- ------------------------------------------------------------------------------
-- 1. TABLA: usuarios_administracion_web (SUPERUSUARIO & RBAC)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios_administracion_web (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    nivel_acceso ENUM('super_admin', 'operador', 'finanzas', 'soporte', 'auditor') NOT NULL DEFAULT 'operador',
    departamento VARCHAR(100) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Política de Seguridad de Claves: Primer inicio y 90 días de vigencia
    debe_cambiar_clave BOOLEAN DEFAULT FALSE,
    fecha_ultimo_cambio_clave DATE DEFAULT (CURRENT_DATE),
    fecha_vencimiento_clave DATE NOT NULL,
    dias_vigencia_maximo INT DEFAULT 90,
    
    -- Permisos granulares de pestañas en formato JSON
    pestanas_permitidas JSON NOT NULL,
    avatar_url VARCHAR(255) DEFAULT '/uploads/admin/avatares/default.jpg',
    ultimo_acceso TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserción del Superusuario Oficial requerido: vixydely / 123456
INSERT INTO usuarios_administracion_web (
    id,
    username,
    password_hash,
    nombre,
    email,
    nivel_acceso,
    departamento,
    activo,
    debe_cambiar_clave,
    fecha_ultimo_cambio_clave,
    fecha_vencimiento_clave,
    dias_vigencia_maximo,
    pestanas_permitidas
) VALUES (
    'usr-root-vixydely',
    'vixydely',
    '123456', -- En producción almacenar hash: $2y$10$...
    'Superusuario VixyDely',
    'vixydely@vixy.com',
    'super_admin',
    'Dirección General & Root Admin',
    TRUE,
    FALSE,
    CURRENT_DATE,
    DATE_ADD(CURRENT_DATE, INTERVAL 90 DAY),
    90,
    JSON_ARRAY(
        'dashboard',
        'recargas',
        'custodia',
        'reclamos',
        'pedidos',
        'conductores',
        'comercios',
        'incidencias',
        'soporte',
        'verificaciones',
        'pagos',
        'usuarios_web',
        'logs',
        'backend'
    )
) ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    pestanas_permitidas = VALUES(pestanas_permitidas);

-- ------------------------------------------------------------------------------
-- 2. TABLA: categorias_comercio
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias_comercio (
    id VARCHAR(50) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50) DEFAULT 'store',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categorias_comercio (id, codigo, nombre, descripcion, icono, orden) VALUES
('cat-1', 'hogar', 'Hogar', 'Muebles, cocina, decoración y lencería', 'home', 1),
('cat-2', 'ferreteria', 'Ferretería', 'Materiales, pinturas, herramientas eléctricas y manuales', 'wrench', 2),
('cat-3', 'restaurantes', 'Restaurantes', 'Almuerzos, comida criolla, internacional y ejecutiva', 'utensils', 3),
('cat-4', 'comida_rapida', 'Comida Rápida', 'Hamburguesas, pizzas, pollo frito, sushi y snacks', 'zap', 4),
('cat-5', 'supermercados', 'Supermercados', 'Víveres, charcutería, carnes frescas, lácteos y bebidas', 'shopping-cart', 5)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre);

-- ------------------------------------------------------------------------------
-- 3. TABLA: comercios
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS comercios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    rif VARCHAR(30) NOT NULL UNIQUE,
    categoria_principal ENUM('hogar', 'ferreteria', 'restaurantes', 'comida_rapida', 'supermercados') NOT NULL,
    categoria_nombre VARCHAR(100) NOT NULL,
    logo_url VARCHAR(255),
    portada_url VARCHAR(255),
    direccion TEXT NOT NULL,
    latitud DECIMAL(10, 8) NOT NULL,
    longitud DECIMAL(11, 8) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    email VARCHAR(120) NOT NULL,
    
    -- Horarios y estado
    hora_apertura TIME NOT NULL DEFAULT '08:00:00',
    hora_cierre TIME NOT NULL DEFAULT '22:00:00',
    dias_operacion JSON NOT NULL,
    horarios_texto VARCHAR(100) DEFAULT '08:00 AM - 10:00 PM',
    activo BOOLEAN DEFAULT TRUE,
    abierto_manual BOOLEAN DEFAULT TRUE,
    
    tiempo_estimado_min INT DEFAULT 20,
    tiempo_estimado_max INT DEFAULT 45,
    costo_envio_base_usd DECIMAL(10, 2) DEFAULT 2.50,
    calificacion DECIMAL(3, 2) DEFAULT 5.00,
    total_calificaciones INT DEFAULT 0,
    saldo_billetera_usd DECIMAL(12, 2) DEFAULT 0.00,
    saldo_billetera_bs DECIMAL(14, 2) DEFAULT 0.00,
    total_ventas_usd DECIMAL(14, 2) DEFAULT 0.00,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABLA: conductores
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conductores (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    cedula VARCHAR(30) NOT NULL UNIQUE,
    telefono VARCHAR(30) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    en_carrera BOOLEAN DEFAULT FALSE,
    latitud_actual DECIMAL(10, 8) NOT NULL,
    longitud_actual DECIMAL(11, 8) NOT NULL,
    saldo_billetera_usd DECIMAL(10, 2) DEFAULT 0.00,
    limite_saldo_negativo DECIMAL(10, 2) DEFAULT -0.50,
    bloqueado_por_saldo BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3, 2) DEFAULT 5.00,
    total_carreras INT DEFAULT 0,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABLA: pedidos
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pedidos (
    id VARCHAR(50) PRIMARY KEY,
    codigo_seguimiento VARCHAR(50) NOT NULL UNIQUE,
    cliente_id VARCHAR(50) NOT NULL,
    comercio_id VARCHAR(50) NOT NULL,
    conductor_id VARCHAR(50) NULL,
    estado ENUM(
        'solicitud_enviada',
        'pago_verificado',
        'en_preparacion',
        'esperando_repartidor',
        'en_camino_al_cliente',
        'entregado',
        'cerrado_calificado',
        'cancelado'
    ) NOT NULL DEFAULT 'solicitud_enviada',
    monto_subtotal_usd DECIMAL(10, 2) NOT NULL,
    costo_envio_usd DECIMAL(10, 2) NOT NULL,
    tasa_bcv_bs DECIMAL(10, 4) NOT NULL,
    monto_total_usd DECIMAL(10, 2) NOT NULL,
    monto_total_bs DECIMAL(12, 2) NOT NULL,
    metodo_pago VARCHAR(50) NOT NULL,
    referencia_pago VARCHAR(100),
    destino_direccion TEXT NOT NULL,
    entregado_en TIMESTAMP NULL,
    cerrado_en TIMESTAMP NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
