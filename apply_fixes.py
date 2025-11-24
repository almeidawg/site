#!/usr/bin/env python3
"""Script para aplicar correções no banco Supabase"""

import psycopg2
import sys

# Configurações de conexão
DB_CONFIG = {
    'host': 'db.ahlqzzkxuutwoepirpzr.supabase.co',
    'port': 5432,
    'database': 'postgres',
    'user': 'postgres',
    'password': 'WG@2025supabase',
    'sslmode': 'require'
}

def main():
    print("Conectando ao Supabase...")

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        print("Lendo arquivo SQL...")
        with open('fix_supabase_schema.sql', 'r', encoding='utf-8') as f:
            sql = f.read()

        print("Executando SQL...")
        cur.execute(sql)
        conn.commit()

        print("\n✅ SQL executado com sucesso!")

        # Verificar resultado
        print("\nVerificando estruturas criadas:")
        cur.execute("""
            SELECT
              'Tabela' as tipo,
              table_name as nome
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name IN ('usuarios_perfis', 'user_profiles', 'propostas', 'storage_items', 'kanban_cards', 'kanban_colunas')
            UNION ALL
            SELECT
              'View' as tipo,
              table_name as nome
            FROM information_schema.views
            WHERE table_schema = 'public'
            AND table_name IN ('v_kanban_cards_board', 'v_clientes_ativos_contratos')
            ORDER BY tipo, nome;
        """)

        results = cur.fetchall()
        for row in results:
            print(f"  {row[0]}: {row[1]}")

        cur.close()
        conn.close()

        print("\n✅ Todas as correções aplicadas com sucesso!")

    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
