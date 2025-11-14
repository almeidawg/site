# config.ps1
# Configuração de conexão com o banco do Supabase

$env:PGHOST     = "db.ahlqzzkxuutwoepirpzr.supabase.co"
$env:PGPORT     = "5432"
$env:PGDATABASE = "postgres"
$env:PGUSER     = "postgres"
$env:PGPASSWORD = "SUA_SENHA_DO_SUPABASE"   # <-- troque pela senha do projeto

function Invoke-SqlFile {
    param(
        [Parameter(Mandatory = $true)]
        [string]$FilePath
    )

    Write-Host "Executando SQL: $FilePath"
    psql -v ON_ERROR_STOP=1 -f $FilePath
}
