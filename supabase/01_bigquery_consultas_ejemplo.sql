-- Consultas SQL para la tabla FSTAF00-1000 en BigQuery
-- Proyecto: dataton25-prayfordata
-- Dataset: prod
-- Tabla: FSTAF00-1000

-- 1. Consulta básica para obtener todos los datos
SELECT 
  ESFECR,
  ESFECS,
  ESTARI,
  ESBEBE,
  ESADUL,
  ESMENO,
  ESDIAS,
  ESHORI,
  ESHORF,
  ESBUQE,
  ESORIG,
  ESDEST,
  ESBONI,
  ESIMPT
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
LIMIT 100;

-- 2. Obtener puertos únicos (orígenes y destinos)
SELECT DISTINCT
  ESORIG as puerto,
  'ORIGEN' as tipo
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESORIG IS NOT NULL

UNION ALL

SELECT DISTINCT
  ESDEST as puerto,
  'DESTINO' as tipo
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESDEST IS NOT NULL

ORDER BY puerto;

-- 3. Obtener tarifas únicas con precios promedio
SELECT DISTINCT
  ESTARI as tarifa,
  COUNT(*) as frecuencia,
  AVG(ESIMPT) as precio_promedio,
  MIN(ESIMPT) as precio_minimo,
  MAX(ESIMPT) as precio_maximo
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESTARI IS NOT NULL
GROUP BY ESTARI
ORDER BY frecuencia DESC;

-- 4. Obtener embarcaciones únicas
SELECT DISTINCT
  ESBUQE as embarcacion,
  COUNT(*) as frecuencia,
  AVG(ESIMPT) as precio_promedio
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESBUQE IS NOT NULL
GROUP BY ESBUQE
ORDER BY frecuencia DESC;

-- 5. Obtener rutas más populares
SELECT 
  CONCAT(ESORIG, ' → ', ESDEST) as ruta,
  COUNT(*) as frecuencia,
  AVG(ESIMPT) as precio_promedio,
  MIN(ESIMPT) as precio_minimo,
  MAX(ESIMPT) as precio_maximo
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESORIG IS NOT NULL AND ESDEST IS NOT NULL
GROUP BY ESORIG, ESDEST
ORDER BY frecuencia DESC
LIMIT 20;

-- 6. Estadísticas generales de la tabla
SELECT 
  COUNT(*) as total_registros,
  COUNT(DISTINCT ESORIG) as puertos_origen_unicos,
  COUNT(DISTINCT ESDEST) as puertos_destino_unicos,
  COUNT(DISTINCT ESTARI) as tarifas_unicas,
  COUNT(DISTINCT ESBUQE) as embarcaciones_unicas,
  MIN(ESFECS) as fecha_mas_antigua,
  MAX(ESFECS) as fecha_mas_reciente,
  AVG(ESIMPT) as precio_promedio,
  MIN(ESIMPT) as precio_minimo,
  MAX(ESIMPT) as precio_maximo
FROM `dataton25-prayfordata.prod.FSTAF00-1000`;

-- 7. Análisis por día de la semana
SELECT 
  ESDIAS as dia_semana,
  COUNT(*) as frecuencia,
  AVG(ESIMPT) as precio_promedio
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESDIAS IS NOT NULL
GROUP BY ESDIAS
ORDER BY frecuencia DESC;

-- 8. Análisis por hora del día
SELECT 
  ESHORI as hora_inicio,
  COUNT(*) as frecuencia,
  AVG(ESIMPT) as precio_promedio
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESHORI IS NOT NULL
GROUP BY ESHORI
ORDER BY ESHORI;

-- 9. Filtro por ruta específica (ejemplo: Dénia → Ibiza)
SELECT 
  ESFECS,
  ESTARI,
  ESIMPT,
  ESBUQE,
  ESDIAS,
  ESHORI,
  ESHORF
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESORIG = 'DENIA' AND ESDEST = 'IBIZA'
ORDER BY ESFECS DESC
LIMIT 50;

-- 10. Filtro por tarifa específica
SELECT 
  ESORIG,
  ESDEST,
  ESFECS,
  ESIMPT,
  ESBUQE,
  ESDIAS
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESTARI = 'BASIC'
ORDER BY ESFECS DESC
LIMIT 50;

-- 11. Filtro por embarcación específica
SELECT 
  ESORIG,
  ESDEST,
  ESFECS,
  ESTARI,
  ESIMPT,
  ESDIAS,
  ESHORI,
  ESHORF
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESBUQE = 'HYPATIA_DE_ALEJANDRIA'
ORDER BY ESFECS DESC
LIMIT 50;

-- 12. Análisis de precios por ruta y tarifa
SELECT 
  CONCAT(ESORIG, ' → ', ESDEST) as ruta,
  ESTARI as tarifa,
  COUNT(*) as frecuencia,
  AVG(ESIMPT) as precio_promedio,
  MIN(ESIMPT) as precio_minimo,
  MAX(ESIMPT) as precio_maximo,
  STDDEV(ESIMPT) as desviacion_estandar
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESORIG IS NOT NULL AND ESDEST IS NOT NULL AND ESTARI IS NOT NULL
GROUP BY ESORIG, ESDEST, ESTARI
ORDER BY ruta, frecuencia DESC;

-- 13. Top 10 rutas más caras
SELECT 
  CONCAT(ESORIG, ' → ', ESDEST) as ruta,
  ESTARI as tarifa,
  ESIMPT as precio,
  ESFECS as fecha_salida,
  ESBUQE as embarcacion
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
ORDER BY ESIMPT DESC
LIMIT 10;

-- 14. Análisis temporal (últimos 30 días)
SELECT 
  DATE(ESFECS) as fecha,
  COUNT(*) as viajes,
  AVG(ESIMPT) as precio_promedio,
  SUM(ESIMPT) as ingresos_totales
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESFECS >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
GROUP BY DATE(ESFECS)
ORDER BY fecha DESC;
