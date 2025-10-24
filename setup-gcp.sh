#!/bin/bash

# Script de configuración para Google Cloud Datastore
# Ejecutar este script para configurar la autenticación

echo "🚀 Configurando Google Cloud Datastore para Balearia..."

# Verificar si gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI no está instalado."
    echo "📥 Instalando Google Cloud CLI..."
    
    # Detectar el sistema operativo
    if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "🪟 Sistema Windows detectado"
        echo "Por favor, descarga e instala Google Cloud CLI desde:"
        echo "https://cloud.google.com/sdk/docs/install"
        echo "Luego ejecuta este script nuevamente."
        exit 1
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "🍎 Sistema macOS detectado"
        if command -v brew &> /dev/null; then
            brew install --cask google-cloud-sdk
        else
            echo "Por favor, instala Homebrew primero o descarga Google Cloud CLI manualmente"
            exit 1
        fi
    else
        echo "🐧 Sistema Linux detectado"
        curl https://sdk.cloud.google.com | bash
        exec -l $SHELL
    fi
fi

echo "✅ Google Cloud CLI encontrado"

# Autenticarse
echo "🔐 Autenticándose con Google Cloud..."
gcloud auth login

# Configurar proyecto
echo "⚙️ Configurando proyecto..."
gcloud config set project dataton25-prayfordata

# Configurar credenciales por defecto
echo "🔑 Configurando credenciales por defecto..."
gcloud auth application-default login

# Verificar configuración
echo "🔍 Verificando configuración..."
echo "Proyecto actual: $(gcloud config get-value project)"
echo "Cuenta autenticada: $(gcloud config get-value account)"

# Verificar servicios habilitados
echo "📋 Verificando servicios habilitados..."
gcloud services list --enabled --filter="name:datastore.googleapis.com OR name:aiplatform.googleapis.com"

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cat > .env << EOF
# Google Cloud Configuration
VITE_GCP_PROJECT_ID=dataton25-prayfordata
VITE_DATASTORE_NAMESPACE=balearia-pricing
VITE_AI_PLATFORM_REGION=europe-west1
VITE_USE_MOCK_DATA=false
VITE_ENABLE_AI_PREDICTIONS=true

# Development Configuration
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug
EOF
    echo "✅ Archivo .env creado"
else
    echo "⚠️ Archivo .env ya existe, no se sobrescribió"
fi

echo ""
echo "🎉 ¡Configuración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verifica que el proyecto 'dataton25-prayfordata' tenga los permisos necesarios"
echo "2. Asegúrate de que los servicios Datastore y AI Platform estén habilitados"
echo "3. Si tienes modelos en AI Platform, configura VITE_AI_PLATFORM_MODEL_ENDPOINT en .env"
echo "4. Ejecuta 'npm run dev' para probar la conexión"
echo ""
echo "🔧 Comandos útiles:"
echo "- Verificar autenticación: gcloud auth list"
echo "- Verificar proyecto: gcloud config get-value project"
echo "- Listar servicios: gcloud services list --enabled"
echo "- Probar Datastore: gcloud datastore databases list"
