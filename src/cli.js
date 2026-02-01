#!/usr/bin/env node

/**
 * 交互式 HAR 录制工具 (Playwright)
 * 
 * 功能：
 * - 交互式选择浏览器、目标URL、输出文件
 * - 自动检测浏览器关闭，无需手动按 Enter
 * - 支持 Chrome、Edge、Firefox
 * - 记录完整的 HAR 格式网络日志
 * 
 * 用法:
 *   npm start
 *   npm run record
 */

import { chromium, firefox } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import readline from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harsDir = path.join(__dirname, '../hars');

// 确保 hars 目录存在
if (!fs.existsSync(harsDir)) {
  fs.mkdirSync(harsDir, { recursive: true });
}

// 创建 readline 接口用于获取用户输入
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * 提示用户输入并返回答案
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * 显示启动动画
 */
async function displayStartupAnimation() {
  const logo = [
    '    ██╗  ██╗ █████╗ ██████╗ ██████╗ ███████╗██████╗',
    '    ██║  ██║██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔══██╗',
    '    ███████║███████║██████╔╝██║  ██║█████╗  ██████╔╝',
    '    ██╔══██║██╔══██║██╔══██╗██║  ██║██╔══╝  ██╔══██╗',
    '    ██║  ██║██║  ██║██║  ██║██████╔╝███████╗██║  ██║',
    '    ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝  ╚═╝',
  ];

  const colors = [
    '\x1b[38;5;51m',  // 青色
    '\x1b[38;5;87m',  // 浅青
    '\x1b[38;5;123m', // 蓝色
    '\x1b[38;5;117m', // 浅蓝
    '\x1b[38;5;111m', // 中蓝
    '\x1b[38;5;81m',  // 深青
  ];

  const reset = '\x1b[0m';

  // 逐行显示动画
  for (let i = 0; i < logo.length; i++) {
    const line = logo[i];
    const color = colors[i % colors.length];
    process.stdout.write(color + line + reset);
    process.stdout.write('\n');
    await new Promise((resolve) => setTimeout(resolve, 80));
  }

  // 显示副标题
  await new Promise((resolve) => setTimeout(resolve, 200));
  console.log('\x1b[38;5;226m' + '═'.repeat(60) + reset);
  console.log(
    '\x1b[38;5;226m' +
      '  [+] HAR 网络流量录制工具  |  Playwright 自动化  ' +
      reset
  );
  console.log('\x1b[38;5;226m' + '═'.repeat(60) + reset);
  console.log('');
}

/**
 * 启动交互式 HAR 录制
 */
async function main() {
  // 显示启动动画
  await displayStartupAnimation();

  // 显示菜单
  console.log('\x1b[38;5;48m[→] 功能特性:\x1b[0m');
  console.log(
    '  \x1b[38;5;51m■\x1b[0m 交互式浏览器选择和 URL 输入'
  );
  console.log('  \x1b[38;5;51m■\x1b[0m 自动检测浏览器关闭（无需手动）');
  console.log('  \x1b[38;5;51m■\x1b[0m 支持 Chrome、Edge、Firefox');
  console.log('  \x1b[38;5;51m■\x1b[0m 完整的网络请求录制和统计');
  console.log('');

  try {
    // 获取用户输入
    console.log('\x1b[38;5;226m[1] 输入目标网址\x1b[0m');
    const targetURL = await prompt(
      '  \x1b[38;5;51m>\x1b[0m 网址 (例: example.com 或 https://example.com): '
    );

    if (!targetURL.trim()) {
      console.error('\x1b[38;5;196m[×] 网址不能为空\x1b[0m');
      rl.close();
      process.exit(1);
    }

    // 验证 URL 格式
    let url = targetURL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log(`  \x1b[38;5;51m[+]\x1b[0m 目标网址: \x1b[38;5;87m${url}\x1b[0m\n`);

    // 选择浏览器
    console.log('\x1b[38;5;226m[2] 选择浏览器\x1b[0m');
    console.log('  \x1b[38;5;51m1\x1b[0m Chrome (默认)');
    console.log('  \x1b[38;5;51m2\x1b[0m Edge');
    console.log('  \x1b[38;5;51m3\x1b[0m Firefox');
    const browserChoice = await prompt(
      '  \x1b[38;5;51m>\x1b[0m 请选择 (1-3, 默认: 1): '
    );

    let browserType = chromium;
    let browserChannel = 'chrome';
    let browserName = 'chrome';

    if (browserChoice === '2') {
      browserType = chromium;
      browserChannel = 'msedge';
      browserName = 'edge';
    } else if (browserChoice === '3') {
      browserType = firefox;
      browserChannel = null;
      browserName = 'firefox';
    }

    console.log(
      `  \x1b[38;5;51m[+]\x1b[0m 已选择: \x1b[38;5;87m${browserName.toUpperCase()}\x1b[0m\n`
    );

    // 获取 HAR 文件名
    console.log('\x1b[38;5;226m[3] 设置输出文件\x1b[0m');
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '-');
    const defaultFileName = `recording-${timestamp}-${browserName}.har`;
    const fileName = await prompt(
      `  \x1b[38;5;51m>\x1b[0m HAR 文件名 (默认: ${defaultFileName}): `
    );

    const harFileName = fileName.trim() || defaultFileName;
    const harPath = path.join(harsDir, harFileName);

    console.log(
      `  \x1b[38;5;51m[+]\x1b[0m 文件路径: \x1b[38;5;87m${harFileName}\x1b[0m\n`
    );

    // 启动浏览器并开始录制
    console.log('\x1b[38;5;51m[*] 正在启动浏览器...\x1b[0m');
    await sleep(500);

    // 为 Chromium 浏览器设置 channel（Chrome 或 Edge）
    const launchOptions = { headless: false };
    if (browserChannel) {
      launchOptions.channel = browserChannel;
    }

    const browser = await browserType.launch(launchOptions);
    const context = await browser.newContext({
      recordHar: {
        path: harPath,
        omitContent: false,
      },
    });

    const page = await context.newPage();

    // 访问目标 URL
    console.log(`\x1b[38;5;51m[*] 正在加载网页...\x1b[0m\n`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      console.warn(`\x1b[38;5;226m[!] 页面加载超时或出错: ${error.message}\x1b[0m`);
      console.warn('继续录制...\n');
    }

    // 关闭 readline，因为不再需要用户交互
    rl.close();

    // 显示提示信息
    console.log('\x1b[38;5;51m' + '═'.repeat(60) + '\x1b[0m');
    console.log(
      '\x1b[38;5;46m[+] 浏览器已打开，录制进行中！\x1b[0m'
    );
    console.log('\x1b[38;5;51m' + '═'.repeat(60) + '\x1b[0m');
    console.log('');
    console.log('\x1b[38;5;226m[→] 您可以执行以下操作：\x1b[0m');
    console.log('  [*] 点击链接、填写表单');
    console.log('  [*] 滚动页面、输入搜索内容');
    console.log('  [*] 进行任何浏览器交互操作');
    console.log('');
    console.log('\x1b[38;5;226m[i] 提示：\x1b[0m');
    console.log('  [*] 所有操作都会被记录到 HAR 文件中');
    console.log('  [*] 关闭浏览器窗口即完成录制');
    console.log('  [*] 无需手动操作，系统会自动检测关闭');
    console.log('');
    console.log('\x1b[38;5;51m' + '═'.repeat(60) + '\x1b[0m');
    console.log('');

    // 等待浏览器关闭 - 自动检测
    await detectBrowserClose(browser, page, context);

    // 等待一小段时间确保文件完全写入
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 验证并显示统计信息
    showHARStats(harPath);

    process.exit(0);
  } catch (error) {
    console.error(`\n\x1b[38;5;196m[×] 错误: ${error.message}\x1b[0m\n`);
    rl.close();
    process.exit(1);
  }
}

/**
 * 睡眠函数
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 检测浏览器关闭事件
 */
async function detectBrowserClose(browser, page, context) {
  console.log('\x1b[38;5;51m[*] 监听浏览器状态...\x1b[0m\n');
  
  let browserClosed = false;
  let checkInterval;
  
  // 事件监听：浏览器断开连接
  const disconnectHandler = () => {
    browserClosed = true;
    console.log('\n\x1b[38;5;51m[+] 检测到浏览器已关闭！\x1b[0m');
  };
  
  // 事件监听：页面/上下文关闭
  const closeHandler = () => {
    browserClosed = true;
    console.log('\n\x1b[38;5;51m[+] 检测到页面已关闭！\x1b[0m');
  };
  
  browser.on('disconnected', disconnectHandler);
  page.on('close', closeHandler);
  context.on('close', closeHandler);
  
  // 定期检查浏览器连接状态
  checkInterval = setInterval(async () => {
    try {
      await page.evaluate(() => 1);
    } catch (error) {
      browserClosed = true;
      console.log('\n\x1b[38;5;51m[+] 检测到浏览器已关闭！\x1b[0m');
      clearInterval(checkInterval);
    }
  }, 500);
  
  // 等待浏览器关闭
  await new Promise((resolve) => {
    const checkClose = setInterval(() => {
      if (browserClosed) {
        clearInterval(checkClose);
        clearInterval(checkInterval);
        resolve();
      }
    }, 100);
  });

  console.log('\x1b[38;5;51m[*] 正在保存 HAR 文件...\x1b[0m');

  // 清理事件监听器
  try {
    browser.removeListener('disconnected', disconnectHandler);
    page.removeListener('close', closeHandler);
    context.removeListener('close', closeHandler);
    clearInterval(checkInterval);
  } catch (error) {
    // 忽略错误
  }

  // 浏览器已关闭，尝试关闭context来完成HAR录制
  try {
    await context.close();
  } catch (error) {
    // 浏览器已关闭，忽略错误
  }
}

/**
 * 显示 HAR 文件统计信息
 */
function showHARStats(harPath) {
  if (!fs.existsSync(harPath)) {
    console.error('\x1b[38;5;196m[×] HAR 文件保存失败\x1b[0m');
    return;
  }

  const stats = fs.statSync(harPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);

  console.log('');
  console.log('\x1b[38;5;51m' + '═'.repeat(60) + '\x1b[0m');
  console.log('\x1b[38;5;46m[+] 录制完成！\x1b[0m');
  console.log('\x1b[38;5;51m' + '═'.repeat(60) + '\x1b[0m');
  console.log('');
  console.log(`\x1b[38;5;226m[→] 文件信息:\x1b[0m`);
  console.log(`  [*] 位置: \x1b[38;5;87m${harPath}\x1b[0m`);
  console.log(`  [*] 大小: \x1b[38;5;87m${fileSizeKB} KB\x1b[0m`);
  console.log('');

  try {
    const harContent = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
    const entries = harContent.log.entries;

    console.log(`\x1b[38;5;226m[→] 网络统计:\x1b[0m`);
    console.log(`  [*] 总请求数: \x1b[38;5;87m${entries.length}\x1b[0m`);

    const totalTime = entries.reduce((sum, e) => sum + (e.time || 0), 0);
    console.log(
      `  [*] 总加载时间: \x1b[38;5;87m${(totalTime / 1000).toFixed(2)} 秒\x1b[0m`
    );

    const totalSize = entries.reduce(
      (sum, e) => sum + (e.response.content.size || 0),
      0
    );
    console.log(
      `  [*] 总数据量: \x1b[38;5;87m${(totalSize / 1024 / 1024).toFixed(2)} MB\x1b[0m`
    );

    // 统计失败的请求
    const failedRequests = entries.filter((e) => e.response.status >= 400);
    if (failedRequests.length > 0) {
      console.log(
        `  [!] 失败请求: \x1b[38;5;196m${failedRequests.length}\x1b[0m`
      );
    }

    console.log('');
    console.log(`\x1b[38;5;226m[→] 下一步可以：\x1b[0m`);
    console.log(`  [*] 将 HAR 文件导入 JMeter 进行性能测试`);
    console.log(`  [*] 使用 HAR 文件进行离线回放测试`);
    console.log(`  [*] 分析网络性能和进行对比`);
    console.log('');
    console.log('\x1b[38;5;51m' + '═'.repeat(60) + '\x1b[0m');
    console.log('');
  } catch (error) {
    console.warn('\x1b[38;5;226m[!] 无法解析 HAR 文件统计信息\x1b[0m\n');
  }
}

// 处理进程信号（Ctrl+C）
process.on('SIGINT', () => {
  console.log('\n\n\x1b[38;5;226m[!] 用户中断操作\x1b[0m');
  rl.close();
  process.exit(0);
});

// 运行主函数
main().catch((error) => {
  console.error(
    `\n\x1b[38;5;196m[×] 执行失败: ${error.message}\x1b[0m\n`
  );
  rl.close();
  process.exit(1);
});

