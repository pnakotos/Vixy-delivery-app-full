<?php
/**
 * Vixy Delivery Platform - API de Pedidos y Ciclo de Vida Completo
 * Creación, Aceptación, En Camino, Entrega y Cierre Limpio con Calificaciones
 */

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/config/auth_middleware.php';

$pdo = Database::getConnection();
$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;
$action = $_GET['action'] ?? null;

// -----------------------------------------------------------------------------
// GET: CONSULTAR PEDIDO O LISTAR POR CLIENTE / COMERCIO / CONDUCTOR / ADMIN
// -----------------------------------------------------------------------------
if ($method === 'GET') {
    if ($id) {
        $stmt = $pdo->prepare("
            SELECT p.*, c.nombre as comercio_nombre, c.telefono as comercio_telefono,
                   d.nombre as conductor_nombre, d.telefono as conductor_telefono,
                   d.latitud_actual as conductor_lat, d.longitud_actual as conductor_lng
            FROM pedidos p
            LEFT JOIN comercios c ON p.comercio_id = c.id
            LEFT JOIN conductores d ON p.conductor_id = d.id
            WHERE p.id = :id OR p.codigo_seguimiento = :id2
            LIMIT 1
        ");
        $stmt->execute(['id' => $id, 'id2' => $id]);
        $pedido = $stmt->fetch();

        if (!$pedido) {
            Database::jsonResponse(['error' => true, 'mensaje' => 'Pedido no encontrado'], 404);
        }

        // Obtener items
        $stmtItems = $pdo->prepare("SELECT * FROM pedidos_items WHERE pedido_id = :pid");
        $stmtItems->execute(['pid' => $pedido['id']]);
        $pedido['items'] = $stmtItems->fetchAll();

        Database::jsonResponse(['success' => true, 'pedido' => $pedido]);
    }

    $comercioId = $_GET['comercio_id'] ?? null;
    $clienteId = $_GET['cliente_id'] ?? null;
    $conductorId = $_GET['conductor_id'] ?? null;
    $estado = $_GET['estado'] ?? null;

    $sql = "SELECT p.*, c.nombre as comercio_nombre, d.nombre as conductor_nombre 
            FROM pedidos p 
            LEFT JOIN comercios c ON p.comercio_id = c.id
            LEFT JOIN conductores d ON p.conductor_id = d.id
            WHERE 1=1";
    $params = [];

    if ($comercioId) { $sql .= " AND p.comercio_id = :cid"; $params['cid'] = $comercioId; }
    if ($clienteId) { $sql .= " AND p.cliente_id = :clid"; $params['clid'] = $clienteId; }
    if ($conductorId) { $sql .= " AND p.conductor_id = :drid"; $params['drid'] = $conductorId; }
    if ($estado) { $sql .= " AND p.estado = :est"; $params['est'] = $estado; }

    $sql .= " ORDER BY p.creado_en DESC LIMIT 100";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    Database::jsonResponse(['success' => true, 'pedidos' => $stmt->fetchAll()]);
}

// -----------------------------------------------------------------------------
// POST: CREAR NUEVO PEDIDO
// -----------------------------------------------------------------------------
if ($method === 'POST') {
    $data = Database::getJsonInput();

    if (empty($data['comercio_id']) || empty($data['items']) || empty($data['destino_direccion'])) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'Faltan datos obligatorios del pedido'], 400);
    }

    // Verificar si el comercio está activo y en horario
    $stmtStore = $pdo->prepare("SELECT id, activo, abierto_manual, hora_apertura, hora_cierre FROM comercios WHERE id = :id");
    $stmtStore->execute(['id' => $data['comercio_id']]);
    $store = $stmtStore->fetch();

    if (!$store || !$store['activo'] || !$store['abierto_manual']) {
        Database::jsonResponse(['error' => true, 'mensaje' => 'El comercio seleccionado se encuentra fuera de servicio en este momento'], 400);
    }

    $newId = 'ped-' . strtoupper(substr(uniqid(), -6));
    $codigoSeguimiento = 'VXY-' . rand(100000, 999999);
    $tasaBcv = 68.50;
    $subtotal = (float)$data['monto_subtotal_usd'];
    $envio = (float)($data['costo_envio_usd'] ?? 2.50);
    $totalUsd = $subtotal + $envio;
    $totalBs = $totalUsd * $tasaBcv;

    $stmt = $pdo->prepare("
        INSERT INTO pedidos (
            id, codigo_seguimiento, cliente_id, comercio_id, estado,
            monto_subtotal_usd, costo_envio_usd, tasa_bcv_bs, monto_total_usd, monto_total_bs,
            metodo_pago, referencia_pago, destino_direccion
        ) VALUES (
            :id, :code, :client, :store, 'solicitud_enviada',
            :sub, :env, :bcv, :tot_usd, :tot_bs,
            :metodo, :ref, :destino
        )
    ");

    $stmt->execute([
        'id' => $newId,
        'code' => $codigoSeguimiento,
        'client' => $data['cliente_id'] ?? 'cli-anonimo',
        'store' => $data['comercio_id'],
        'sub' => $subtotal,
        'env' => $envio,
        'bcv' => $tasaBcv,
        'tot_usd' => $totalUsd,
        'tot_bs' => $totalBs,
        'metodo' => $data['metodo_pago'] ?? 'pago_movil',
        'ref' => $data['referencia_pago'] ?? null,
        'destino' => $data['destino_direccion']
    ]);

    // Insertar items
    $stmtItem = $pdo->prepare("INSERT INTO pedidos_items (id, pedido_id, producto_id, nombre_item, cantidad, precio_unitario_usd, subtotal_usd) VALUES (:id, :pid, :prod_id, :nombre, :cant, :punit, :sub)");
    foreach ($data['items'] as $it) {
        $stmtItem->execute([
            'id' => 'item-' . uniqid(),
            'pid' => $newId,
            'prod_id' => $it['producto_id'] ?? null,
            'nombre' => $it['nombre'],
            'cant' => $it['cantidad'],
            'punit' => $it['precio_unitario_usd'],
            'sub' => $it['cantidad'] * $it['precio_unitario_usd']
        ]);
    }

    Database::jsonResponse([
        'success' => true,
        'mensaje' => 'Pedido creado exitosamente',
        'pedido_id' => $newId,
        'codigo_seguimiento' => $codigoSeguimiento,
        'total_usd' => $totalUsd,
        'total_bs' => $totalBs
    ], 201);
}

// -----------------------------------------------------------------------------
// PUT: CAMBIO DE ESTADO O CIERRE CON CALIFICACIONES
// -----------------------------------------------------------------------------
if ($method === 'PUT' && $id) {
    $data = Database::getJsonInput();

    // Caso A: Cierre limpio de petición con calificaciones
    if ($action === 'calificar_y_cerrar') {
        $ratingComercio = (int)($data['rating_comercio'] ?? 5);
        $ratingConductor = (int)($data['rating_conductor'] ?? 5);
        $comentario = $data['comentarios'] ?? '';

        // Actualizar estado del pedido a cerrado_calificado
        $stmtPed = $pdo->prepare("UPDATE pedidos SET estado = 'cerrado_calificado', cerrado_en = NOW() WHERE id = :id");
        $stmtPed->execute(['id' => $id]);

        // Guardar calificaciones en confirmaciones_entrega
        $stmtConf = $pdo->prepare("
            UPDATE confirmaciones_entrega 
            SET calificado = 1, 
                rating_comercio = :rc, 
                rating_conductor = :rd, 
                comentario_cliente = :com,
                peticion_cerrada = 1, 
                cerrada_en = NOW() 
            WHERE pedido_id = :id
        ");
        $stmtConf->execute([
            'rc' => $ratingComercio,
            'rd' => $ratingConductor,
            'com' => $comentario,
            'id' => $id
        ]);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => 'Petición cerrada y calificada con éxito. ¡Gracias por usar Vixy!'
        ]);
    }

    // Caso B: Actualizar estado de ciclo de vida
    $nuevoEstado = $data['estado'] ?? null;
    $conductorId = $data['conductor_id'] ?? null;

    if ($nuevoEstado) {
        $fields = ["estado = :est"];
        $params = ['est' => $nuevoEstado, 'id' => $id];

        if ($conductorId) {
            $fields[] = "conductor_id = :cid";
            $params['cid'] = $conductorId;
        }

        if ($nuevoEstado === 'entregado') {
            $fields[] = "entregado_en = NOW()";
        }

        $sql = "UPDATE pedidos SET " . implode(', ', $fields) . " WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        Database::jsonResponse([
            'success' => true,
            'mensaje' => "Pedido actualizado a estado: {$nuevoEstado}"
        ]);
    }
}

Database::jsonResponse(['error' => true, 'mensaje' => 'Acción o método no soportado'], 405);
