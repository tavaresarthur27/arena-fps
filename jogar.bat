@echo off
rem Abre o Arena FPS no navegador por um servidor local (abrindo o index.html direto, os modelos 3D não carregam).
rem Feche esta janela para desligar o servidor.
cd /d "%~dp0"
start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000/"
python -m http.server 8000
if errorlevel 1 (
  echo.
  echo Nao foi possivel iniciar o servidor. Verifique se o Python esta instalado
  echo ou se a porta 8000 ja esta em uso por outra janela do jogo.
  pause
)
