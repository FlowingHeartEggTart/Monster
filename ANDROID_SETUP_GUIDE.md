# Android SDK 安装与配置指南（Windows）

## 📋 前言

如果你只是在浏览器中开发和测试，**不需要安装这些**。只有当你需要在 Android 真机或模拟器上测试时才需要。

---

## 🔧 完整安装步骤

### 第一步：下载并安装 Android Studio

#### 1. 下载 Android Studio
- 访问官网：https://developer.android.com/studio
- 点击 **Download Android Studio**
- 等待下载完成（约 1GB）

#### 2. 安装 Android Studio
```
1. 双击安装包 (.exe)
2. 点击 "Next"
3. 选择 "Standard" 安装类型
4. 选择安装路径（建议默认）：
   C:\Program Files\Android\Android Studio
5. 点击 "Next" → "Install"
6. 等待安装完成（约 10-15 分钟）
7. 点击 "Finish"
```

#### 3. 首次启动配置
```
1. 启动 Android Studio
2. 选择 "Do not import settings"
3. 点击 "Next"
4. 选择 "Standard" 配置
5. 选择主题（Dark 或 Light）
6. 点击 "Next" → "Finish"
7. 等待下载 SDK 组件（约 2-3GB）
```

---

### 第二步：确认 Android SDK 安装位置

#### 1. 打开 SDK Manager
```
Android Studio 顶部菜单：
Tools → SDK Manager
```

#### 2. 查看 SDK 路径
在 **Android SDK Location** 看到路径，通常是：
```
C:\Users\你的用户名\AppData\Local\Android\Sdk
```

**记下这个路径！** 下一步要用到。

#### 3. 确认已安装的组件
在 **SDK Platforms** 标签页，确保至少勾选：
- ✅ Android 13.0 (Tiramisu) 或更高版本
- ✅ Android SDK Platform 33 或更高

在 **SDK Tools** 标签页，确保勾选：
- ✅ Android SDK Build-Tools
- ✅ Android SDK Platform-Tools
- ✅ Android Emulator
- ✅ Android SDK Tools (Obsolete)

点击 **Apply** 安装缺失的组件。

---

### 第三步：设置环境变量 ANDROID_HOME

#### 方法一：通过系统设置（推荐）

##### 1. 打开环境变量设置
```
方式A（快捷）：
- 按 Win + R
- 输入：sysdm.cpl
- 按回车

方式B（传统）：
- 右键 "此电脑" / "我的电脑"
- 点击 "属性"
- 点击 "高级系统设置"
```

##### 2. 打开环境变量窗口
```
1. 在 "系统属性" 窗口
2. 点击 "环境变量" 按钮（底部）
```

##### 3. 添加 ANDROID_HOME 变量
```
在 "用户变量" 或 "系统变量" 区域：

1. 点击 "新建"
2. 变量名：ANDROID_HOME
3. 变量值：C:\Users\你的用户名\AppData\Local\Android\Sdk
   （填写你在第二步记下的路径）
4. 点击 "确定"
```

##### 4. 添加到 Path 变量
```
找到 Path 变量：
1. 选中 "Path"
2. 点击 "编辑"
3. 点击 "新建"
4. 添加以下两行：
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
5. 点击 "确定"
```

##### 5. 保存所有设置
```
1. 点击 "确定" 关闭环境变量窗口
2. 点击 "确定" 关闭系统属性
```

#### 方法二：通过 PowerShell（高级用户）

```powershell
# 设置用户环境变量
[System.Environment]::SetEnvironmentVariable(
    "ANDROID_HOME",
    "C:\Users\你的用户名\AppData\Local\Android\Sdk",
    [System.EnvironmentVariableTarget]::User
)

# 获取当前 Path
$currentPath = [System.Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::User)

# 添加到 Path
$newPath = $currentPath + ";%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\tools"

[System.Environment]::SetEnvironmentVariable(
    "Path",
    $newPath,
    [System.EnvironmentVariableTarget]::User
)
```

---

### 第四步：验证安装

#### 1. 重启终端
**重要！** 必须重启 PowerShell 或命令提示符才能使环境变量生效。

#### 2. 验证 ANDROID_HOME
打开**新的** PowerShell 窗口，执行：
```powershell
echo $env:ANDROID_HOME
```

**期望输出**：
```
C:\Users\你的用户名\AppData\Local\Android\Sdk
```

#### 3. 验证 adb
```powershell
adb --version
```

**期望输出**：
```
Android Debug Bridge version 1.0.41
Version 34.0.x
```

#### 4. 验证 SDK 工具
```powershell
where adb
```

**期望输出**：
```
C:\Users\你的用户名\AppData\Local\Android\Sdk\platform-tools\adb.exe
```

---

## 🎯 在 Expo 项目中测试

### 1. 重启 Metro Bundler
```bash
# 停止当前的服务（Ctrl+C）
# 然后重新启动
npm start
```

### 2. 连接 Android 设备

#### 选项A：使用 Android 模拟器
```
1. 打开 Android Studio
2. 点击 AVD Manager (设备图标)
3. 创建新的虚拟设备
4. 选择设备型号（如 Pixel 6）
5. 选择系统镜像（推荐 API 33）
6. 点击 Finish
7. 点击 ▶️ 启动模拟器
```

然后在 Expo 终端按 **`a`** 键运行 Android。

#### 选项B：使用真机
```
1. 在手机上开启开发者选项：
   - 设置 → 关于手机
   - 连续点击 "版本号" 7次
   
2. 开启 USB 调试：
   - 设置 → 开发者选项
   - 打开 "USB 调试"
   
3. 用 USB 线连接电脑
4. 手机上授权调试
5. 在终端运行：
   adb devices
   
6. 看到设备列表后，在 Expo 终端按 'a' 键
```

---

## 🔍 常见问题排查

### Q1: 环境变量设置后仍然找不到 adb？

**解决方法**：
```
1. 确认已完全重启终端（关闭后重新打开）
2. 检查路径是否正确：
   dir $env:ANDROID_HOME\platform-tools\adb.exe
3. 如果文件存在但命令不可用，尝试重启电脑
```

### Q2: adb 命令提示 "不是内部或外部命令"？

**检查步骤**：
```powershell
# 1. 检查 ANDROID_HOME
echo $env:ANDROID_HOME

# 2. 检查 Path 是否包含 platform-tools
echo $env:Path | Select-String "platform-tools"

# 3. 手动运行完整路径
& "$env:ANDROID_HOME\platform-tools\adb.exe" --version
```

### Q3: Android Studio 找不到 SDK？

**解决方法**：
```
1. 打开 Android Studio
2. File → Settings → Appearance & Behavior → System Settings → Android SDK
3. 点击 "Edit" 手动指定 SDK 路径
4. 选择：C:\Users\你的用户名\AppData\Local\Android\Sdk
```

### Q4: Expo 仍然报 Android SDK 错误？

**解决方法**：
```bash
# 1. 完全停止 Expo
Ctrl+C

# 2. 清除缓存
npx expo start -c

# 3. 重新启动
npm start
```

---

## 📦 最小化安装（仅 ADB）

如果你**只需要 ADB** 而不需要整个 Android Studio：

### 下载 SDK Platform Tools
1. 访问：https://developer.android.com/studio/releases/platform-tools
2. 下载 Windows 版本（约 10MB）
3. 解压到：`C:\Android\platform-tools`
4. 设置环境变量：
   - `ANDROID_HOME` = `C:\Android`
   - 添加到 Path：`C:\Android\platform-tools`

---

## ⚙️ 推荐的 Android Studio 设置

### 性能优化
```
File → Settings → Appearance & Behavior → System Settings → Memory Settings

推荐配置：
- IDE max heap size: 2048 MB
- Android Gradle: 2048 MB
```

### 必要的插件
- ✅ Android APK Support
- ✅ Android Support
- ✅ Gradle

---

## 🎓 总结

### 完整安装（推荐新手）
```
1. 下载 Android Studio (1GB)
2. 安装并下载 SDK (2-3GB)
3. 设置 ANDROID_HOME 环境变量
4. 重启终端验证
总耗时：约 30-60 分钟
```

### 最小化安装（高级用户）
```
1. 下载 Platform Tools (10MB)
2. 解压到指定目录
3. 设置环境变量
4. 重启终端验证
总耗时：约 5 分钟
```

### 重要提醒
- ✅ 设置环境变量后**必须重启终端**
- ✅ 建议重启电脑以确保所有进程都识别新变量
- ✅ Web 开发不需要这些配置
- ✅ 可以先在浏览器中完整开发和测试

---

**现在可以在 Android 设备上测试你的应用了！** 📱✨
