#!/usr/bin/env python3
"""
Script para corrigir migration: adicionar IF NOT EXISTS em CREATE INDEX
"""

from pathlib import Path

MIGRATION_FILE = "Supabase/supabase/migrations/20251124000000_criar_modulo_cronograma.sql"

def fix_migration():
    """Adiciona IF NOT EXISTS em todos CREATE INDEX"""

    print("Corrigindo migration...")

    migration_path = Path(MIGRATION_FILE)
    if not migration_path.exists():
        print(f"[ERRO] Arquivo nao encontrado: {MIGRATION_FILE}")
        return False

    with open(migration_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Substituir CREATE INDEX por CREATE INDEX IF NOT EXISTS
    # Mas apenas se ainda nao tiver IF NOT EXISTS
    lines = content.split("\n")
    fixed_lines = []

    for line in lines:
        if line.strip().startswith("CREATE INDEX ") and "IF NOT EXISTS" not in line:
            # Adicionar IF NOT EXISTS
            line = line.replace("CREATE INDEX ", "CREATE INDEX IF NOT EXISTS ")
            print(f"[FIX] {line.strip()[:80]}...")
        fixed_lines.append(line)

    fixed_content = "\n".join(fixed_lines)

    # Salvar
    with open(migration_path, "w", encoding="utf-8") as f:
        f.write(fixed_content)

    print(f"\n[OK] Migration corrigida!")
    print(f"[OK] Total de linhas: {len(fixed_lines)}")

    return True

if __name__ == "__main__":
    try:
        success = fix_migration()
        exit(0 if success else 1)
    except Exception as e:
        print(f"[ERRO]: {str(e)}")
        exit(1)

