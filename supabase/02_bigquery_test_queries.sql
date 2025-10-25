-- Prueba de conexión con BigQuery
-- Este archivo contiene consultas SQL para probar la conexión con BigQuery

-- 1. Consulta básica para verificar que la tabla existe y tiene datos
SELECT 
  COUNT(*) as total_records,
  MIN(ESFECS) as min_date,
  MAX(ESFECS) as max_date,
  AVG(ESIMPT) as avg_price
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
LIMIT 1;

-- 2. Consulta para obtener puertos únicos
SELECT DISTINCT ESORIG as port_id
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESORIG IS NOT NULL
ORDER BY ESORIG
LIMIT 10;

-- 3. Consulta para obtener tarifas únicas
SELECT DISTINCT ESTARI as tariff_id
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESTARI IS NOT NULL
ORDER BY ESTARI
LIMIT 10;

-- 4. Consulta para obtener embarcaciones únicas
SELECT DISTINCT ESBUQE as vessel_id
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESBUQE IS NOT NULL AND ESBUQE != ''
ORDER BY ESBUQE
LIMIT 10;

-- 5. Consulta para obtener rutas más populares
SELECT 
  ESORIG as origin,
  ESDEST as destination,
  COUNT(*) as frequency,
  AVG(ESIMPT) as avg_price
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESORIG IS NOT NULL AND ESDEST IS NOT NULL
GROUP BY ESORIG, ESDEST
ORDER BY frequency DESC
LIMIT 10;

-- 6. Consulta para obtener datos de una ruta específica (ejemplo: DENIA-IBIZA)
SELECT 
  ESFECS as departure_date,
  ESIMPT as price,
  ESADUL as adults,
  ESMENO as children,
  ESBEBE as babies,
  ESTARI as tariff,
  ESBUQE as vessel
FROM `dataton25-prayfordata.prod.FSTAF00-1000`
WHERE ESORIG = 'DENIA' AND ESDEST = 'IBIZA'
ORDER BY ESFECS DESC
LIMIT 20;
