param([string].\snapshots\20251113-041313\snapshot.sql)

. ./config.ps1

Write-Host "Restaurando: .\snapshots\20251113-041313\snapshot.sql"

psql --host db.ahlqzzkxuutwoepirpzr.supabase.co --port 5432 --username postgres --dbname postgres -f .\snapshots\20251113-041313\snapshot.sql

Write-Host "Restauração concluída."
