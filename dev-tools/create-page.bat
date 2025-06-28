@echo off
setlocal

REM 设置变量
set NODE_PATH=%~dp0
set SCRIPT_PATH=%~dp0server-page-generator.js

REM 检查参数
if "%~1"=="" (
    echo 用法: create-page.bat ^<Markdown文件路径^> ^<页面名称^> [添加到导航栏(true/false)]
    exit /b 1
)

if "%~2"=="" (
    echo 用法: create-page.bat ^<Markdown文件路径^> ^<页面名称^> [添加到导航栏(true/false)]
    exit /b 1
)

REM 设置参数
set MARKDOWN_FILE=%~1
set PAGE_NAME=%~2
set ADD_TO_NAV=%~3

if "%ADD_TO_NAV%"=="" set ADD_TO_NAV=true

REM 检查Markdown文件是否存在
if not exist "%MARKDOWN_FILE%" (
    echo 错误: Markdown文件 "%MARKDOWN_FILE%" 不存在
    exit /b 1
)

REM 检查Node.js是否安装
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo 错误: 未找到Node.js，请安装Node.js后再试
    exit /b 1
)

REM 运行页面生成脚本
echo 正在创建页面 "%PAGE_NAME%"...
node "%SCRIPT_PATH%" create "%MARKDOWN_FILE%" "%PAGE_NAME%" %ADD_TO_NAV%

if %ERRORLEVEL% neq 0 (
    echo 页面创建失败
    exit /b 1
)

echo 页面创建成功！
exit /b 0