/**
 * 配置管理模块 - 加载和管理应用配置
 * 
 * 功能:
 * - 加载 config.json 配置文件
 * - 支持环境变量覆盖
 * - 支持运行时配置修改
 * - 配置验证
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { warn, info, debug, error as logError } from './logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * 默认配置
 */
const DEFAULT_CONFIG = {
  app: {
    name: 'Harder HAR Recorder',
    version: '2.1.0',
    description: '使用 Playwright 录制浏览器 HAR 文件',
  },
  browser: {
    default: 'chrome',
    timeout: 3600000,
    headless: false,
    args: [],
  },
  recording: {
    outputDir: 'hars',
    defaultFileName: 'recording',
    includeResponseBodies: true,
    maxFileSize: 52428800, // 50MB
  },
  performance: {
    enableStats: true,
    topN: 5,
    slowRequestThreshold: 1000, // ms
    largeResourceThreshold: 512, // KB
  },
  logging: {
    enabled: true,
    level: 'info',
    outputDir: 'logs',
    format: '[{timestamp}] [{level}] {message}',
    maxFiles: 7,
    maxFileSize: 10485760, // 10MB
  },
  ui: {
    showAnimation: true,
    animationDelay: 25,
    loadingCycles: 2,
    colors: {
      primary: 'cyan',
      secondary: 'yellow',
      success: 'green',
    },
  },
};

/**
 * 配置缓存
 */
let configCache = null;

/**
 * 加载配置文件
 */
export function loadConfig(configPath = null) {
  try {
    const defaultConfigPath = path.join(__dirname, '../../config.json');
    const targetPath = configPath || defaultConfigPath;
    
    if (!fs.existsSync(targetPath)) {
      warn(`配置文件不存在，使用默认配置：${targetPath}`);
      return DEFAULT_CONFIG;
    }

    const configFile = fs.readFileSync(targetPath, 'utf-8');
    const userConfig = JSON.parse(configFile);
    
    const mergedConfig = mergeDeep(DEFAULT_CONFIG, userConfig);
    
    // 应用环境变量覆盖
    applyEnvOverrides(mergedConfig);
    
    debug('配置文件加载成功', { path: targetPath });
    info('配置已加载', { 
      browser: mergedConfig.browser.default,
      logging: mergedConfig.logging.level,
    });

    return mergedConfig;
  } catch (error) {
    logError(`加载配置文件失败：${error.message}`, { path: configPath });
    warn('使用默认配置');
    return DEFAULT_CONFIG;
  }
}

/**
 * 获取配置（带缓存）
 */
export function getConfig(key = null) {
  if (!configCache) {
    configCache = loadConfig();
  }

  if (key) {
    const keys = key.split('.');
    let value = configCache;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  return configCache;
}

/**
 * 清除配置缓存
 */
export function clearConfigCache() {
  configCache = null;
  debug('配置缓存已清除');
}

/**
 * 应用环境变量覆盖
 */
function applyEnvOverrides(config) {
  // 日志级别
  if (process.env.LOG_LEVEL) {
    config.logging.level = process.env.LOG_LEVEL;
    debug('环境变量覆盖日志级别', { level: config.logging.level });
  }

  // 日志输出目录
  if (process.env.LOG_DIR) {
    config.logging.outputDir = process.env.LOG_DIR;
    debug('环境变量覆盖日志目录', { dir: config.logging.outputDir });
  }

  // HAR 输出目录
  if (process.env.HARS_DIR) {
    config.recording.outputDir = process.env.HARS_DIR;
    debug('环境变量覆盖 HAR 目录', { dir: config.recording.outputDir });
  }

  // 默认浏览器
  if (process.env.DEFAULT_BROWSER) {
    config.browser.default = process.env.DEFAULT_BROWSER;
    debug('环境变量覆盖默认浏览器', { browser: config.browser.default });
  }

  // 无头模式
  if (process.env.HEADLESS === 'true') {
    config.browser.headless = true;
    debug('环境变量启用无头模式');
  }

  // 禁用动画
  if (process.env.NO_ANIMATION === 'true') {
    config.ui.showAnimation = false;
    debug('环境变量禁用动画');
  }
}

/**
 * 深度合并对象
 */
function mergeDeep(target, source) {
  const output = Object.assign({}, target);
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  
  return output;
}

/**
 * 判断是否为对象
 */
function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * 验证配置
 */
export function validateConfig(config) {
  const errors = [];

  // 验证日志级别
  const validLevels = ['error', 'warn', 'info', 'debug'];
  if (!validLevels.includes(config.logging.level)) {
    errors.push(`无效的日志级别：${config.logging.level}`);
  }

  // 验证浏览器超时
  if (config.browser.timeout < 0) {
    errors.push('浏览器超时不能为负数');
  }

  // 验证最大文件大小
  if (config.recording.maxFileSize < 0) {
    errors.push('最大文件大小不能为负数');
  }

  if (errors.length > 0) {
    errors.forEach(err => logError(`配置验证错误：${err}`));
    return false;
  }

  debug('配置验证通过');
  return true;
}

/**
 * 保存配置到文件
 */
export function saveConfig(config, configPath = null) {
  try {
    const targetPath = configPath || path.join(__dirname, '../../config.json');
    fs.writeFileSync(targetPath, JSON.stringify(config, null, 2), 'utf-8');
    info('配置已保存', { path: targetPath });
    return true;
  } catch (error) {
    logError(`保存配置失败：${error.message}`);
    return false;
  }
}

/**
 * 获取配置项
 */
export function get(key, defaultValue = undefined) {
  const value = getConfig(key);
  return value !== undefined ? value : defaultValue;
}

/**
 * 设置配置项（运行时）
 */
export function set(key, value) {
  if (!configCache) {
    configCache = loadConfig();
  }

  const keys = key.split('.');
  let current = configCache;
  
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  debug('配置项已设置', { key, value });
}

export default {
  loadConfig,
  getConfig,
  clearConfigCache,
  validateConfig,
  saveConfig,
  get,
  set,
  DEFAULT_CONFIG,
};
