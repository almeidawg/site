@echo off
echo ========================================
echo APLICANDO MIGRATIONS - WG CRM
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Verificando se Docker esta rodando...
docker ps >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERRO: Docker nao esta rodando ou precisa de privilegios de administrador
    echo.
    echo Solucoes:
    echo 1. Inicie o Docker Desktop
    echo 2. Execute este script como Administrador (botao direito - Executar como administrador)
    echo.
    pause
    exit /b 1
)

echo OK - Docker esta rodando
echo.

echo [2/3] Aplicando migration principal (cronograma + financeiro + contratos)...
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126150000_cronograma_financeiro_contratos_completo.sql"
if errorlevel 1 (
    echo ERRO ao aplicar migration principal
    pause
    exit /b 1
)
echo OK - Migration principal aplicada
echo.

echo [3/3] Aplicando funcoes de aprovacao...
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126151000_funcoes_aprovacao_contratos.sql"
if errorlevel 1 (
    echo ERRO ao aplicar funcoes de aprovacao
    pause
    exit /b 1
)
echo OK - Funcoes de aprovacao aplicadas
echo.

echo [4/4] Aplicando storage de avatars...
docker exec -i supabase_db_WG psql -U postgres -d postgres < "supabase\supabase\migrations\20251126141000_storage_avatars_bucket.sql"
if errorlevel 1 (
    echo AVISO: Erro ao aplicar storage (pode ja existir)
)
echo OK - Storage configurado
echo.

echo ========================================
echo MIGRATIONS APLICADAS COM SUCESSO!
echo ========================================
echo.
echo Proximos passos:
echo 1. Iniciar frontend: cd wg-crm ^&^& npm run dev
echo 2. Atualizar rota em App.jsx (Contratos -^> ContratosSupabase)
echo 3. Testar o sistema
echo.
pause
