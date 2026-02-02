/**
 * 用户输入模块 - 处理用户交互和数据验证
 */

import path from 'path';
import { fileURLToPath } from 'url';
import { COLORS, BROWSER_NAMES, printMenuItem, printConfirmation, getBrowserConfig, formatUrl } from './constants.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harsDir = path.join(__dirname, '../../hars');

/**
 * 验证并格式化 URL
 */
export { formatUrl };

/**
 * 生成 HAR 文件路径
 */
export function generateHarPath(browserName, customFileName = null) {
  if (customFileName) {
    return path.join(harsDir, customFileName);
  }
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '-');
  const fileName = `recording-${timestamp}-${browserName}.har`;
  return path.join(harsDir, fileName);
}

/**
 * 显示步骤标题
 */
export function showStepTitle(stepNum, title) {
  console.log(`${COLORS.YELLOW}[${stepNum}] ${title}${COLORS.RESET}`);
}

/**
 * 显示浏览器菜单
 */
export function showBrowserMenu() {
  Object.entries(BROWSER_NAMES).forEach((entry, index) => {
    const num = index + 1;
    printMenuItem(num, entry[1]);
  });
}

/**
 * 显示确认信息
 */
export { printConfirmation as showConfirmation };

/**
 * 获取浏览器配置
 */
export { getBrowserConfig };

/**
 * 获取 HAR 目录
 */
export function getHarDir() {
  return harsDir;
}
