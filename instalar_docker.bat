@echo off
echo ========================================
echo INSTALADOR DOCKER DESKTOP - WG CRM
echo ========================================
echo.

echo [1/4] Verificando se Docker ja esta instalado...
where docker >nul 2>&1
if %errorlevel% == 0 (
    echo Docker ja esta instalado!
    echo.
    docker --version
    echo.
    echo Deseja iniciar o Docker Desktop? (S/N)
    set /p resposta=
    if /i "%resposta%"=="S" (
        echo Iniciando Docker Desktop...
        start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        echo.
        echo Aguarde 30-60 segundos ate o Docker iniciar completamente.
        echo Verifique o icone do Docker na bandeja do sistema.
    )
    pause
    exit /b 0
)

echo Docker nao encontrado. Iniciando instalacao...
echo.

echo [2/4] Baixando Docker Desktop...
echo Abrindo pagina de download do Docker Desktop...
echo.
start https://desktop.docker.com/win/main/amd64/Docker%%20Desktop%%20Installer.exe

echo.
echo ========================================
echo INSTRUCOES DE INSTALACAO
echo ========================================
echo.
echo 1. O navegador abriu a pagina de download
echo 2. O download deve iniciar automaticamente
echo 3. Aguarde o download completar (cerca de 500MB)
echo 4. Execute o instalador baixado (Docker Desktop Installer.exe)
echo 5. Siga o assistente de instalacao:
echo    - Aceite os termos
echo    - Use configuracoes padrao
echo    - Nao e necessario criar conta Docker
echo 6. Ao finalizar, o computador pode pedir para reiniciar
echo.
echo APOS INSTALAR E REINICIAR:
echo - Docker Desktop abrira automaticamente
echo - Aguarde ver "Engine running"
echo - Execute novamente este projeto
echo.
echo ========================================
echo.
pause
