@echo off
echo Uncle1bo Static Website - Local Development Server
echo =============================================
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 使用Python启动HTTP服务器...
    echo 访问地址: http://localhost:8000
    echo 按Ctrl+C停止服务器
    echo.
    python -m http.server
    goto :eof
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 检查http-server是否安装...
    npm list -g http-server >nul 2>&1
    if %ERRORLEVEL% NEQ 0 (
        echo 安装http-server...
        npm install -g http-server
    )
    echo 使用http-server启动HTTP服务器...
    echo 访问地址: http://localhost:8080
    echo 按Ctrl+C停止服务器
    echo.
    http-server
    goto :eof
)

echo 未检测到Python或Node.js，无法启动本地服务器。
echo 请安装Python或Node.js后重试，或者直接在浏览器中打开index.html文件。
echo.
pause