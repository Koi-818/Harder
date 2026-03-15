/**
 * 日志系统模块 - 统一的日志管理
 * 
 * 功能:
 * - 多级别日志 (error, warn, info, debug)
 * - 文件输出和控制台输出
 * - 日志轮转和清理
 * - 格式化输出
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 日志级别
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// 日志级别颜色
const LOG_COLORS = {
  error: COLORS.RED || '\x1b[31m',
  warn: COLORS.YELLOW || '\x1b[33m',
  info: COLORS.CYAN || '\x1b[36m',
  debug: COLORS.GREEN || '\x1b[32m',
};

// 日志级别图标
const LOG_ICONS = {
  error: '[ERROR]',
  warn: '[WARN]',
  info: '[INFO]',
  debug: '[DEBUG]',
};

/**
 * 日志配置
 */
let config = {
  enabled: true,
  level: 'info',
  outputDir: 'logs',
  format: '[{timestamp}] [{level}] {message}',
  maxFiles: 7,
  maxFileSize: 10 * 1024 * 1024,
  consoleOutput: true,
};

/**
 * 加载配置文件
 */
export function loadConfig(configPath = null) {
  try {
    const defaultConfigPath = path.join(__dirname, '../../config.json');
    const targetPath = configPath || defaultConfigPath;
    
    if (fs.existsSync(targetPath)) {
      const configFile = fs.readFileSync(targetPath, 'utf-8');
      const parsed = JSON.parse(configFile);
      
      if (parsed.logging) {
        config = {
          ...config,
          ...parsed.logging,
        };
      }
      
      if (parsed.performance) {
        config.performance = parsed.performance;
      }
    }
  } catch (error) {
    console.error(`${COLORS.YELLOW}[!] 加载配置文件失败：${error.message}${COLORS.RESET}`);
  }
}

/**
 * 格式化时间戳
 */
function formatTimestamp(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
}

/**
 * 获取日志文件名（按日期）
 */
function getLogFileName() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `app-${year}-${month}-${day}.log`;
}

/**
 * 确保日志目录存在
 */
function ensureLogDir() {
  const logDir = path.join(__dirname, '../../', config.outputDir);
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  return logDir;
}

/**
 * 清理旧日志文件
 */
function cleanupOldLogs() {
  try {
    const logDir = ensureLogDir();
    const files = fs.readdirSync(logDir)
      .filter(file => file.endsWith('.log'))
      .sort()
      .reverse();
    
    if (files.length > config.maxFiles) {
      const filesToDelete = files.slice(config.maxFiles);
      filesToDelete.forEach(file => {
        const filePath = path.join(logDir, file);
        fs.unlinkSync(filePath);
      });
    }
  } catch (error) {
    console.error(`${COLORS.YELLOW}[!] 清理日志文件失败：${error.message}${COLORS.RESET}`);
  }
}

/**
 * 检查日志文件大小并轮转
 */
function rotateLogIfNecessary(logPath) {
  try {
    if (fs.existsSync(logPath)) {
      const stats = fs.statSync(logPath);
      if (stats.size > config.maxFileSize) {
        const date = new Date();
        const timestamp = date.getTime();
        const rotatedPath = logPath.replace('.log', `-${timestamp}.log`);
        fs.renameSync(logPath, rotatedPath);
        cleanupOldLogs();
      }
    }
  } catch (error) {
    console.error(`${COLORS.YELLOW}[!] 日志轮转失败：${error.message}${COLORS.RESET}`);
  }
}

/**
 * 格式化日志消息
 */
function formatMessage(level, message, data = null) {
  const timestamp = formatTimestamp();
  const icon = LOG_ICONS[level];
  
  let formattedMessage = config.format
    .replace('{timestamp}', timestamp)
    .replace('{level}', icon)
    .replace('{message}', message);
  
  if (data) {
    formattedMessage += ' ' + JSON.stringify(data);
  }
  
  return formattedMessage;
}

/**
 * 写入日志到文件
 */
function writeToFile(message) {
  try {
    const logDir = ensureLogDir();
    const logFile = getLogFileName();
    const logPath = path.join(logDir, logFile);
    
    rotateLogIfNecessary(logPath);
    
    fs.appendFileSync(logPath, message + '\n', 'utf-8');
  } catch (error) {
    console.error(`${COLORS.YELLOW}[!] 写入日志文件失败：${error.message}${COLORS.RESET}`);
  }
}

/**
 * 输出到控制台
 */
function writeToConsole(message, level) {
  if (!config.consoleOutput) return;
  
  const color = LOG_COLORS[level] || COLORS.RESET;
  console.log(`${color}${message}${COLORS.RESET}`);
}

/**
 * 记录日志
 */
function log(level, message, data = null) {
  if (!config.enabled) return;
  
  const currentLevel = LOG_LEVELS[config.level] || LOG_LEVELS.info;
  const messageLevel = LOG_LEVELS[level];
  
  if (messageLevel > currentLevel) return;
  
  const formattedMessage = formatMessage(level, message, data);
  
  writeToFile(formattedMessage);
  writeToConsole(formattedMessage, level);
}

/**
 * 错误日志
 */
export function error(message, data = null) {
  log('error', message, data);
}

/**
 * 警告日志
 */
export function warn(message, data = null) {
  log('warn', message, data);
}

/**
 * 信息日志
 */
export function info(message, data = null) {
  log('info', message, data);
}

/**
 * 调试日志
 */
export function debug(message, data = null) {
  log('debug', message, data);
}

/**
 * 设置日志级别
 */
export function setLevel(level) {
  if (LOG_LEVELS.hasOwnProperty(level)) {
    config.level = level;
    info(`日志级别已设置为：${level}`);
  }
}

/**
 * 启用/禁用日志
 */
export function enable(enabled) {
  config.enabled = enabled;
}

/**
 * 获取日志配置
 */
export function getConfig() {
  return { ...config };
}

/**
 * 初始化日志系统
 */
export function init(customConfig = null) {
  loadConfig();
  
  if (customConfig) {
    config = { ...config, ...customConfig };
  }
  
  ensureLogDir();
  cleanupOldLogs();
  
  info('日志系统已初始化', { config: { level: config.level, outputDir: config.outputDir } });
}

export default {
  init,
  error,
  warn,
  info,
  debug,
  setLevel,
  enable,
  getConfig,
  loadConfig,
};
