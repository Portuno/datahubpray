#!/bin/bash
# Script para preparar el deploy en Vercel

echo "🚀 Preparando deploy para Vercel..."

# Build del frontend
echo "📦 Building frontend..."
npm run build

# Build del backend
echo "📦 Building backend..."
cd backend
npm run build
cd ..

# Copiar dependencias del backend al directorio raíz
echo "📋 Copiando dependencias del backend..."
mkdir -p node_modules_backend
cp -r backend/node_modules/* node_modules_backend/ 2>/dev/null || true

echo "✅ Deploy preparado correctamente!"
echo "📁 Archivos generados:"
echo "   - Frontend: dist/"
echo "   - Backend: backend/dist/"
echo "   - API: api/index.js"
