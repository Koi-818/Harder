#!/usr/bin/env node

/**
 * 交互式 HAR 录制工具 (Playwright)
 * 
 * 功能：
 * - 交互式选择浏览器、目标 URL、输出文件
 * - 自动检测浏览器关闭，无需手动按 Enter
 * - 支持 Chrome、Edge、Firefox
 * - 记录完整的 HAR 格式网络日志
 * 
 * 用法:
 *   npm start
 *   npm run record
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// 导入模块
import { displayStartupAnimation, showFeatureMenu, showOperationTips, showLoadingAnimation } from './utils/ui.js';
import { launchBrowser, createRecordingContext, navigateToUrl, detectBrowserClose } from './utils/browser.js';
import { showHARStats } from './utils/har-parser.js';
import { showStepTitle, showBrowserMenu, getHarDir, generateHarPath } from './utils/input.js';
import { COLORS, MESSAGES, formatUrl, printConfirmation, printError, delay } from './utils/constants.js';
import { init, info, warn, error as logError, debug } from './utils/logger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harsDir = getHarDir();

// 确保 hars 目录存在
if (!fs.existsSync(harsDir)) {
  fs.mkdirSync(harsDir, { recursive: true });
}

// 初始化日志系统
init();
info('应用启动', { version: '2.0.0', harsDir });

/**
 * 创建 readline 接口用于获取用户输入
 */
function createReadlineInterface() {
  debug('创建 readline 接口');
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * 提示用户输入并返回答案
 */
function prompt(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 获取用户输入信息
 */
async function getUserInput(rl) {
  info('开始获取用户输入');
  
  // 获取目标网址
  showStepTitle(1, '输入目标网址');
  const targetURL = await prompt(rl, `  ${COLORS.CYAN}>${COLORS.RESET} 网址 (例：example.com 或 https://example.com): `);

  if (!targetURL.trim()) {
    printError(MESSAGES.NO_URL_ERROR);
    logError('用户未输入网址');
    rl.close();
    process.exit(1);
  }

  const url = formatUrl(targetURL);
  printConfirmation('目标网址', url);
  debug('目标网址已格式化', { url });

  // 选择浏览器
  showStepTitle(2, '选择浏览器');
  showBrowserMenu();
  const browserChoice = await prompt(rl, `  ${COLORS.CYAN}>${COLORS.RESET} 请选择 (1-3, 默认：1): `);
  
  const { getBrowserConfig } = await import('./utils/constants.js');
  const browserConfig = getBrowserConfig(browserChoice);
  printConfirmation('已选择', browserConfig.name.toUpperCase());
  info('浏览器选择', { browser: browserConfig.name });

  // 获取 HAR 文件名
  showStepTitle(3, '设置输出文件');
  const fileName = await prompt(rl, `  ${COLORS.CYAN}>${COLORS.RESET} HAR 文件名 (按 Enter 使用默认名称): `);

  const harPath = generateHarPath(browserConfig.name, fileName.trim() || null);
  const harFileName = path.basename(harPath);
  printConfirmation('文件路径', harFileName);
  debug('HAR 文件路径生成', { harPath });

  info('用户输入完成', { url, browser: browserConfig.name, harPath });

  return { url, browserConfig, harPath };
}

/**
 * 启动浏览器并开始录制
 */
async function startRecording(browserConfig, harPath, url) {
  info('开始录制', { browser: browserConfig.name, url });
  
  console.log(`${COLORS.CYAN}[*] ${MESSAGES.STARTING_BROWSER}${COLORS.RESET}`);
  await showLoadingAnimation();

  debug('启动浏览器', { config: browserConfig });
  const browser = await launchBrowser(browserConfig.name, browserConfig.channel);
  const context = await createRecordingContext(browser, harPath);
  const page = await context.newPage();

  console.log(`${COLORS.CYAN}[*] ${MESSAGES.LOADING_PAGE}${COLORS.RESET}`);
  await showLoadingAnimation();
  console.log('');

  debug('导航到目标 URL', { url });
  await navigateToUrl(page, url);

  showOperationTips();

  // 等待浏览器关闭
  info('等待浏览器关闭');
  await detectBrowserClose(browser, page, context);

  // 等待一小段时间确保文件完全写入
  await delay(500);

  // 验证并显示统计信息
  info('显示 HAR 统计信息');
  showHARStats(harPath);

  info('录制完成', { harPath });
  process.exit(0);
}

/**
 * 主函数
 */
async function main() {
  const rl = createReadlineInterface();

  try {
    // 显示启动动画和菜单
    await displayStartupAnimation();
    showFeatureMenu();

    // 获取用户输入
    const { url, browserConfig, harPath } = await getUserInput(rl);

    // 关闭 readline，开始录制
    rl.close();

    // 启动浏览器录制
    await startRecording(browserConfig, harPath, url);
  } catch (error) {
    logError(`执行失败：${error.message}`, { stack: error.stack });
    printError(`执行失败：${error.message}`);
    rl.close();
    process.exit(1);
  }
}

/**
 * 处理进程信号（Ctrl+C）
 */
process.on('SIGINT', () => {
  warn('用户中断操作 (SIGINT)');
  console.log(`\n\n${COLORS.GREEN}[!] ${MESSAGES.USER_INTERRUPTED}${COLORS.RESET}`);
  process.exit(0);
});

process.on('SIGTERM', () => {
  warn('进程终止信号 (SIGTERM)');
  process.exit(0);
});

// 运行主函数
main().catch((error) => {
  logError(`未捕获的错误：${error.message}`, { stack: error.stack });
  printError(`执行失败：${error.message}`);
  process.exit(1);
});
