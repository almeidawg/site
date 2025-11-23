#!/bin/bash
# =============================================
# Script para PARAR Supabase LOCAL + Edge Functions
# =============================================
# Uso: ./stop-supabase-full.sh
# =============================================

set -e

echo "🛑 Parando Edge Functions..."
pkill -f "supabase functions serve" 2>/dev/null || echo "  ℹ️  Nenhuma Edge Function rodando"

echo ""
echo "🛑 Parando Supabase LOCAL..."
cd "/Users/valdair/Documents/Projetos/William WG"
supabase stop

echo ""
echo "✅ Tudo parado!"
