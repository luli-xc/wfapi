@echo off
cd /d "%~dp0"
echo ===== 存档并推送到 GitHub =====
echo.
git add .
git commit -m "自动存档 %date% %time%"
git push
echo.
echo ===== 完成！按任意键关闭 =====
pause