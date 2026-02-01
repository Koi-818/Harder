// @ts-check
import { test } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// 获取当前目录
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const harsDir = path.join(__dirname, '../hars');

// 确保 hars 目录存在
if (!fs.existsSync(harsDir)) {
  fs.mkdirSync(harsDir, { recursive: true });
}

test.describe('HAR 录制测试', () => {
  test('录制 Playwright 文档页面', async ({ browser }) => {
    // 创建支持 HAR 录制的上下文
    const harPath = path.join(harsDir, 'playwright-docs.har');
    
    const context = await browser.newContext({
      recordHar: {
        path: harPath,
        omitContent: false,
      },
    });

    const page = await context.newPage();

    // 执行浏览器操作
    console.log('正在访问 Playwright 文档...');
    await page.goto('https://playwright.dev/');
    await page.waitForLoadState('networkidle');

    // 获取页面信息
    const title = await page.title();
    console.log(`页面标题: ${title}`);

    // 关闭上下文以保存 HAR 文件
    await context.close();
    console.log(`HAR 文件已保存到: ${harPath}`);
  });

  test('录制页面交互操作', async ({ browser }) => {
    // 创建支持 HAR 录制的上下文
    const harPath = path.join(harsDir, 'playwright-interaction.har');

    const context = await browser.newContext({
      recordHar: {
        path: harPath,
        omitContent: false,
      },
    });

    const page = await context.newPage();

    // 执行浏览器操作序列
    console.log('正在执行页面交互...');
    await page.goto('https://playwright.dev/');
    await page.waitForLoadState('networkidle');

    // 点击 "Get started" 链接
    const getStartedLink = page.getByRole('link', { name: /Get started/i });
    if (await getStartedLink.isVisible()) {
      await getStartedLink.click();
      await page.waitForLoadState('networkidle');
      console.log('已点击 "Get started" 链接');
    }

    // 返回首页
    await page.goto('https://playwright.dev/');
    await page.waitForLoadState('networkidle');

    // 关闭上下文以保存 HAR 文件
    await context.close();
    console.log(`HAR 文件已保存到: ${harPath}`);
  });

  test('录制搜索操作', async ({ browser }) => {
    // 创建支持 HAR 录制的上下文
    const harPath = path.join(harsDir, 'playwright-search.har');

    const context = await browser.newContext({
      recordHar: {
        path: harPath,
        omitContent: false,
      },
    });

    const page = await context.newPage();

    // 执行搜索操作
    console.log('正在执行搜索操作...');
    await page.goto('https://playwright.dev/');
    await page.waitForLoadState('networkidle');

    // 模拟多个页面交互
    const links = await page.getByRole('link').count();
    console.log(`页面中找到 ${links} 个链接`);

    // 关闭上下文以保存 HAR 文件
    await context.close();
    console.log(`HAR 文件已保存到: ${harPath}`);
  });
});
