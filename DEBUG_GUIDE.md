# 调试指南

## Android SDK 错误说明

你看到的错误：
```
Failed to resolve the Android SDK path
Error: 'adb' 不是内部或外部命令
```

**这不是代码错误**，而是环境配置问题。这个错误**不影响 Web 和 iOS 运行**。

## 解决方案

### 方案 1：忽略错误（推荐用于 Web 开发）

如果你只需要在 **Web 浏览器**中测试应用：
- 直接按 `w` 键在浏览器中打开
- 或者访问终端显示的 URL（通常是 `http://localhost:8082`）
- Android SDK 错误可以忽略

### 方案 2：安装 Android SDK（如果需要 Android 测试）

如果你需要在 Android 设备或模拟器上测试：

1. **安装 Android Studio**
   - 下载：https://developer.android.com/studio
   - 安装时选择 "Android SDK"

2. **配置环境变量**
   ```powershell
   # Windows PowerShell
   [System.Environment]::SetEnvironmentVariable('ANDROID_HOME', 'C:\Users\你的用户名\AppData\Local\Android\Sdk', 'User')
   [System.Environment]::SetEnvironmentVariable('Path', $env:Path + ';C:\Users\你的用户名\AppData\Local\Android\Sdk\platform-tools', 'User')
   ```

3. **重启终端**，然后重新运行 `npm start`

## 当前应用状态

✅ **代码正常** - 所有文件已检查，无语法错误
✅ **Web 可用** - 可以在浏览器中正常运行
✅ **3个 Tab** - 暂停键、心象、灯塔都已实现
✅ **UI 优化** - 高级、轻简的设计已完成

## 测试应用

### 在 Web 浏览器中测试：

1. 在 Expo 终端中按 `w` 键
2. 或访问：`http://localhost:8082`（端口可能不同，看终端提示）

### 在手机上测试：

1. 安装 **Expo Go** 应用
2. 扫描终端中显示的二维码
3. 应用会在手机上加载

## 如果遇到其他错误

1. **检查终端日志** - 查看具体的错误信息
2. **清除缓存** - 运行 `npm start -- --clear`
3. **重新安装依赖** - 删除 `node_modules` 后运行 `npm install`

## 常见问题

### Q: 应用在浏览器中无法加载？
A: 检查浏览器控制台（F12）的错误信息，通常是路径别名或导入问题。

### Q: Tab 导航不显示？
A: 确保 `app/_layout.tsx` 中正确配置了 3 个 Tab。

### Q: 点击暂停键没有反应？
A: 检查 `usePauseStore` 是否正确导入，状态管理是否正常。
