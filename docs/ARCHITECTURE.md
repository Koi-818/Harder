# 项目结构说明

## 文件夹结构

```
harder/
├── src/
│   ├── cli.js                 # 主入口文件
│   └── utils/
│       ├── ui.js              # UI 和动画相关函数
│       ├── browser.js         # 浏览器控制和操作
│       ├── stats.js           # HAR 文件统计分析
│       └── input.js           # 用户输入和配置管理
├── tests/                     # 测试文件
├── hars/                      # HAR 录制文件输出目录
├── docs/                      # 文档
├── package.json               # 项目配置
├── playwright.config.js       # Playwright 配置
└── README.md                  # 项目说明
```

## 模块说明

### 1. cli.js （主入口）
- **职责**：应用程序入口，协调各个模块
- **功能**：
  - 初始化 readline 接口
  - 调用各模块实现完整的录制流程
  - 处理错误和进程信号

### 2. utils/ui.js （UI 和动画）
- **职责**：命令行界面显示和动画效果
- **导出函数**：
  - `displayStartupAnimation()` - 启动动画（立体感+逐行展开）
  - `showLoadingAnimation()` - 加载动画
  - `showFeatureMenu()` - 显示功能菜单
  - `showOperationTips()` - 显示操作提示
  - `showSuccessMessage()` - 成功消息
  - `showErrorMessage()` - 错误消息
  - `showInfo()` - 信息消息

### 3. utils/browser.js （浏览器控制）
- **职责**：Playwright 浏览器操作
- **导出函数**：
  - `launchBrowser()` - 启动浏览器
  - `createRecordingContext()` - 创建录制上下文
  - `navigateToUrl()` - 导航到 URL
  - `detectBrowserClose()` - 检测浏览器关闭事件

### 4. utils/stats.js （统计分析）
- **职责**：HAR 文件分析和统计
- **导出函数**：
  - `showHARStats()` - 显示 HAR 文件统计信息

### 5. utils/input.js （输入管理）
- **职责**：用户输入和配置管理
- **导出函数**：
  - `getBrowserConfig()` - 获取浏览器配置
  - `formatUrl()` - 格式化 URL
  - `generateHarPath()` - 生成 HAR 文件路径
  - `showStepTitle()` - 显示步骤标题
  - `showBrowserMenu()` - 显示浏览器选择菜单
  - `showConfirmation()` - 显示确认信息
  - `getHarDir()` - 获取 HAR 输出目录

## 优化点

### 代码可维护性
- ✅ 模块化设计，职责清晰
- ✅ 易于测试每个独立模块
- ✅ 函数功能单一，易于维护

### 代码复用性
- ✅ 所有 UI 函数集中在 ui.js
- ✅ 浏览器操作集中在 browser.js
- ✅ 便于在其他项目复用

### 易于扩展
- ✅ 添加新功能只需修改相关模块
- ✅ 不会影响其他模块的逻辑
- ✅ 清晰的模块边界

## 使用说明

```bash
# 安装依赖
npm install

# 启动应用
npm start
npm run dev
npm run record

# 运行测试
npm test
npm run test:debug
```

## 未来改进方向

1. **配置文件**：创建 config.js 管理各种配置
2. **日志系统**：创建 logger.js 统一管理日志
3. **错误处理**：创建 errors.js 定义自定义错误
4. **数据验证**：创建 validators.js 进行输入验证
5. **插件系统**：支持自定义插件扩展功能
