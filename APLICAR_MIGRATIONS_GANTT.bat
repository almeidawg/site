@echo off
REM =============================================
REM Script para aplicar migrations do Gantt
REM =============================================
echo.
echo ========================================
echo   APLICAR MIGRATIONS - GANTT CHART
echo ========================================
echo.

REM Verificar se Docker está rodando
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker nao esta rodando!
    echo.
    echo Por favor:
    echo 1. Abra o Docker Desktop
    echo 2. Aguarde inicializacao completa
    echo 3. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo [OK] Docker esta rodando!
echo.

REM Navegar para pasta do Supabase
cd /d "%~dp0Supabase"

echo [1/3] Parando Supabase...
call supabase stop

echo.
echo [2/3] Aplicando migrations (db reset)...
call supabase db reset

if errorlevel 1 (
    echo.
    echo [ERRO] Falha ao aplicar migrations!
    echo.
    pause
    exit /b 1
)

echo.
echo [3/3] Verificando status...
call supabase status

echo.
echo ========================================
echo   MIGRATIONS APLICADAS COM SUCESSO!
echo ========================================
echo.
echo Migrations aplicadas:
echo  - cobrancas com centro_custo_id
echo  - entities com centro_custo_padrao_id
echo  - alertas_pagamento (tabela)
echo  - tasks com campos Gantt
echo  - task_comments (tabela)
echo  - Funcoes SQL (sync, lancar, gerar alertas)
echo.
echo Agora voce pode:
echo  1. Iniciar o frontend: npm run dev
echo  2. Abrir: http://localhost:5173
echo  3. Testar Gantt Chart no modulo Cronograma
echo.
pause
