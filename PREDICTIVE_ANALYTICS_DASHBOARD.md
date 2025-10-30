# Dashboard de Análisis Predictivo

## Descripción General

El Dashboard de Análisis Predictivo proporciona una suite completa de visualizaciones para analizar las predicciones de ingresos del modelo, las simulaciones Monte Carlo, y compararlas con los datos reales.

## Acceso

El dashboard está disponible en la ruta `/analytics` de la aplicación.

```
http://localhost:5173/analytics
```

## Componentes del Dashboard

### 1. **Serie Temporal con Bandas de Confianza** 📈

**Tipo:** Gráfico de líneas con área sombreada

**Características:**
- **Línea azul sólida**: Predicción del modelo (ingreso_predicho)
- **Línea verde discontinua**: Promedio Monte Carlo (ingreso_mc_promedio)
- **Línea morada con puntos**: Ingresos reales (cuando existen)
- **Área azul sombreada**: Banda de confianza del 80% (P10-P90)

**Interpretación:**
- Si el ingreso real cae dentro del área sombreada, el modelo está funcionando correctamente
- Un área sombreada amplia indica mayor incertidumbre en las predicciones
- La convergencia entre la predicción y el promedio MC indica consistencia del modelo

**Tooltip Interactivo:**
- Fecha completa
- Valores de predicción, Monte Carlo promedio y real
- Rango P10-P90 y amplitud del intervalo

---

### 2. **Precisión del Modelo: Predicción vs Realidad** 🎯

**Tipo:** Gráfico de dispersión (scatter plot)

**Características:**
- **Eje X**: Ingreso Predicho
- **Eje Y**: Ingreso Real
- **Línea diagonal gris**: Predicción perfecta (45°)
- **Puntos verdes**: Sobreestimación (predicción > realidad)
- **Puntos rojos**: Subestimación (predicción < realidad)

**Métricas Calculadas:**
- **MAE (Mean Absolute Error)**: Error absoluto medio en euros
- **MAPE (Mean Absolute Percentage Error)**: Error porcentual medio

**Interpretación:**
- Puntos cercanos a la línea diagonal = Alta precisión
- Puntos dispersos = Baja precisión del modelo
- Más puntos verdes = Tendencia a sobreestimar
- Más puntos rojos = Tendencia a subestimar

---

### 3. **Comparación Mensual/Semanal** 📊

**Tipo:** Gráfico de barras agrupadas

**Características:**
- **Botones de alternancia**: Cambiar entre vista semanal y mensual
- **Barras azules**: Predicción del modelo
- **Barras verdes**: Promedio Monte Carlo
- **Barras moradas**: Ingresos reales (cuando existen)

**Métricas Resumen:**
- Períodos analizados
- Total de registros
- Cantidad con datos reales
- Predicciones pendientes

**Interpretación:**
- Identificar períodos con mayor o menor precisión
- Detectar tendencias estacionales
- Comparar volúmenes entre diferentes períodos

---

### 4. **Distribución de Incertidumbre por Segmento** 📦

**Tipo:** Box plot (representado con barras y error bars)

**Características:**
- **Botones de segmentación**: Por Mes, Por Día de Semana, Por Ruta
- **Colores de barras**:
  - 🟢 Verde: Baja incertidumbre (rango P10-P90 pequeño)
  - 🟠 Naranja: Media incertidumbre
  - 🔴 Rojo: Alta incertidumbre (rango P10-P90 amplio)
- **Líneas verticales**: Representan el rango P10-P90

**Interpretación:**
- Identificar qué segmentos son más predecibles (verde)
- Detectar períodos o rutas con alta variabilidad (rojo)
- La altura de la barra muestra la mediana de ingresos
- Las líneas verticales muestran el rango de confianza

---

## Filtros Disponibles

### **Ruta**
Selecciona una ruta específica o "Todas las rutas" para análisis global.

### **Fecha Desde / Fecha Hasta**
Define el rango temporal del análisis.

### **Límite de Registros**
Opciones: 50, 100, 200, 500, 1000 registros.

---

## Métricas Principales

En la parte superior del dashboard se muestran 4 métricas clave:

1. **Total Registros**: Cantidad de predicciones en el período seleccionado
2. **Con Datos Reales**: Cantidad de predicciones que ya tienen ingreso real asociado
3. **Rutas Analizadas**: Número de rutas únicas en el dataset
4. **Ingreso Promedio Predicho**: Promedio de todos los ingresos predichos

---

## Funcionalidad de Exportación

### **Botón "Exportar Datos"** 📥

Exporta los datos filtrados a un archivo CSV con las siguientes columnas:
- Ruta
- Fecha
- Predicción
- Promedio MC
- P10
- P90
- Real

**Nombre del archivo:** `predictive-analytics-YYYY-MM-DD.csv`

---

## Casos de Uso

### **1. Evaluación de Precisión del Modelo**

1. Ir a la pestaña "Precisión"
2. Observar el scatter plot
3. Verificar métricas MAE y MAPE
4. Identificar patrones de error

### **2. Análisis de Tendencias Temporales**

1. Ir a la pestaña "Serie Temporal"
2. Observar la evolución de predicciones vs realidad
3. Identificar períodos con mayor/menor precisión
4. Verificar que los valores reales caigan en la banda P10-P90

### **3. Comparación de Períodos**

1. Ir a la pestaña "Comparación"
2. Alternar entre vista semanal y mensual
3. Identificar períodos de alto/bajo rendimiento
4. Detectar estacionalidad

### **4. Identificación de Rutas o Períodos Problemáticos**

1. Ir a la pestaña "Desviaciones"
2. Cambiar entre "Por Mes", "Por Día", "Por Ruta"
3. Identificar segmentos rojos (alta incertidumbre)
4. Aplicar filtros específicos para análisis detallado

---

## Ejemplo de Flujo de Trabajo

### **Análisis de una Ruta Específica**

1. **Seleccionar filtros:**
   - Ruta: "denia-ibiza-denia"
   - Fecha Desde: "2024-01-01"
   - Fecha Hasta: "2024-12-31"
   - Límite: 500

2. **Hacer clic en "Aplicar Filtros"**

3. **Analizar Serie Temporal:**
   - ¿Los valores reales caen dentro de la banda P10-P90?
   - ¿Hay períodos con mayor desviación?

4. **Revisar Precisión:**
   - ¿Qué tan concentrados están los puntos en la diagonal?
   - ¿Hay tendencia a sobre/subestimar?

5. **Comparar Períodos:**
   - ¿Qué meses tienen mejor precisión?
   - ¿Hay estacionalidad evidente?

6. **Verificar Incertidumbre:**
   - ¿Qué días de la semana son más predecibles?
   - ¿Hay meses con mayor variabilidad?

7. **Exportar datos** para análisis adicional en Excel/Python

---

## Requisitos Técnicos

### **Datos de BigQuery**

El dashboard consume datos de la tabla de predicciones Monte Carlo en BigQuery con los siguientes campos:

- `ruta`: String (ej: "denia-ibiza-denia")
- `salida_dt`: DateTime
- `ingreso_predicho`: Float
- `ingreso_mc_promedio`: Float
- `ingreso_mc_p10`: Float
- `ingreso_mc_p90`: Float
- `ingreso_real`: Float o NULL

### **Backend API**

Endpoint: `POST /api/bigquery/montecarlo`

Body:
```json
{
  "route": "denia-ibiza-denia",
  "dateFrom": "2024-01-01",
  "dateTo": "2024-12-31",
  "limit": 200
}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "ruta": "denia-ibiza-denia",
      "salida_dt": "2024-01-01T10:00:00Z",
      "ingreso_predicho": 15000,
      "ingreso_mc_promedio": 14800,
      "ingreso_mc_p10": 13000,
      "ingreso_mc_p90": 16500,
      "ingreso_real": 15200
    }
  ],
  "totalRows": 150
}
```

---

## Tecnologías Utilizadas

- **React 18**: Framework principal
- **Recharts 2.15**: Librería de gráficos
- **Tailwind CSS**: Estilos
- **Shadcn/ui**: Componentes UI
- **TanStack Query**: Gestión de datos
- **date-fns**: Manipulación de fechas

---

## Troubleshooting

### **No aparecen datos**

1. Verificar que el backend esté corriendo
2. Verificar la conexión a BigQuery
3. Revisar los filtros aplicados (puede que no haya datos en ese rango)
4. Verificar la consola del navegador para errores

### **Gráfico de Precisión vacío**

- Este gráfico solo muestra datos cuando existen ingresos reales
- Verificar que el dataset incluya registros con `ingreso_real !== null`

### **Errores de carga**

- Verificar que las variables de entorno estén configuradas
- Verificar credenciales de BigQuery
- Revisar logs del backend

---

## Próximas Mejoras

- [ ] Exportación a Excel con formato
- [ ] Comparación de múltiples rutas lado a lado
- [ ] Alertas automáticas cuando precisión < threshold
- [ ] Filtros adicionales (buque, tarifa)
- [ ] Vista de tabla con paginación
- [ ] Descarga de imágenes de los gráficos
- [ ] Análisis de correlación entre variables

---

## Contacto y Soporte

Para reportar bugs o solicitar nuevas funcionalidades, contactar al equipo de desarrollo.

**Última actualización:** Octubre 2025

