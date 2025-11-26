#!/usr/bin/env python3
"""
Script para verificar schema da tabela kanban_cards no LIVE
"""

import requests

PROJECT_REF = "vyxscnevgeubfgfstmtf"
ACCESS_TOKEN = "sbp_82d066516e8384fd327c2a340523455fc817c260"

def check_schema():
    """Verifica schema da tabela kanban_cards"""

    print(">> Verificando schema de kanban_cards no LIVE...")
    print()

    # Query para verificar colunas de kanban_cards E kanban_colunas
    sql = """
    SELECT
        table_name,
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name IN ('kanban_cards', 'kanban_colunas', 'kanban_boards')
    ORDER BY table_name, ordinal_position;
    """

    url = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"

    headers = {
        "Authorization": f"Bearer {ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {"query": sql}

    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)

        if response.status_code in [200, 201]:
            result = response.json()
            if isinstance(result, list) and len(result) > 0:
                print("[OK] Estrutura das tabelas Kanban:")
                print()
                current_table = None
                for row in result:
                    if row['table_name'] != current_table:
                        current_table = row['table_name']
                        print(f"\n=== {current_table.upper()} ===")

                    nullable = "NULL" if row['is_nullable'] == 'YES' else "NOT NULL"
                    default = f"DEFAULT {row['column_default']}" if row['column_default'] else ""
                    print(f"  - {row['column_name']:25s} {row['data_type']:20s} {nullable:10s} {default}")
            else:
                print("[AVISO] Tabelas kanban não existem ou estão vazias")
            return True
        else:
            print(f"[ERRO] Status: {response.status_code}")
            print(response.text[:500])
            return False

    except Exception as e:
        print(f"[ERRO]: {str(e)}")
        return False

if __name__ == "__main__":
    check_schema()
