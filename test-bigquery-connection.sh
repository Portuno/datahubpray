#!/bin/bash

# Script para probar la conexión con BigQuery
echo "🧪 Probando conexión con BigQuery..."

# Verificar que el backend esté corriendo
echo "📡 Verificando que el backend esté corriendo..."
if curl -s http://localhost:3001/api/bigquery/stats > /dev/null; then
    echo "✅ Backend está corriendo en puerto 3001"
else
    echo "❌ Backend no está corriendo. Iniciando..."
    cd backend && npm run dev &
    sleep 5
fi

# Probar endpoint de estadísticas
echo "📊 Probando endpoint de estadísticas..."
curl -s http://localhost:3001/api/bigquery/stats | jq '.'

# Probar endpoint de puertos
echo "🏝️ Probando endpoint de puertos..."
curl -s http://localhost:3001/api/bigquery/ports | jq '.'

# Probar endpoint de tarifas
echo "💰 Probando endpoint de tarifas..."
curl -s http://localhost:3001/api/bigquery/tariffs | jq '.'

# Probar endpoint de embarcaciones
echo "🚢 Probando endpoint de embarcaciones..."
curl -s http://localhost:3001/api/bigquery/vessels | jq '.'

# Probar endpoint de rutas
echo "🛣️ Probando endpoint de rutas..."
curl -s http://localhost:3001/api/bigquery/routes | jq '.'

# Probar endpoint de predicciones
echo "🔮 Probando endpoint de predicciones..."
curl -s -X POST http://localhost:3001/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "DENIA",
    "destination": "IBIZA", 
    "date": "2024-12-25",
    "travelType": "passenger",
    "tariffClass": "tourist",
    "model": "xgboost"
  }' | jq '.'

echo "✅ Pruebas completadas!"
