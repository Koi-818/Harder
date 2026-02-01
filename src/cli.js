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
 * 启动交互式 HAR 录制
 */
async function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║     Playwright 交互式 HAR 录制工具    ║');
  console.log('║      🔄 自动检测浏览器关闭          ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    // 获取用户输入
    const targetURL = await prompt('请输入要访问的网址 (如: https://example.com): ');

    if (!targetURL.trim()) {
      console.error('❌ 网址不能为空');
      rl.close();
      process.exit(1);
    }

    // 验证 URL 格式
    let url = targetURL.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    console.log(`✓ 目标网址: ${url}`);

    // 选择浏览器
    console.log('\n选择浏览器:');
    console.log('  1. Chrome (默认)');
    console.log('  2. Edge');
    console.log('  3. Firefox');
    const browserChoice = await prompt('请选择 (1-3, 默认: 1): ');

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

    console.log(`✓ 已选择: ${browserName}\n`);

    // 获取 HAR 文件名
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '-');
    const defaultFileName = `recording-${timestamp}-${browserName}.har`;
    const fileName = await prompt(`HAR 文件名 (默认: ${defaultFileName}): `);

    const harFileName = fileName.trim() || defaultFileName;
    const harPath = path.join(harsDir, harFileName);

    console.log(`✓ HAR 文件: ${harFileName}\n`);

    // 启动浏览器并开始录制
    console.log('🌐 正在启动浏览器...\n');

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
    console.log(`⏳ 正在加载 ${url}...\n`);
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (error) {
      console.warn(`⚠ 页面加载超时或出错: ${error.message}`);
      console.warn('继续录制...\n');
    }

    // 关闭 readline，因为不再需要用户交互
    rl.close();

    // 显示提示信息
    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ 浏览器已打开，开始录制！');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n📝 现在可以进行以下操作：');
    console.log('  • 点击链接、填写表单');
    console.log('  • 滚动页面、搜索内容');
    console.log('  • 其他任何浏览器交互');
    console.log('\n💡 所有操作都会被记录到 HAR 文件中');
    console.log('🛑 关闭浏览器窗口即可完成录制 (自动检测，无需手动)\n');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 等待浏览器关闭 - 自动检测
    await detectBrowserClose(browser, page, context);

    // 等待一小段时间确保文件完全写入
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 验证并显示统计信息
    showHARStats(harPath);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ 错误: ${error.message}\n`);
    rl.close();
    process.exit(1);
  }
}

/**
 * 检测浏览器关闭事件
 */
async function detectBrowserClose(browser, page, context) {
  console.log('⏳ 监听浏览器状态...\n');
  
  let browserClosed = false;
  let checkInterval;
  
  // 事件监听：浏览器断开连接
  const disconnectHandler = () => {
    browserClosed = true;
    console.log('\n🔔 检测到浏览器已关闭！');
  };
  
  // 事件监听：页面/上下文关闭
  const closeHandler = () => {
    browserClosed = true;
    console.log('\n🔔 检测到页面已关闭！');
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
      console.log('\n🔔 检测到浏览器已关闭！');
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

  console.log('⏳ 正在保存 HAR 文件...');

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
    console.error('❌ HAR 文件保存失败');
    return;
  }

  const stats = fs.statSync(harPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);

  console.log('✅ 录制完成！');
  console.log(`📄 HAR 文件已保存: ${harPath}`);
  console.log(`📊 文件大小: ${fileSizeKB} KB\n`);

  try {
    const harContent = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
    const entries = harContent.log.entries;

    console.log('📈 统计信息:');
    console.log(`  • 总请求数: ${entries.length}`);

    const totalTime = entries.reduce((sum, e) => sum + (e.time || 0), 0);
    console.log(`  • 总加载时间: ${(totalTime / 1000).toFixed(2)} 秒`);

    const totalSize = entries.reduce(
      (sum, e) => sum + (e.response.content.size || 0),
      0
    );
    console.log(`  • 总数据量: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);

    // 统计失败的请求
    const failedRequests = entries.filter((e) => e.response.status >= 400);
    if (failedRequests.length > 0) {
      console.log(`  • 失败请求: ${failedRequests.length}`);
    }

    console.log('\n🎉 可以将此 HAR 文件用于：');
    console.log('  • JMeter 性能测试导入');
    console.log('  • 离线回放测试');
    console.log('  • 性能分析和对比\n');
  } catch (error) {
    console.warn('⚠ 无法解析 HAR 文件统计信息\n');
  }
}

// 处理进程信号（Ctrl+C）
process.on('SIGINT', () => {
  console.log('\n\n⚠ 用户中断...');
  rl.close();
  process.exit(0);
});

// 运行主函数
main().catch((error) => {
  console.error(`\n❌ 执行失败: ${error.message}\n`);
  rl.close();
  process.exit(1);
});

