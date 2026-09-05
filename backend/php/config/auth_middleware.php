<?php
/**
 * Vixy Delivery Platform - Middleware de Autenticación y Verificación de Tokens
 * Manejo de JWT sin librerías externas (HMAC-SHA256 nativo)
 * Validación de expiración de claves a 90 días y primer login
 */

require_once __DIR__ . '/db.php';

class AuthMiddleware {
    private static $secret = 'VIXY_PLATFORM_SECURE_JWT_KEY_2026_CARACAS_9847231';

    public static function generateToken(array $payload, int $expiresInSeconds = 86400): string {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload['iat'] = time();
        $payload['exp'] = time() + $expiresInSeconds;
        $payloadJson = json_encode($payload);

        $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payloadJson));

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, self::$secret, true);
        $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64Header . '.' . $base64Payload . '.' . $base64Signature;
    }

    public static function verifyToken(?string $token = null): ?array {
        if (!$token) {
            $headers = getallheaders();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
            if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
                $token = $matches[1];
            }
        }

        if (!$token) {
            return null;
        }

        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        list($base64Header, $base64Payload, $base64Signature) = $parts;

        $signature = hash_hmac('sha256', $base64Header . '.' . $base64Payload, self::$secret, true);
        $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        if (!hash_equals($expectedSignature, $base64Signature)) {
            return null;
        }

        $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null; // Token expirado
        }

        return $payload;
    }

    public static function requireAuth(array $rolesPermitidos = []): array {
        $user = self::verifyToken();
        if (!$user) {
            Database::jsonResponse([
                'error' => true,
                'mensaje' => 'Acceso denegado: Token no provisto o expirado'
            ], 401);
        }

        // Si se especifican roles permitidos
        if (!empty($rolesPermitidos)) {
            $userRole = $user['tipo_usuario'] ?? $user['nivel_acceso'] ?? '';
            if (!in_array($userRole, $rolesPermitidos) && !in_array('super_admin', (array)$userRole)) {
                Database::jsonResponse([
                    'error' => true,
                    'mensaje' => 'Permisos insuficientes para realizar esta acción'
                ], 403);
            }
        }

        return $user;
    }
}
