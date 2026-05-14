#!/bin/bash

# Script di build e preparazione per Altervista
# Uso: ./deploy.sh

set -e

echo "🎬 Film Recommender - Build e Deploy Script"
echo "==========================================="
echo ""

# Step 1: Install dependencies
echo "📦 Installazione dipendenze..."
npm install --quiet

# Step 2: Build
echo "🔨 Generazione build..."
npm run build --quiet

# Step 3: Verifica build
echo "✅ Build completata!"
echo ""
echo "📂 File pronti per l'upload in: ./dist/"
echo ""
echo "Contenuto build:"
du -sh dist/
echo ""
ls -lh dist/

echo ""
echo "🚀 Prossimi passaggi:"
echo "1. Accedi al File Manager di Altervista"
echo "2. Carica tutti i file da ./dist/ nella root del tuo dominio"
echo "3. Assicurati che .htaccess sia caricato"
echo "4. Visita il tuo dominio per testare"
echo ""
echo "Più info: consulta DEPLOYMENT.md"
