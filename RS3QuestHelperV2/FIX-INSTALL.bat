@echo off
title RS3 Quest Helper V2 — Fix Install
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0FIX-INSTALL.ps1"
pause
