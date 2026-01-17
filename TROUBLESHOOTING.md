# 故障排除指南

## 500 Internal Server Error 解决方案

如果遇到 500 错误，请按以下步骤操作：

### 1. 清除缓存并重启

```bash
# 停止当前服务器 (Ctrl+C)
# 然后运行：
npm start -- --clear
```

### 2. 重新安装依赖

```bash
# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json
# Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json

# 重新安装
npm install
```

### 3. 检查 Babel 配置

确保 `babel.config.js` 中已正确配置路径别名：

```js
plugins: [
  [
    'module-resolver',
    {
      root: ['./'],
      alias: {
        '@': './src',
      },
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
  ],
  'react-native-reanimated/plugin', // 必须在最后
],
```

### 4. 验证 Metro 配置

确保项目根目录有 `metro.config.js` 文件。

### 5. 检查终端错误信息

查看运行 `npm start` 的终端，查找具体的错误信息。常见错误：

- **模块未找到**: 检查路径别名是否正确
- **语法错误**: 检查 TypeScript 编译
- **依赖缺失**: 运行 `npm install`

### 6. 验证文件结构

确保以下文件存在：
- `app/_layout.tsx`
- `app/index.tsx`
- `app/lighthouse.tsx`
- `babel.config.js`
- `metro.config.js`
- `tsconfig.json`

### 7. 如果问题仍然存在

尝试创建一个最简单的测试页面：

```tsx
// app/test.tsx
export default function Test() {
  return <div>Test</div>;
}
```

然后访问该页面，看是否能正常加载。

## 常见问题

### Q: favicon.ico 500 错误
A: 这是正常的，不影响应用运行。可以忽略或添加 favicon 文件。

### Q: 路径别名不工作
A: 确保已安装 `babel-plugin-module-resolver` 并在 `babel.config.js` 中正确配置。

### Q: Reanimated 插件错误
A: 确保 `react-native-reanimated/plugin` 是 Babel 配置中的最后一个插件。
