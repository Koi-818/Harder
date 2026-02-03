/**
 * UI 工具函数 - 处理命令行界面的显示和交互
 */

import { COLORS, SEPARATOR, MESSAGES, printSeparator, getColorArray, delay } from './constants.js';

/**
 * 快速加载动画 - 优化版本（减少延迟）
 */
export async function showLoadingAnimation() {
  const frames = ['|', '/', '-', '\\'];
  for (let i = 0; i < 2; i++) {  // 减少循环次数：3 -> 2
    process.stdout.write(`\r${COLORS.CYAN}${frames[i % frames.length]}${COLORS.RESET}`);
    await delay(30);  // 减少延迟：50ms -> 30ms
  }
  process.stdout.write('\r \r');
}

/**
 * 显示启动动画 - 带有立体感和逐行展开效果（优化版本）
 */
export async function displayStartupAnimation() {
  const shadow = [
    '     ██╗  ██╗ █████╗ ██████╗ ██████╗ ███████╗██████╗ ',
    '     ██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗',
    '     ███████║███████║██████╔╝██║  ██║█████╗  ██████╔╝',
    '     ██╔══██║██╔══██║██╔══██╗██║  ██║██╔══╝  ██╔══██╗',
    '     ██║  ██║██║  ██║██║  ██║██████╔╝███████╗██║  ██║',
    '     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝',
  ];

  const logo = [
    '    ██╗  ██╗ █████╗ ██████╗ ██████╗ ███████╗██████╗',
    '    ██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗',
    '    ███████║███████║██████╔╝██║  ██║█████╗  ██████╔╝',
    '    ██╔══██║██╔══██║██╔══██╗██║  ██║██╔══╝  ██╔══██╗',
    '    ██║  ██║██║  ██║██║  ██║██████╔╝███████╗██║  ██║',
    '    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝',
  ];

  const brightColors = getColorArray();

  // 快速显示阴影层（打造立体效果）
  for (let i = 0; i < shadow.length; i++) {
    console.log(COLORS.SHADOW + shadow[i] + COLORS.RESET);
  }

  // 向上移动光标覆盖阴影（创建浮起效果）
  process.stdout.write('\x1b[6A');

  // 灵动的逐行展开动画（优化：减少延迟）
  for (let i = 0; i < logo.length; i++) {
    const line = logo[i];
    const color = brightColors[i % brightColors.length];
    process.stdout.write(color + line + COLORS.RESET + '\n');
    await delay(25);  // 减少延迟：50ms -> 25ms
  }

  console.log('');
  printSeparator(COLORS.YELLOW);
  console.log(`  ${COLORS.BOLD}${COLORS.YELLOW}${MESSAGES.STARTUP}${COLORS.RESET}`);
  printSeparator(COLORS.YELLOW);
  console.log('');
}

/**
 * 显示功能菜单
 */
export function showFeatureMenu() {
  console.log(`${COLORS.YELLOW}[->] 功能特性:${COLORS.RESET}`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 交互式浏览器选择和 URL 输入`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 自动检测浏览器关闭（无需手动）`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 支持 Chrome、Edge、Firefox`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 完整的网络请求录制和统计`);
  console.log('');
}

/**
 * 显示操作提示
 */
export function showOperationTips() {
  printSeparator(COLORS.CYAN);
  console.log(`${COLORS.GREEN}[+] ${MESSAGES.BROWSER_OPENED}${COLORS.RESET}`);
  printSeparator(COLORS.CYAN);
  console.log('');
  console.log(`${COLORS.YELLOW}[->] 您可以执行以下操作：${COLORS.RESET}`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 点击链接、填写表单`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 滚动页面、输入搜索内容`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 进行任何浏览器交互操作`);
  console.log('');
  console.log(`${COLORS.YELLOW}[i] 提示：${COLORS.RESET}`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 所有操作都会被记录到 HAR 文件中`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 关闭浏览器窗口即完成录制`);
  console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 无需手动操作，系统会自动检测关闭`);
  console.log('');
  printSeparator(COLORS.CYAN);
  console.log('');
}

/**
 * 显示成功完成信息
 */
export function showSuccessMessage(message) {
  console.log(`${COLORS.GREEN}[+] ${message}${COLORS.RESET}`);
}

/**
 * 显示错误信息
 */
export function showErrorMessage(message) {
  console.error(`${COLORS.GREEN}[!] ${message}${COLORS.RESET}`);
}

/**
 * 显示信息文本
 */
export function showInfo(message) {
  console.log(`${COLORS.CYAN}[*] ${message}${COLORS.RESET}`);
}
