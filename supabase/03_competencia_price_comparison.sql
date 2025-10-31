-- Comparación de precios con competencia usando equivalencias correctas
-- Este query realiza el JOIN entre combined_query (Balearia) y query_competencia
-- usando las transformaciones definidas en la guía de equivalencias

WITH competencia_transformed AS (
  SELECT
    *,
    -- Transformación de residente: 'Si' → 'Residente', 'No' → 'No Residente'
    CASE WHEN residente = 'Si' THEN 'Residente' ELSE 'No Residente' END AS residente_transformado,
    -- Transformación de vehículo: 'No' → 0.0, 'car' → 1.0 (cualquier valor > 0)
    CASE WHEN vehiculo = 'No' THEN 0.0 ELSE 1.0 END AS vehiculo_transformado,
    -- Extraer código del buque después del guión: 'KERRY-KER' → 'KER'
    SPLIT(barco_trayecto, '-')[SAFE_OFFSET(ARRAY_LENGTH(SPLIT(barco_trayecto, '-')) - 1)] AS buque_transformado
  FROM tu_proyecto.tu_dataset.query_competencia
)
 
-- JOIN principal con equivalencias
SELECT 
  b.fecha_reserva,
  b.fecha_servicio,
  b.origen,
  b.destino,
  b.hora_inicio,
  b.hora_llegada,
  b.buque,
  b.tarifa,
  b.bonificacion AS bonificacion,
  b.clase_servicio,
  b.grupo_servicio,
  b.importe AS precio_balearia,
  c.precio_trayecto_sin_cpe AS precio_competencia,
  c.horas_trayecto AS horario_competencia,
  c.tipo_trayecto,
  c.vehiculo,
  c.residente,
  c.num_pax,
  c.barco_trayecto,
  c.asiento_trayecto,
  -- Calcular diferencia y porcentaje
  b.importe - c.precio_trayecto_sin_cpe AS diferencia_precio,
  ROUND(((b.importe - c.precio_trayecto_sin_cpe) / c.precio_trayecto_sin_cpe) * 100, 2) AS diferencia_porcentual
FROM tu_proyecto.tu_dataset.combined_query b
JOIN competencia_transformed c 
  ON DATE(b.fecha_servicio) = DATE(c.fecha_trayecto)
  AND DATE(b.fecha_reserva) = DATE(c.fecha_consulta)
  AND b.buque = c.buque_transformado
  AND b.bonificacion = c.residente_transformado
  AND (
    (b.metros_vehiculo = 0 AND c.vehiculo_transformado = 0.0) 
    OR 
    (b.metros_vehiculo > 0 AND c.vehiculo_transformado > 0.0)
  )
ORDER BY b.fecha_servicio DESC, b.hora_inicio
LIMIT 100;

-- NOTAS:
-- 1. Cobertura limitada: Solo devolverá coincidencias para buques compartidos (ABM, ALH, SCA, HDA, KER, MAR, MIS, RLL, VIS)
-- 2. El tipo de vehículo está simplificado a dos categorías (con/sin vehículo)
-- 3. Para mejor rendimiento, considera crear columnas calculadas previamente en lugar de usar funciones en JOIN
-- 4. Ajusta los nombres de proyecto y dataset según tu configuración
