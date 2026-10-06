@echo off
title OmniVoice AI - Desktop Virtual Mic Agent
echo ====================================================
echo  OmniVoice AI - Universal Desktop Virtual Mic Agent
echo ====================================================
echo.
echo Launching Python Virtual Mic Bridge...
echo Default: Hindi (hi) -> English (en)
echo.
python desktop_agent.py --source hi --target en
pause
