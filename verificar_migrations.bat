@echo off
echo ========================================
echo VERIFICANDO MIGRATIONS - WG CRM
echo ========================================
echo.

cd /d "%~dp0"

echo Verificando tabelas criadas...
echo.

docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\dt" | findstr "projects"
if errorlevel 1 (
    echo ERRO: Tabela projects nao encontrada
) else (
    echo OK - Tabela projects existe
)

docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\dt" | findstr "tasks"
if errorlevel 1 (
    echo ERRO: Tabela tasks nao encontrada
) else (
    echo OK - Tabela tasks existe
)

docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\dt" | findstr "cobrancas"
if errorlevel 1 (
    echo ERRO: Tabela cobrancas nao encontrada
) else (
    echo OK - Tabela cobrancas existe
)

echo.
echo Verificando funcoes criadas...
echo.

docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\df api_aprovar_contrato" | findstr "api_aprovar_contrato"
if errorlevel 1 (
    echo ERRO: Funcao api_aprovar_contrato nao encontrada
) else (
    echo OK - Funcao api_aprovar_contrato existe
)

docker exec -it supabase_db_WG psql -U postgres -d postgres -c "\df api_gerar_projeto_contrato" | findstr "api_gerar_projeto_contrato"
if errorlevel 1 (
    echo ERRO: Funcao api_gerar_projeto_contrato nao encontrada
) else (
    echo OK - Funcao api_gerar_projeto_contrato existe
)

echo.
echo Verificando bucket de avatars...
echo.

docker exec -it supabase_db_WG psql -U postgres -d postgres -c "SELECT id, name, public FROM storage.buckets WHERE id = 'avatars';"

echo.
echo ========================================
echo VERIFICACAO CONCLUIDA
echo ========================================
echo.
pause
