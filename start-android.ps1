# PAUSELIGHT Android 启动脚本
# 自动设置 Android SDK 环境变量并启动 Expo

Write-Host "正在设置 Android SDK 环境变量..." -ForegroundColor Cyan

# 设置 ANDROID_HOME
$env:ANDROID_HOME = "D:\Android\Sdk"
Write-Host "ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green

# 设置 PATH
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\tools;$env:ANDROID_HOME\tools\bin;$env:PATH"

# 验证 adb 是否可用
Write-Host "`n检查 ADB 工具..." -ForegroundColor Cyan
try {
    $adbVersion = & adb version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ ADB 已就绪" -ForegroundColor Green
    } else {
        Write-Host "✗ ADB 不可用" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "✗ 无法运行 ADB 命令" -ForegroundColor Red
    exit 1
}

# 检查 Android 设备
Write-Host "`n检查 Android 设备..." -ForegroundColor Cyan
$devices = & adb devices
Write-Host $devices

# 启动 Expo
Write-Host "`n正在启动 Expo..." -ForegroundColor Cyan
npm start
