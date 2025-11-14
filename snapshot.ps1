# snapshot.ps1
# Cria um snapshot completo do banco (dump SQL) no Supabase

# Carrega config (variáveis de conexão)
. "$PSScriptRoot\config.ps1"

# Gera timestamp tipo 20251113-041313
$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'

# Monta pasta snapshots\<timestamp>
$folder = Join-Path $PSScriptRoot "snapshots\$timestamp"
New-Item -ItemType Directory -Path $folder -Force | Out-Null

# Arquivo de saída
$backupFile = Join-Path $folder 'snapshot.sql'

Write-Host "Criando snapshot em: $backupFile"

# Monta comando pg_dump em uma string
$pgDumpCommand = @"
pg_dump --host "$env:PGHOST" --port $env:PGPORT --username "$env:PGUSER" --dbname "$env:PGDATABASE" --file "$backupFile" --format=plain
"@

# Mostra o comando (opcional)
Write-Host $pgDumpCommand

# Executa o comando
Invoke-Expression $pgDumpCommand

Write-Host "Snapshot criado com sucesso!"
