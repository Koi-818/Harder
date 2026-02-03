/**
 * 常量和工具函数 - 共享的配置和辅助函数
 */

// ═══════════════════════════════════════════════════════════════
// 颜色常量
// ═══════════════════════════════════════════════════════════════

export const COLORS = {
  CYAN: '\x1b[38;5;51m',
  BRIGHT_CYAN: '\x1b[1;38;5;87m',
  BRIGHT_BLUE: '\x1b[1;38;5;123m',
  LIGHT_BLUE: '\x1b[1;38;5;117m',
  BRIGHT_LIGHT_BLUE: '\x1b[1;38;5;45m',
  DARK_BLUE: '\x1b[1;38;5;39m',
  YELLOW: '\x1b[38;5;226m',
  GREEN: '\x1b[38;5;46m',
  SHADOW: '\x1b[38;5;17m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
};

// ═══════════════════════════════════════════════════════════════
// 浏览器配置
// ═══════════════════════════════════════════════════════════════

export const BROWSER_CONFIGS = {
  '1': { type: 'chromium', channel: 'chrome', name: 'chrome' },
  '2': { type: 'chromium', channel: 'msedge', name: 'edge' },
  '3': { type: 'firefox', channel: null, name: 'firefox' },
};

export const BROWSER_NAMES = {
  chrome: 'Chrome (默认)',
  edge: 'Edge',
  firefox: 'Firefox',
};

// ═══════════════════════════════════════════════════════════════
// 字符串常量
// ═══════════════════════════════════════════════════════════════

export const SEPARATOR = '═'.repeat(60);

export const MESSAGES = {
  STARTUP: '[+] HAR 网络流量录制工具  |  Playwright 自动化',
  BROWSER_OPENED: '[+] 浏览器已打开，录制进行中！',
  BROWSER_CLOSED: '[+] 检测到浏览器已关闭！',
  SAVE_HAR: '[*] 正在保存 HAR 文件...',
  LISTENING_BROWSER: '[*] 监听浏览器状态...',
  STARTING_BROWSER: '[*] 正在启动浏览器...',
  LOADING_PAGE: '[*] 正在加载网页...',
  USER_INTERRUPTED: '[!] 用户中断操作',
  NO_URL_ERROR: '[!] 网址不能为空',
  PAGE_LOAD_TIMEOUT: '[!] 页面加载超时或出错',
  CONTINUING: '继续录制...',
};

// ═══════════════════════════════════════════════════════════════
// UI 帮助函数
// ═══════════════════════════════════════════════════════════════

/**
 * 格式化带颜色的消息
 */
export function formatMessage(color, icon, message) {
  return `${color}${icon} ${message}${COLORS.RESET}`;
}

/**
 * 打印分隔线
 */
export function printSeparator(color = COLORS.CYAN) {
  console.log(color + SEPARATOR + COLORS.RESET);
}

/**
 * 打印标题
 */
export function printTitle(title) {
  printSeparator(COLORS.YELLOW);
  console.log(`  ${COLORS.BOLD}${COLORS.YELLOW}${title}${COLORS.RESET}`);
  printSeparator(COLORS.YELLOW);
  console.log('');
}

/**
 * 打印步骤标题
 */
export function printStep(stepNum, title) {
  console.log(`${COLORS.YELLOW}[${stepNum}] ${title}${COLORS.RESET}`);
}

/**
 * 打印成功消息
 */
export function printSuccess(message) {
  console.log(formatMessage(COLORS.GREEN, '[+]', message));
}

/**
 * 打印提示消息
 */
export function printInfo(message) {
  console.log(formatMessage(COLORS.CYAN, '[*]', message));
}

/**
 * 打印警告消息
 */
export function printWarning(message) {
  console.log(formatMessage(COLORS.YELLOW, '[->]', message));
}

/**
 * 打印错误消息
 */
export function printError(message) {
  console.error(formatMessage(COLORS.GREEN, '[!]', message));
}

/**
 * 打印菜单项
 */
export function printMenuItem(index, label) {
  console.log(`  ${COLORS.CYAN}${index}${COLORS.RESET} ${label}`);
}

/**
 * 打印确认信息
 */
export function printConfirmation(label, value) {
  console.log(`  ${COLORS.CYAN}[+]${COLORS.RESET} ${label}: ${value}\n`);
}

// ═══════════════════════════════════════════════════════════════
// 工具函数
// ═══════════════════════════════════════════════════════════════

/**
 * 简单缓存机制 - 用于缓存频繁调用的函数结果
 */
class SimpleCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }
}

// 创建全局缓存实例
const globalCache = new SimpleCache(100);

/**
 * 获取浏览器配置 - 已缓存
 */
export function getBrowserConfig(choice) {
  const cacheKey = `browserConfig_${choice}`;
  if (globalCache.has(cacheKey)) {
    return globalCache.get(cacheKey);
  }
  const config = BROWSER_CONFIGS[choice] || BROWSER_CONFIGS['1'];
  globalCache.set(cacheKey, config);
  return config;
}

/**
 * 验证并格式化 URL - 已缓存
 */
export function formatUrl(targetURL) {
  const cacheKey = `formatUrl_${targetURL}`;
  if (globalCache.has(cacheKey)) {
    return globalCache.get(cacheKey);
  }
  let url = targetURL.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  globalCache.set(cacheKey, url);
  return url;
}

/**
 * 延迟函数
 */
export async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 获取色彩数组 - 已缓存
 */
const colorArrayCache = [
  COLORS.BRIGHT_CYAN,
  COLORS.BRIGHT_BLUE,
  COLORS.LIGHT_BLUE,
  COLORS.BRIGHT_LIGHT_BLUE,
  COLORS.DARK_BLUE,
  COLORS.BRIGHT_CYAN,
];

export function getColorArray() {
  return colorArrayCache;
}

/**
 * 清除缓存（可选）
 */
export function clearCache() {
  globalCache.clear();
}
