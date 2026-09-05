<?php
/**
 * Vixy Delivery Platform - API de Recargas de Billeteras y Comprobantes de Pago
 * Gestión de saldos, validación de pago móvil y desbloqueo de límite (-$0.50)
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

// -----------------------------------------------------------------------------
// GET: CONSULTAR RECARGAS PENDIENTES
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    $estado = $_GET['estado'] ?? 'pendiente';
    $usuarioId = $_GET['usuario_id'] ?? null;

    $sql = "SELECT cp.*, 
            CASE 
                WHEN cp.tipo_operacion = 'recarga_billetera_conductor' THEN (SELECT CONCAT(nombre, ' ', apellido) FROM conductores WHERE id = cp.usuario_id)
                WHEN cp.tipo_operacion = 'recarga_billetera_comercio' THEN (SELECT nombre FROM comercios WHERE id = cp.usuario_id)
                ELSE 'Usuario'
            END as nombre_titular
            FROM comprobantes_pago cp 
            WHERE 1=1";
    $params = [];

    if ($estado) { $sql .= " AND cp.estado = :est"; $params['est'] = $estado; }
    if ($usuarioId) { $sql .= " AND cp.usuario_id = :uid"; $params['uid'] = $usuarioId; }

    $sql .= " ORDER BY cp.creado_en DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    Database::jsonResponse(['success' => true, 'recargas' => $stmt->fetchAll()]);
}

// -----------------------------------------------------------------------------
// POST: SOLICITAR RECARGA CON COMPROBANTE DE PAGO
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $data = Database::getJsonInput();

    if (empty($data['usuario_id']) || empty($data['monto_usd']) || empty($data['numero_referencia'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Se requiere usuario_id, monto_usd y numero_referencia'], 400);
    }

    $newId = 'recarga-' . uniqid();
    $tasaBcv = 68.50;
    $montoUsd = (float)$data['monto_usd'];
    $montoBs = $montoUsd * $tasaBcv;

    $stmt = $pdo->prepare("
        INSERT INTO comprobantes_pago (
            id, tipo_operacion, referencia_id, usuario_id, metodo_pago,
            numero_referencia, monto_usd, monto_bs, comprobante_imagen_url, estado
        ) VALUES (
            :id, :tipo, :ref_id, :uid, :metodo,
            :num_ref, :m_usd, :m_bs, :img, 'pendiente'
        )
    ");

    $stmt->execute([
        'id' => $newId,
        'tipo' => $data['tipo_operacion'] ?? 'recarga_billetera_conductor',
        'ref_id' => $newId,
        'uid' => $data['usuario_id'],
        'metodo' => $data['metodo_pago'] ?? 'pago_movil',
        'num_ref' => $data['numero_referencia'],
        'm_usd' => $montoUsd,
        'm_bs' => $montoBs,
        'img' => $data['comprobante_imagen_url'] ?? '/uploads/comprobantes/default.jpg'
    ]);

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Recarga enviada para validación. Al ser aprobada por administración, su saldo se acreditará inmediatamente.',
        'recarga_id' => $newId
    ], 201);
}

// -----------------------------------------------------------------------------
// PUT: APROBAR O RECHAZAR RECARGA (ADMINISTRACIÓN)
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    $authUser = AuthMiddleware::requireAuth(['super_admin', 'finanzas', 'operador']);
    $data = Database::getJsonInput();
    $accion = $data['accion'] ?? 'aprobar'; // 'aprobar' o 'rechazar'

    $stmtCheck = $pdo->prepare("SELECT * FROM comprobantes_pago WHERE id = :id AND estado = 'pendiente'");
    $stmtCheck->execute(['id' => $id]);
    $recarga = $stmtCheck->fetch();

    if (!$recarga) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Comprobante no encontrado o ya procesado'], 404);
    }

    if ($accion === 'aprobar') {
        // 1. Actualizar estado del comprobante
        $stmtUpd = $pdo->prepare("UPDATE comprobantes_pago SET estado = 'aprobado', verificado_por = :admin_id, verificado_en = NOW() WHERE id = :id");
        $stmtUpd->execute(['admin_id' => $authUser['id'], 'id' => $id]);

        // 2. Si es recarga de conductor, sumar saldo y desbloquear si estaba bloqueado
        if ($recarga['tipo_operacion'] === 'recarga_billetera_conductor') {
            $stmtDriver = $pdo->prepare("
                UPDATE conductores 
                SET saldo_billetera_usd = saldo_billetera_usd + :monto,
                    bloqueado_por_saldo = CASE 
                        WHEN (saldo_billetera_usd + :monto2) >= -0.50 THEN 0 
                        ELSE bloqueado_por_saldo 
                    END
                WHERE id = :id
            ");
            $stmtDriver->execute([
                'monto' => $recarga['monto_usd'],
                'monto2' => $recarga['monto_usd'],
                'id' => $recarga['usuario_id']
            ]);
        }

        // 3. Si es comercio, sumar saldo
        if ($recarga['tipo_operacion'] === 'recarga_billetera_comercio') {
            $stmtStore = $pdo->prepare("UPDATE comercios SET saldo_billetera_usd = saldo_billetera_usd + :monto WHERE id = :id");
            $stmtStore->execute(['monto' => $recarga['monto_usd'], 'id' => $recarga['usuario_id']]);
        }

        Database::jsonResponse(['success' => true, 'mensaje' => "Recarga de \${$recarga['monto_usd']} USD aprobada y abonada con éxito"]);
    } else {
        $stmtRej = $pdo->prepare("UPDATE comprobantes_pago SET estado = 'rechazado', verificado_por = :admin_id, verificado_en = NOW() WHERE id = :id");
        $stmtRej->execute(['admin_id' => $authUser['id'], 'id' => $id]);

        Database::jsonResponse(['success' => true, 'mensaje' => 'Comprobante rechazado']);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Método no soportado'], 405);
