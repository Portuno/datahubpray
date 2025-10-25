-- 01_occupancy_endpoint.sql
-- Endpoint de ocupación agregado al backend
-- Fecha: 2025-01-27
-- Descripción: Nuevo endpoint GET /api/occupancy para obtener datos de ocupación

-- MEJORA IMPLEMENTADA (2025-01-27):
-- - Sistema de cache temporal (5 minutos)
-- - Datos consistentes usando seed basado en fecha
-- - Evita regenerar datos constantemente
-- - Mejor rendimiento y experiencia de usuario

-- El endpoint genera datos simulados de ocupación con los siguientes parámetros:
-- - origin: Puerto de origen (opcional, default: 'denia')
-- - destination: Puerto de destino (opcional, default: 'ibiza') 
-- - serviceGroup: Grupo de servicio (opcional)
-- - dateFrom: Fecha desde (opcional)
-- - dateTo: Fecha hasta (opcional)
-- - limit: Número de registros a generar (opcional, default: 7)
-- - type: Tipo de datos (opcional)

-- Estructura de respuesta:
-- {
--   "success": true,
--   "data": [
--     {
--       "fecha": "2025-01-27",
--       "origen": "denia",
--       "destino": "ibiza", 
--       "capacidad_total": 150,
--       "plazas_vendidas": 120,
--       "plazas_disponibles": 30,
--       "tasa_ocupacion": 80.0,
--       "precio_promedio": 45.50
--     }
--   ],
--   "totalRows": 7,
--   "cached": true,
--   "cacheAge": 120
-- }

-- Ejemplos de uso:
-- GET /api/occupancy?origin=denia&destination=ibiza&limit=7
-- GET /api/occupancy?origin=valencia&destination=palma&limit=5

-- Características del sistema de cache:
-- - Cache válido por 5 minutos (300000 ms)
-- - Clave de cache: "origin-destination-limit"
-- - Datos consistentes usando fecha como seed
-- - Respuesta incluye información de cache (cached, cacheAge)

-- Nota: Los datos son simulados para desarrollo. 
-- Cuando se integren datos reales de BigQuery, este endpoint se actualizará.
