@echo off
title TRAKIO Print Server - Brother QL-1100
color 0A

echo.
echo ============================================================
echo   TRAKIO Print Server - Brother QL-1100
echo ============================================================
echo.

:: Vérifier si Python est installé
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERREUR] Python n'est pas installe!
    echo.
    echo Telechargez Python depuis: https://python.org
    echo Cochez "Add Python to PATH" lors de l'installation!
    echo.
    pause
    exit
)

echo [OK] Python detecte
echo.

:: Vérifier/installer les dépendances
echo Installation des dependances...
pip install brother_ql Pillow flask flask-cors qrcode --quiet

echo.
echo [OK] Dependances installees
echo.
echo ============================================================
echo   Demarrage du serveur...
echo   URL: http://localhost:5555
echo ============================================================
echo.
echo   Gardez cette fenetre ouverte pour l'impression!
echo   Fermez-la pour arreter le serveur.
echo.
echo ============================================================
echo.

:: Lancer le serveur
python trakio_print_server.py

pause
