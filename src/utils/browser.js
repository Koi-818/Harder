/**
 * 浏览器控制模块 - 处理 Playwright 浏览器操作
 */

import { chromium, firefox } from 'playwright';
import { COLORS, MESSAGES, printInfo, printSuccess } from './constants.js';

/**
 * 获取浏览器实例
 */
export async function launchBrowser(browserName, channel = null) {
  const launchOptions = { headless: false };
  
  const browserType = browserName === 'firefox' ? firefox : chromium;
  
  if (channel && browserName !== 'firefox') {
    launchOptions.channel = channel;
  }

  return await browserType.launch(launchOptions);
}

/**
 * 创建录制上下文
 */
export async function createRecordingContext(browser, harPath) {
  return await browser.newContext({
    recordHar: {
      path: harPath,
      omitContent: false,
    },
  });
}

/**
 * 访问URL
 */
export async function navigateToUrl(page, url) {
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    return true;
  } catch (error) {
    console.warn(`${COLORS.YELLOW}[!] ${MESSAGES.PAGE_LOAD_TIMEOUT}: ${error.message}${COLORS.RESET}`);
    console.warn(`${MESSAGES.CONTINUING}\n`);
    return false;
  }
}

/**
 * 检测浏览器关闭
 */
export async function detectBrowserClose(browser, page, context) {
  printInfo(MESSAGES.LISTENING_BROWSER + '\n');
  
  let browserClosed = false;
  let checkInterval;
  
  const setupEventHandlers = () => {
    const disconnectHandler = () => {
      browserClosed = true;
      printSuccess(MESSAGES.BROWSER_CLOSED);
    };
    
    const closeHandler = () => {
      browserClosed = true;
      printSuccess(MESSAGES.BROWSER_CLOSED);
    };
    
    browser.on('disconnected', disconnectHandler);
    page.on('close', closeHandler);
    context.on('close', closeHandler);
    
    return { disconnectHandler, closeHandler };
  };

  const { disconnectHandler, closeHandler } = setupEventHandlers();

  // 定期检查页面是否仍然可用（优化：减少轮询频率以降低CPU使用率）
  checkInterval = setInterval(async () => {
    try {
      await page.evaluate(() => 1);
    } catch (error) {
      browserClosed = true;
      printSuccess(MESSAGES.BROWSER_CLOSED);
      clearInterval(checkInterval);
    }
  }, 1000);  // 从500ms优化到1000ms，减少CPU占用

  // 等待浏览器关闭
  await waitForCondition(() => browserClosed);

  printInfo(MESSAGES.SAVE_HAR);

  // 清理资源
  cleanupBrowserResources(browser, page, context, disconnectHandler, closeHandler, checkInterval);
}

/**
 * 等待条件满足
 */
async function waitForCondition(condition, timeout = 3600000) {
  return new Promise((resolve) => {
    const checkInterval = setInterval(() => {
      if (condition()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
    
    setTimeout(() => {
      clearInterval(checkInterval);
      resolve();
    }, timeout);
  });
}

/**
 * 清理浏览器资源
 */
function cleanupBrowserResources(browser, page, context, disconnectHandler, closeHandler, checkInterval) {
  try {
    browser.removeListener('disconnected', disconnectHandler);
    page.removeListener('close', closeHandler);
    context.removeListener('close', closeHandler);
    clearInterval(checkInterval);
    context.close().catch(() => {});
  } catch (error) {
    // 忽略清理错误
  }
}
