-- Consulta para obtener datos de ocupación de plazas
-- Archivo: 02_ocupacion_plazas.sql

-- Consulta principal para obtener ocupación por fecha
SELECT 
  DATE(ESFECS) as fecha,
  ESORIG as origen,
  ESDEST as destino,
  ESBUQUE as capacidad_total,
  COUNT(*) as plazas_vendidas,
  (ESBUQUE - COUNT(*)) as plazas_disponibles,
  ROUND((COUNT(*) * 100.0 / ESBUQUE), 2) as tasa_ocupacion
FROM `dataton25-prayfordata.balearia_pricing.pricing_data`
WHERE 
  ESORIG = 'denia'  -- Cambiar por el origen deseado
  AND ESDEST = 'ibiza'  -- Cambiar por el destino deseado
  AND DATE(ESFECS) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND DATE(ESFECS) <= DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY DATE(ESFECS), ESORIG, ESDEST, ESBUQUE
ORDER BY DATE(ESFECS);

-- Consulta alternativa con filtros más específicos
SELECT 
  DATE(ESFECS) as fecha,
  ESORIG as origen,
  ESDEST as destino,
  ESBUQUE as capacidad_total,
  COUNT(*) as plazas_vendidas,
  (ESBUQUE - COUNT(*)) as plazas_disponibles,
  ROUND((COUNT(*) * 100.0 / ESBUQUE), 2) as tasa_ocupacion,
  AVG(ESPREC) as precio_promedio
FROM `dataton25-prayfordata.balearia_pricing.pricing_data`
WHERE 
  ESORIG = 'denia'
  AND ESDEST = 'ibiza'
  AND DATE(ESFECS) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND DATE(ESFECS) <= DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
  AND ESBUQUE IS NOT NULL
  AND ESBUQUE > 0
GROUP BY DATE(ESFECS), ESORIG, ESDEST, ESBUQUE
ORDER BY DATE(ESFECS);

-- Consulta para obtener ocupación por tipo de servicio
SELECT 
  DATE(ESFECS) as fecha,
  ESORIG as origen,
  ESDEST as destino,
  ESGRPS as tipo_servicio,
  ESBUQUE as capacidad_total,
  COUNT(*) as plazas_vendidas,
  (ESBUQUE - COUNT(*)) as plazas_disponibles,
  ROUND((COUNT(*) * 100.0 / ESBUQUE), 2) as tasa_ocupacion
FROM `dataton25-prayfordata.balearia_pricing.pricing_data`
WHERE 
  ESORIG = 'denia'
  AND ESDEST = 'ibiza'
  AND DATE(ESFECS) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND DATE(ESFECS) <= DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
  AND ESGRPS IS NOT NULL
  AND ESBUQUE IS NOT NULL
  AND ESBUQUE > 0
GROUP BY DATE(ESFECS), ESORIG, ESDEST, ESGRPS, ESBUQUE
ORDER BY DATE(ESFECS), ESGRPS;

-- Consulta para obtener ocupación por hora del día
SELECT 
  DATE(ESFECS) as fecha,
  EXTRACT(HOUR FROM ESFECS) as hora,
  ESORIG as origen,
  ESDEST as destino,
  ESBUQUE as capacidad_total,
  COUNT(*) as plazas_vendidas,
  (ESBUQUE - COUNT(*)) as plazas_disponibles,
  ROUND((COUNT(*) * 100.0 / ESBUQUE), 2) as tasa_ocupacion
FROM `dataton25-prayfordata.balearia_pricing.pricing_data`
WHERE 
  ESORIG = 'denia'
  AND ESDEST = 'ibiza'
  AND DATE(ESFECS) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
  AND DATE(ESFECS) <= DATE_ADD(CURRENT_DATE(), INTERVAL 7 DAY)
  AND ESBUQUE IS NOT NULL
  AND ESBUQUE > 0
GROUP BY DATE(ESFECS), EXTRACT(HOUR FROM ESFECS), ESORIG, ESDEST, ESBUQUE
ORDER BY DATE(ESFECS), EXTRACT(HOUR FROM ESFECS);
