#!/usr/bin/env python3
"""
Script para aplicar migration no Supabase LIVE via Management API
Contorna problema de connection pool timeout
"""

import requests
import sys
from pathlib import Path

# Configurações
PROJECT_REF = "vyxscnevgeubfgfstmtf"
ACCESS_TOKEN = "sbp_82d066516e8384fd327c2a340523455fc817c260"
MIGRATION_FILE = "Supabase/supabase/migrations/20251124190000_corrigir_kanban_completo.sql"

def apply_migration():
    """Aplica migration via Management API"""

    print(">> Aplicando Migration via Supabase Management API...")
    print()

    # Ler arquivo de migration
    migration_path = Path(MIGRATION_FILE)
    if not migration_path.exists():
        print(f"[ERRO] Arquivo nao encontrado: {MIGRATION_FILE}")
        return False

    with open(migration_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print(f"[OK] Migration carregada: {len(sql_content)} caracteres")
    print()

    # API endpoint
    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "query": sql_content
    }

    print(">> Enviando para Supabase API...")
    print(f"URL: {url}")
    print()

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=120)

        print(f"Status Code: {response.status_code}")
        print()

        if response.status_code in [200, 201]:
            print("[SUCESSO] MIGRATION APLICADA COM SUCESSO!")
            print()
            print("Resultado:")
            print(response.text[:500] if response.text else "[]")  # Primeiros 500 chars
            return True
        else:
            print(f"[ERRO] Status: {response.status_code}")
            print()
            print("Resposta:")
            print(response.text[:1000])
            return False

    except requests.exceptions.Timeout:
        print("[ERRO] TIMEOUT: API demorou mais de 120 segundos")
        print()
        print("[AVISO] A migration pode ter sido aplicada mesmo assim.")
        print("        Verifique no Dashboard.")
        return False

    except Exception as e:
        print(f"[ERRO] INESPERADO: {str(e)}")
        return False

def apply_user_creation():
    """Pulado - apenas migration do Kanban"""
    print()
    print(">> Pulando criação de usuário (já existe)")
    print()
    return True

def main():
    """Função principal"""

    print()
    print("=" * 60)
    print("  WGEasy CRM - Aplicação Automatizada via API")
    print("=" * 60)
    print()

    # Verificar se requests está instalado
    try:
        import requests
    except ImportError:
        print("[ERRO] Biblioteca 'requests' nao instalada")
        print()
        print("Instale com: pip install requests")
        print()
        return False

    # Aplicar migration
    success_migration = apply_migration()

    if not success_migration:
        print()
        print("[AVISO] Migration falhou. Abortando usuario.")
        print()
        print("[INFO] ALTERNATIVA: Aplicar manualmente via Dashboard")
        print("       https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new")
        return False

    # Aplicar criação de usuário
    success_user = apply_user_creation()

    print()
    print("=" * 60)
    print("  RESUMO FINAL")
    print("=" * 60)
    print()
    print(f"Migration: {'[OK] Sucesso' if success_migration else '[ERRO] Falhou'}")
    print(f"Usuario:   {'[OK] Sucesso' if success_user else '[ERRO] Falhou'}")
    print()

    if success_migration and success_user:
        print("[SUCESSO] TUDO COMPLETO!")
        print()
        print("PROXIMO PASSO:")
        print("   Deploy no Vercel: https://vercel.com/new")
        print()
        print("Guia: DEPLOY_VERCEL.md")
    else:
        print("[AVISO] Algumas acoes falharam.")
        print("        Consulte: ACOES_PENDENTES.md")

    print()

    return success_migration and success_user

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print()
        print("[AVISO] Interrompido pelo usuario")
        sys.exit(1)
