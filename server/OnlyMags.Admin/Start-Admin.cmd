@echo off
cd /d "%~dp0"
echo OnlyMAGS AD Console - http://localhost:5088
echo Keep this window open until all jobs have finished.
OnlyMags.Admin.exe --contentRoot "%~dp0."
pause
