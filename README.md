# Playwright HAR 录制工具

使用 Playwright 浏览器自动化框架录制 HTTP Archive (HAR) 文件，用于性能测试和性能分析。

## 功能特性

✨ **核心功能**
- 🎬 交互式浏览器 HAR 录制
- 🔄 自动检测浏览器关闭（无需手动按 Enter）
- 📊 详细的网络性能统计
- 🌐 支持 Chrome、Edge、Firefox 三种浏览器
- 💾 标准 HAR 1.2 格式文件

✨ **性能分析** (v2.0+)
- 📈 9 大性能维度分析
- 📊 资源类型自动分类
- 🏆 性能排名 (最慢/最大/主要域名)
- 💡 智能优化建议
- 📋 完整的性能报告

## 快速开始

### 安装依赖

```bash
npm install
```

### 开始录制

```bash
npm start
```

**👉 详细说明请查看 [快速开始指南](docs/QUICK-START.md)**

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

### 性能统计 (自动显示)

完成录制时自动显示详细的性能报告：

**网络统计**
- 总请求数、成功率、失败请求数

**性能时间**
- 总加载时间、平均响应时间、等待时间、接收时间

**数据流量**
- 总数据量、平均请求大小

**资源分类**
- HTML、CSS、JavaScript、图片、视频等多种类型统计

**HTTP 状态码分析**
- 所有状态码分布（2xx、3xx、4xx、5xx）

**性能排名**
- 最慢的请求 Top 5
- 最大的资源 Top 5
- 主要域名 Top 5

查看 [docs/PERFORMANCE-METRICS.md](docs/PERFORMANCE-METRICS.md) 了解详细的指标说明。

## 系统要求

- Node.js >= 14
- npm >= 6

## 许可证

ISC

## 📚 文档

所有文档都在 `docs/` 目录中。快速导航:

- **[📖 文档中心](docs/INDEX.md)** - 所有文档的导航页面
- **[🚀 快速开始](docs/QUICK-START.md)** - 基本使用指南
- **[📊 性能指标](docs/PERFORMANCE-QUICK-REFERENCE.md)** - 性能指标查询和诊断工具
- **[🏗️ 项目架构](docs/ARCHITECTURE.md)** - 代码结构和设计说明
- **[📈 更新日志](docs/CHANGELOG.md)** - 版本更新和新功能说明
- **[🔧 优化详解](docs/OPTIMIZATION-DETAILS.md)** - 项目结构优化说明

**新用户？从 [文档中心](docs/INDEX.md) 开始!**
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
