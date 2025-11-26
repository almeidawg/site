@echo off
REM =============================================
REM Script SIMPLIFICADO - Aplicar Migrations
REM =============================================
echo.
echo ========================================
echo   APLICAR MIGRATIONS - GANTT CHART
echo ========================================
echo.

REM Navegar para pasta do Supabase
cd /d "%~dp0Supabase"

echo [INFO] Aplicando migrations via db reset...
echo.
call supabase db reset

if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao aplicar migrations!
    echo.
    echo SOLUCOES:
    echo 1. Certifique-se que Docker Desktop esta rodando
    echo 2. Execute: supabase start
    echo 3. Aguarde containers iniciarem
    echo 4. Rode este script novamente
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   MIGRATIONS APLICADAS COM SUCESSO!
echo ========================================
echo.
echo Migrations aplicadas:
echo  [1] cobrancas com centro_custo_id
echo  [2] entities com centro_custo_padrao_id
echo  [3] alertas_pagamento (tabela)
echo  [4] tasks com campos Gantt
echo  [5] task_comments (tabela)
echo  [6] api_sync_cobranca_titulo
echo  [7] api_lancar_cobranca_paga
echo  [8] api_gerar_alertas_pagamento
echo  [9] api_get_alertas_pendentes
echo.
echo Proximos passos:
echo  1. Iniciar frontend: cd wg-crm ^&^& npm run dev
echo  2. Abrir: http://localhost:5173
echo  3. Testar Gantt Chart no modulo Cronograma
echo.
pause
