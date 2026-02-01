# Playwright HAR 录制工具

使用 Playwright 浏览器自动化框架录制 HTTP Archive (HAR) 文件，用于性能测试和性能分析。

## 功能特性

✨ **核心功能**
- 🎬 交互式浏览器 HAR 录制
- 🔄 自动检测浏览器关闭（无需手动按 Enter）
- 📊 自动生成网络请求统计
- 🌐 支持 Chrome、Edge、Firefox 三种浏览器
- 💾 标准 HAR 1.2 格式文件

## 快速开始

### 安装依赖

```bash
npm install
```

### 开始录制

```bash
npm start
```

或

```bash
npm run record
```

## 使用流程

1. **启动录制工具**
   ```bash
   npm start
   ```

2. **输入目标网址**
   - 输入要访问的网址，支持 http/https 自动补全
   - 示例：`https://example.com` 或 `example.com`

3. **选择浏览器**
   - 选择 Chrome (默认)、Edge 或 Firefox
   - 注意：需要在系统中安装对应浏览器

4. **设置输出文件名**
   - 输入 HAR 文件名或使用默认名称
   - 格式：`recording-{timestamp}-{browser}.har`

5. **进行浏览操作**
   - 浏览器自动打开并导航到目标网址
   - 进行任何操作：点击、填表、搜索等
   - 所有网络请求自动记录

6. **完成录制**
   - 关闭浏览器窗口即可完成
   - 工具自动检测浏览器关闭
   - HAR 文件自动保存到 `hars/` 目录

## 项目结构

```
.
├── src/
│   └── cli.js              # 主程序入口
├── hars/                   # HAR 文件输出目录
├── tests/                  # Playwright 测试用例
├── package.json            # 项目配置
├── playwright.config.js    # Playwright 配置
└── README.md              # 本文件
```

## 命令

| 命令 | 说明 |
|------|------|
| `npm start` | 启动交互式 HAR 录制 |
| `npm run record` | 同上 |
| `npm test` | 运行 Playwright 测试 |
| `npm run test:debug` | 调试模式运行测试 |

## HAR 文件输出

录制完成后，生成的 HAR 文件包含：

- ✓ 所有 HTTP 请求和响应
- ✓ 完整的响应内容（text, html, json 等）
- ✓ 请求和响应时间戳
- ✓ 网络性能数据

### 统计信息

完成录制时自动显示：

- 总请求数
- 总加载时间
- 总数据量
- 失败请求数

## 系统要求

- Node.js >= 14
- npm >= 6

## 许可证

ISC

## 相关资源

- [Playwright 文档](https://playwright.dev/)
- [HTTP Archive (HAR) 规范](http://www.softwareishard.com/blog/har-12-spec/)
     3. WebKit
   请选择 (1-3, 默认: 1): 1
   ```

4. **设置 HAR 文件名**
   ```
   HAR 文件名 (默认: recording-2026-01-30-10-30-45-chromium.har): 
   ```

5. **浏览器自动打开，进行操作**
   - 点击链接
   - 填写表单
   - 滚动页面
   - 搜索内容
   - 执行任何浏览器交互

6. **关闭浏览器窗口完成录制**
   - 系统自动检测浏览器关闭
   - 无需手动操作

## 项目结构

```
.
├── src/
│   ├── cli.js              # 交互式命令行工具
│   └── har-recorder.js     # HAR 录制核心模块
├── hars/                   # HAR 文件输出目录
├── docs/
│   ├── README.md           # 详细文档
│   └── QUICK-START.md      # 快速入门指南
├── tests/
│   └── example.spec.js     # Playwright 测试
├── package.json
├── playwright.config.js
└── README.md
```

## 可用命令

```bash
npm start                    # 启动交互式录制工具
npm run record              # 同上
npm run dev                 # 开发模式启动
npm test                    # 运行测试
npm run test:debug          # 调试模式运行测试
```

## 输出文件

录制完成后，HAR 文件保存在 `hars/` 目录中，包含：

- 📝 所有 HTTP 请求和响应
- 📊 请求时间、大小等详细信息
- 🔗 完整的请求链和关系
- 📈 性能指标数据

## 使用场景

- 📈 性能测试数据采集
- 🔍 网站性能分析
- 🧪 自动化测试用例
- 📋 性能基准建立
- 🔄 离线回放测试

## 技术栈

- **Playwright** ^1.58.0 - 浏览器自动化
- **Node.js** - 运行环境
- **HAR 1.2** - 文件格式标准

## 文档

详见 [docs/QUICK-START.md](docs/QUICK-START.md) 获取快速开始指南。

## 许可证

ISC
# Harder
