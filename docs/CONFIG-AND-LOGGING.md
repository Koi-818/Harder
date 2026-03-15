# 配置文件和日志系统

> v2.1.0 新增功能 - 配置管理和统一日志系统

---

## 📋 配置文件 (config.json)

### 文件位置
```
harder/
└── config.json
```

### 配置结构

```json
{
  "app": {
    "name": "Harder HAR Recorder",
    "version": "2.1.0",
    "description": "使用 Playwright 录制浏览器 HAR 文件"
  },
  "browser": {
    "default": "chrome",
    "timeout": 3600000,
    "headless": false,
    "args": []
  },
  "recording": {
    "outputDir": "hars",
    "defaultFileName": "recording",
    "includeResponseBodies": true,
    "maxFileSize": 52428800
  },
  "performance": {
    "enableStats": true,
    "topN": 5,
    "slowRequestThreshold": 1000,
    "largeResourceThreshold": 512
  },
  "logging": {
    "enabled": true,
    "level": "info",
    "outputDir": "logs",
    "format": "[{timestamp}] [{level}] {message}",
    "maxFiles": 7,
    "maxFileSize": 10485760
  },
  "ui": {
    "showAnimation": true,
    "animationDelay": 25,
    "loadingCycles": 2,
    "colors": {
      "primary": "cyan",
      "secondary": "yellow",
      "success": "green"
    }
  }
}
```

### 配置项说明

#### app - 应用配置
| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| name | string | 应用名称 | Harder HAR Recorder |
| version | string | 版本号 | 2.1.0 |
| description | string | 应用描述 | - |

#### browser - 浏览器配置
| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| default | string | 默认浏览器 (chrome/edge/firefox) | chrome |
| timeout | number | 浏览器超时时间 (ms) | 3600000 |
| headless | boolean | 无头模式 | false |
| args | array | 浏览器启动参数 | [] |

#### recording - 录制配置
| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| outputDir | string | HAR 输出目录 | hars |
| defaultFileName | string | 默认文件名前缀 | recording |
| includeResponseBodies | boolean | 包含响应体 | true |
| maxFileSize | number | 最大文件大小 (bytes) | 52428800 |

#### performance - 性能配置
| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| enableStats | boolean | 启用性能统计 | true |
| topN | number | Top N 显示数量 | 5 |
| slowRequestThreshold | number | 慢请求阈值 (ms) | 1000 |
| largeResourceThreshold | number | 大资源阈值 (KB) | 512 |

#### logging - 日志配置
| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| enabled | boolean | 启用日志 | true |
| level | string | 日志级别 (error/warn/info/debug) | info |
| outputDir | string | 日志输出目录 | logs |
| format | string | 日志格式 | - |
| maxFiles | number | 最大保留文件数 | 7 |
| maxFileSize | number | 最大文件大小 (bytes) | 10485760 |

#### ui - UI 配置
| 字段 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| showAnimation | boolean | 显示动画 | true |
| animationDelay | number | 动画延迟 (ms) | 25 |
| loadingCycles | number | 加载动画循环次数 | 2 |
| colors | object | 颜色配置 | - |

---

## 🌍 环境变量覆盖

支持通过环境变量覆盖配置文件：

| 环境变量 | 配置项 | 示例 |
|---------|--------|------|
| `LOG_LEVEL` | logging.level | `export LOG_LEVEL=debug` |
| `LOG_DIR` | logging.outputDir | `export LOG_DIR=/var/log` |
| `HARS_DIR` | recording.outputDir | `export HARS_DIR=./output` |
| `DEFAULT_BROWSER` | browser.default | `export DEFAULT_BROWSER=firefox` |
| `HEADLESS` | browser.headless | `export HEADLESS=true` |
| `NO_ANIMATION` | ui.showAnimation | `export NO_ANIMATION=true` |

### 使用示例

```bash
# 临时设置调试日志
LOG_LEVEL=debug npm start

# 使用 Firefox 浏览器
DEFAULT_BROWSER=firefox npm start

# 无头模式运行
HEADLESS=true npm start

# 组合使用
LOG_LEVEL=debug DEFAULT_BROWSER=firefox npm start
```

---

## 📝 日志系统

### 日志级别

| 级别 | 说明 | 使用场景 |
|------|------|----------|
| error | 错误 | 系统错误、异常 |
| warn | 警告 | 潜在问题、降级 |
| info | 信息 | 正常流程、状态 |
| debug | 调试 | 详细调试信息 |

### 日志输出

#### 控制台输出
```
[2026-03-15 14:30:45.123] [INFO] 应用启动
[2026-03-15 14:30:46.456] [INFO] 浏览器选择 { browser: "chrome" }
[2026-03-15 14:30:47.789] [DEBUG] 启动浏览器 { config: {...} }
```

#### 文件输出
日志文件保存在 `logs/` 目录：
```
logs/
├── app-2026-03-15.log
├── app-2026-03-14.log
└── app-2026-03-13.log
```

### 日志 API

```javascript
import { init, info, warn, error, debug } from './utils/logger.js';

// 初始化日志系统
init();

// 记录日志
info('应用启动', { version: '2.1.0' });
warn('配置文件不存在，使用默认配置');
error('操作失败', { error: error.message });
debug('详细调试信息', { data: {...} });
```

### 日志管理命令

```bash
# 清理所有日志文件
npm run clean:logs
```

---

## 🔧 配置管理 API

### 加载配置

```javascript
import { loadConfig, getConfig, set, get } from './utils/config.js';

// 加载配置
const config = loadConfig();

// 获取配置（支持嵌套键）
const browser = getConfig('browser.default');
const logLevel = get('logging.level', 'info');

// 设置配置（运行时）
set('logging.level', 'debug');
set('browser.headless', true);
```

### 配置验证

```javascript
import { validateConfig } from './utils/config.js';

const isValid = validateConfig(config);
if (!isValid) {
  console.error('配置验证失败');
}
```

---

## 📚 最佳实践

### 1. 开发环境配置

创建 `config.local.json`（已加入 .gitignore）：
```json
{
  "logging": {
    "level": "debug",
    "outputDir": "logs-dev"
  },
  "browser": {
    "headless": false,
    "args": ["--devtools"]
  }
}
```

### 2. 生产环境配置

```json
{
  "logging": {
    "level": "warn",
    "maxFiles": 30
  },
  "browser": {
    "timeout": 1800000
  }
}
```

### 3. 性能调优

```json
{
  "performance": {
    "slowRequestThreshold": 500,
    "largeResourceThreshold": 256
  },
  "recording": {
    "maxFileSize": 104857600
  }
}
```

---

## 🐛 故障排查

### 问题 1: 日志不输出

**检查**:
- [ ] logging.enabled 是否为 true
- [ ] logging.level 是否正确
- [ ] logs 目录是否有写权限

**解决**:
```bash
# 检查日志目录权限
ls -la logs/

# 手动创建日志目录
mkdir -p logs
chmod 755 logs
```

### 问题 2: 配置文件不生效

**检查**:
- [ ] config.json 是否存在
- [ ] JSON 格式是否正确
- [ ] 配置项名称是否正确

**解决**:
```bash
# 验证 JSON 格式
node -e "console.log(JSON.parse(require('fs').readFileSync('config.json')))"
```

### 问题 3: 环境变量不生效

**检查**:
- [ ] 环境变量是否正确设置
- [ ] 是否在启动前设置

**解决**:
```bash
# 检查环境变量
echo $LOG_LEVEL

# 设置并启动
export LOG_LEVEL=debug && npm start
```

---

## 📊 日志分析

### 查看最新日志

```bash
# Linux/Mac
tail -f logs/app-$(date +%Y-%m-%d).log

# Windows PowerShell
Get-Content logs\app-$(Get-Date -Format yyyy-MM-dd).log -Tail 50 -Wait
```

### 搜索错误日志

```bash
# Linux/Mac
grep "ERROR" logs/app-*.log

# Windows PowerShell
Select-String "ERROR" logs\app-*.log
```

### 统计日志级别

```bash
# 统计各级别日志数量
grep -c "\[INFO\]" logs/app-*.log
grep -c "\[WARN\]" logs/app-*.log
grep -c "\[ERROR\]" logs/app-*.log
```

---

## 🎯 下一步

- [ ] 实现配置热重载
- [ ] 添加配置验证 UI
- [ ] 支持远程配置中心
- [ ] 实现日志聚合和分析

---

**相关文档**:
- [[QUICK-START]] - 快速开始指南
- [[ARCHITECTURE]] - 系统架构
- [[PERFORMANCE-QUICK-REFERENCE]] - 性能指标参考

**标签**: #配置管理 #日志系统 #v2.1.0 #新功能
