@echo off
echo 正在启动Uncle1bo静态站点工具集...

cd %~dp0

echo 安装依赖...
npm install

echo 启动服务...
npm run dev

pause