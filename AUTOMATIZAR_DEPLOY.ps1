# ============================================
# WGEasy CRM - Script de Automação Parcial
# Data: 2025-11-24
# ============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   WGEasy CRM - Automação de Deploy" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navegar para diretório do projeto
cd "C:\Users\Atendimento\Documents\wgeasy\01 . WGeasy Sistema"

# 1. VERIFICAR GIT
Write-Host "✅ 1. Verificando Git Status..." -ForegroundColor Green
Write-Host ""
git status --short
Write-Host ""
Write-Host "Último commit:" -ForegroundColor Yellow
git log -1 --oneline
Write-Host ""

# 2. VERIFICAR ARQUIVOS IMPORTANTES
Write-Host "✅ 2. Verificando arquivos importantes..." -ForegroundColor Green
Write-Host ""

$files = @(
    @{Path="Supabase\supabase\migrations\20251124000000_criar_modulo_cronograma.sql"; Name="Migration Cronograma"},
    @{Path="create_master_user.sql"; Name="Script Usuário Master"},
    @{Path="wg-crm\vercel.json"; Name="Config Vercel"},
    @{Path="INDICE_DOCUMENTACAO.md"; Name="Índice Documentação"},
    @{Path="ACOES_PENDENTES.md"; Name="Ações Pendentes"},
    @{Path="APLICAR_MIGRATION_CRONOGRAMA.md"; Name="Guia Migration"},
    @{Path="ARQUITETURA_MODULOS_INTEGRADOS.md"; Name="Arquitetura Completa"}
)

$allFilesExist = $true
foreach ($file in $files) {
    if (Test-Path $file.Path) {
        Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $($file.Name) - NÃO ENCONTRADO!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

Write-Host ""

if (-not $allFilesExist) {
    Write-Host "⚠️  ATENÇÃO: Alguns arquivos não foram encontrados!" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Deseja continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        exit
    }
}

# 3. MOSTRAR STATUS DAS AÇÕES
Write-Host "📋 3. Status das Ações Pendentes..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  ⏳ Ação 1: Aplicar Migration no LIVE" -ForegroundColor Yellow
Write-Host "     Tempo: 5 minutos"
Write-Host "     Arquivo: Supabase\supabase\migrations\20251124000000_criar_modulo_cronograma.sql"
Write-Host "     URL: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new"
Write-Host ""
Write-Host "  ⏳ Ação 2: Criar Usuário Master" -ForegroundColor Yellow
Write-Host "     Tempo: 2 minutos"
Write-Host "     Arquivo: create_master_user.sql"
Write-Host "     Credenciais: william@wgalmeida.com.br / 130300@`$Wg"
Write-Host ""
Write-Host "  ⏳ Ação 3: Deploy no Vercel" -ForegroundColor Yellow
Write-Host "     Tempo: 5 minutos"
Write-Host "     Repository: almeidawg/site"
Write-Host "     Root Directory: wg-crm"
Write-Host "     URL: https://vercel.com/new"
Write-Host ""

# 4. COPIAR MIGRATION PARA CLIPBOARD (se possível)
Write-Host "📋 4. Preparando Migration..." -ForegroundColor Green
Write-Host ""

$migrationPath = "Supabase\supabase\migrations\20251124000000_criar_modulo_cronograma.sql"
if (Test-Path $migrationPath) {
    $migrationContent = Get-Content $migrationPath -Raw
    Write-Host "  ✅ Migration carregada ($($migrationContent.Length) caracteres)" -ForegroundColor Green

    $copyToClipboard = Read-Host "  Deseja copiar Migration para clipboard? (s/n)"
    if ($copyToClipboard -eq "s") {
        Set-Clipboard -Value $migrationContent
        Write-Host "  ✅ Migration copiada para clipboard!" -ForegroundColor Green
        Write-Host "  👉 Agora cole no SQL Editor do Supabase" -ForegroundColor Cyan
    }
} else {
    Write-Host "  ❌ Arquivo de migration não encontrado!" -ForegroundColor Red
}

Write-Host ""

# 5. ABRIR URLS NO NAVEGADOR
Write-Host "🌐 5. Abrir URLs no navegador..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  URLs disponíveis:" -ForegroundColor Yellow
Write-Host "  [1] Supabase SQL Editor (aplicar migration)"
Write-Host "  [2] Supabase Dashboard (geral)"
Write-Host "  [3] Vercel New Project (deploy)"
Write-Host "  [4] GitHub Repository"
Write-Host "  [5] Abrir TODAS as URLs"
Write-Host "  [0] Pular esta etapa"
Write-Host ""

$choice = Read-Host "Escolha uma opção"

switch ($choice) {
    "1" {
        Start-Process "https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new"
        Write-Host "  ✅ Supabase SQL Editor aberto" -ForegroundColor Green
    }
    "2" {
        Start-Process "https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf"
        Write-Host "  ✅ Supabase Dashboard aberto" -ForegroundColor Green
    }
    "3" {
        Start-Process "https://vercel.com/new"
        Write-Host "  ✅ Vercel New Project aberto" -ForegroundColor Green
    }
    "4" {
        Start-Process "https://github.com/almeidawg/site"
        Write-Host "  ✅ GitHub Repository aberto" -ForegroundColor Green
    }
    "5" {
        Start-Process "https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new"
        Start-Sleep -Seconds 1
        Start-Process "https://vercel.com/new"
        Start-Sleep -Seconds 1
        Start-Process "https://github.com/almeidawg/site"
        Write-Host "  ✅ Todas as URLs abertas" -ForegroundColor Green
    }
    default {
        Write-Host "  ⏭️  URLs não abertas" -ForegroundColor Yellow
    }
}

Write-Host ""

# 6. RESUMO FINAL
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   ✅ AUTOMAÇÃO PARCIAL COMPLETA!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 RESUMO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  ✅ Git verificado" -ForegroundColor Green
Write-Host "  ✅ Arquivos verificados" -ForegroundColor Green
Write-Host "  ✅ Migration preparada" -ForegroundColor Green
Write-Host "  ✅ URLs prontas para acessar" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ PRÓXIMAS AÇÕES MANUAIS (12 minutos total):" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1️⃣  Aplicar Migration no LIVE (5 min)" -ForegroundColor Cyan
Write-Host "     - Abrir: https://supabase.com/dashboard/project/vyxscnevgeubfgfstmtf/sql/new"
Write-Host "     - Colar migration do clipboard (Ctrl+V)"
Write-Host "     - Clicar em RUN"
Write-Host "     - Guia: APLICAR_MIGRATION_CRONOGRAMA.md"
Write-Host ""
Write-Host "  2️⃣  Criar Usuário Master (2 min)" -ForegroundColor Cyan
Write-Host "     - Mesma URL do SQL Editor"
Write-Host "     - Copiar e colar create_master_user.sql"
Write-Host "     - Clicar em RUN"
Write-Host "     - Guia: INSTRUÇÕES_CRIAR_USUARIO_MASTER.md"
Write-Host ""
Write-Host "  3️⃣  Deploy no Vercel (5 min)" -ForegroundColor Cyan
Write-Host "     - Abrir: https://vercel.com/new"
Write-Host "     - Importar: almeidawg/site"
Write-Host "     - Root Directory: wg-crm"
Write-Host "     - Deploy"
Write-Host "     - Guia: DEPLOY_VERCEL.md"
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 CONSULTE:" -ForegroundColor Yellow
Write-Host "  - INDICE_DOCUMENTACAO.md (índice completo)"
Write-Host "  - ACOES_PENDENTES.md (checklist detalhado)"
Write-Host "  - AUTOMATIZAR_DEPLOY.md (explicação da automação)"
Write-Host ""
Write-Host "🎉 Boa sorte com o deploy!" -ForegroundColor Green
Write-Host ""

# Pausar para ler
Read-Host "Pressione Enter para sair"
