<# 
    Script: Reset-WGEasy.ps1
    Função: Executar o reset dos módulos Financeiro e Kanban do WGEasy
    via função RPC public.admin_reset_modulo no Supabase.
#>

Write-Host "=== Reset-WGEasy.ps1 iniciado ===" -ForegroundColor Cyan

param(
    [ValidateSet("financeiro", "kanban", "todos", "")]
    [string]$Modulo = ""
)

# ============================================
# Configurações do Supabase
# ============================================
$SUPABASE_URL = "https://ahlqzzkxuutwoepirpzr.supabase.co"

# ATENÇÃO: service_role – manter este script em ambiente seguro
$SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFobHF6emt4dXV0d29lcGlycHpyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDU3MTI0MywiZXhwIjoyMDc2MTQ3MjQzfQ.xWNEmZumCtyRdrIiotUIL41jlI168HyBgM4yHVDXPZo"

$RPC_ENDPOINT = "$SUPABASE_URL/rest/v1/rpc/admin_reset_modulo"

# ============================================
# Função para chamar o reset de um módulo
# ============================================
function Invoke-ResetModulo {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet("financeiro", "kanban")]
        [string]$NomeModulo
    )

    Write-Host ""
    Write-Host "====================================" -ForegroundColor DarkGray
    Write-Host "EXECUTANDO RESET DO MÓDULO: $NomeModulo" -ForegroundColor Yellow
    Write-Host "====================================" -ForegroundColor DarkGray
    Write-Host ""

    $payload = @{
        p_modulo = $NomeModulo
        p_escopo = "homologacao"
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Method Post `
            -Uri $RPC_ENDPOINT `
            -Body $payload `
            -ContentType "application/json" `
            -Headers @{
                "apikey" = $SERVICE_ROLE_KEY
                "Authorization" = "Bearer $SERVICE_ROLE_KEY"
            } -ErrorAction Stop

        Write-Host "✅ Sucesso ao resetar módulo '$NomeModulo'." -ForegroundColor Green
        Write-Host "Retorno da função:" -ForegroundColor Cyan
        $response | ConvertTo-Json -Depth 5
    }
    catch {
        Write-Host "❌ Erro ao resetar módulo '$NomeModulo'." -ForegroundColor Red
        Write-Host "Detalhes do erro:" -ForegroundColor Red
        $_.Exception.Message
        if ($_.ErrorDetails) {
            $_.ErrorDetails.Message
        }
    }
}

# ============================================
# Entrada do script
# ============================================

if ([string]::IsNullOrWhiteSpace($Modulo)) {
    Write-Host ""
    Write-Host "Digite o módulo que deseja resetar:" -ForegroundColor Cyan
    Write-Host "  - financeiro" -ForegroundColor Yellow
    Write-Host "  - kanban" -ForegroundColor Yellow
    Write-Host "  - todos (para rodar ambos)" -ForegroundColor Yellow
    $Modulo = Read-Host "Módulo"
}

switch ($Modulo) {
    "financeiro" {
        Invoke-ResetModulo -NomeModulo "financeiro"
    }
    "kanban" {
        Invoke-ResetModulo -NomeModulo "kanban"
    }
    "todos" {
        Invoke-ResetModulo -NomeModulo "financeiro"
        Invoke-ResetModulo -NomeModulo "kanban"
    }
    Default {
        Write-Host "Valor inválido para parâmetro 'Modulo'. Use: financeiro, kanban ou todos." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Processo concluído." -ForegroundColor Green
