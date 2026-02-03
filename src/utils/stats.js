/**
 * HAR 文件统计模块 - 处理 HAR 文件的解析和统计
 */

import fs from 'fs';
import { COLORS, SEPARATOR, printTitle, printWarning } from './constants.js';

/**
 * 获取资源类型
 */
function getResourceType(mimeType) {
  if (!mimeType) return 'other';
  if (mimeType.includes('text/html')) return 'html';
  if (mimeType.includes('text/css')) return 'css';
  if (mimeType.includes('javascript')) return 'js';
  if (mimeType.includes('image')) return 'image';
  if (mimeType.includes('font')) return 'font';
  if (mimeType.includes('video')) return 'video';
  if (mimeType.includes('audio')) return 'audio';
  return 'other';
}

/**
 * 计算性能指标 - 优化版本
 */
function calculateMetrics(entries) {
  const metrics = {
    totalRequests: entries.length,
    totalSize: 0,
    totalTime: 0,
    successCount: 0,
    failedCount: 0,
    resourceTypes: {},
    statusCodes: {},
    timings: {
      blocked: 0,
      dns: 0,
      connect: 0,
      send: 0,
      wait: 0,
      receive: 0,
    },
    slowestRequests: [],
    largestResources: [],
    domainStats: {},
  };

  // 使用堆来追踪top 5最慢和最大的资源，而不是全部保存
  const slowestHeap = [];
  const largestHeap = [];
  const HEAP_SIZE = 5;

  entries.forEach((entry) => {
    const time = entry.time || 0;
    const size = entry.response.content.size || 0;
    const status = entry.response.status;
    const url = entry.request.url;
    const mimeType = entry.response.content.mimeType;

    // 基本统计
    metrics.totalSize += size;
    metrics.totalTime += time;

    if (status >= 400) {
      metrics.failedCount++;
    } else if (status >= 200 && status < 300) {
      metrics.successCount++;
    }

    // 资源类型统计
    const resourceType = getResourceType(mimeType);
    if (!metrics.resourceTypes[resourceType]) {
      metrics.resourceTypes[resourceType] = { count: 0, size: 0 };
    }
    metrics.resourceTypes[resourceType].count++;
    metrics.resourceTypes[resourceType].size += size;

    // 状态码统计
    if (!metrics.statusCodes[status]) {
      metrics.statusCodes[status] = 0;
    }
    metrics.statusCodes[status]++;

    // 时间分解统计
    const timings = entry.timings || {};
    metrics.timings.blocked += timings.blocked || 0;
    metrics.timings.dns += timings.dns || 0;
    metrics.timings.connect += timings.connect || 0;
    metrics.timings.send += timings.send || 0;
    metrics.timings.wait += timings.wait || 0;
    metrics.timings.receive += timings.receive || 0;

    // 域名统计
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      if (!metrics.domainStats[domain]) {
        metrics.domainStats[domain] = { count: 0, size: 0, time: 0 };
      }
      metrics.domainStats[domain].count++;
      metrics.domainStats[domain].size += size;
      metrics.domainStats[domain].time += time;
    } catch (e) {
      // 忽略无效 URL
    }

    // 高效地维护top 5最慢请求
    const slowRequest = {
      url: url.substring(0, 60),
      time: time,
      size: size,
      status: status,
    };
    if (slowestHeap.length < HEAP_SIZE || time > slowestHeap[0].time) {
      slowestHeap.push(slowRequest);
      slowestHeap.sort((a, b) => a.time - b.time);
      if (slowestHeap.length > HEAP_SIZE) slowestHeap.shift();
    }

    // 高效地维护top 5最大资源
    const largeResource = {
      url: url.substring(0, 60),
      size: size,
      time: time,
      status: status,
    };
    if (largestHeap.length < HEAP_SIZE || size > largestHeap[0].size) {
      largestHeap.push(largeResource);
      largestHeap.sort((a, b) => a.size - b.size);
      if (largestHeap.length > HEAP_SIZE) largestHeap.shift();
    }
  });

  // 转换堆为数组并反向排序
  metrics.slowestRequests = slowestHeap.reverse();
  metrics.largestResources = largestHeap.reverse();

  return metrics;
}

/**
 * 显示 HAR 文件统计信息
 */
export function showHARStats(harPath) {
  if (!fs.existsSync(harPath)) {
    console.error(`${COLORS.GREEN}[!] HAR 文件保存失败${COLORS.RESET}`);
    return;
  }

  const stats = fs.statSync(harPath);
  const fileSizeKB = (stats.size / 1024).toFixed(2);

  console.log('');
  printTitle('[+] 录制完成！');
  console.log(`${COLORS.YELLOW}[->] 文件信息:${COLORS.RESET}`);
  console.log(`  [*] 位置: ${harPath}`);
  console.log(`  [*] 大小: ${fileSizeKB} KB`);
  console.log('');

  try {
    // 优化：减少内存占用，如果文件过大则使用适应性读取
    const MAX_MEMORY_SIZE = 50 * 1024 * 1024; // 50MB
    let harContent;
    
    if (stats.size > MAX_MEMORY_SIZE) {
      // 大文件采用分块处理
      console.warn(`${COLORS.YELLOW}[*] 检测到大型HAR文件 (${fileSizeKB}KB)，使用流式处理...${COLORS.RESET}\n`);
      harContent = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
    } else {
      // 小文件直接读取
      harContent = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
    }
    
    const entries = harContent.log.entries;
    const metrics = calculateMetrics(entries);

    // 基本网络统计
    printWarning('网络统计:');
    console.log(`  [*] 总请求数: ${metrics.totalRequests}`);
    console.log(`  [*] 成功请求: ${metrics.successCount}`);
    if (metrics.failedCount > 0) {
      console.log(`  [!] 失败请求: ${metrics.failedCount}`);
    }
    console.log(`  [*] 成功率: ${((metrics.successCount / metrics.totalRequests) * 100).toFixed(2)}%`);
    console.log('');

    // 性能时间统计
    printWarning('性能时间:');
    console.log(`  [*] 总加载时间: ${(metrics.totalTime / 1000).toFixed(2)} 秒`);
    console.log(`  [*] 平均响应时间: ${(metrics.totalTime / metrics.totalRequests / 1000).toFixed(3)} 秒`);
    console.log(`  [*] 等待时间: ${(metrics.timings.wait / 1000).toFixed(2)} 秒`);
    console.log(`  [*] 接收时间: ${(metrics.timings.receive / 1000).toFixed(2)} 秒`);
    console.log('');

    // 数据量统计
    printWarning('数据流量:');
    console.log(`  [*] 总数据量: ${(metrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  [*] 平均请求大小: ${(metrics.totalSize / metrics.totalRequests / 1024).toFixed(2)} KB`);
    console.log('');

    // 资源类型分布
    printWarning('资源类型分布:');
    Object.entries(metrics.resourceTypes).forEach(([type, data]) => {
      const percentage = ((data.count / metrics.totalRequests) * 100).toFixed(1);
      console.log(`  [*] ${type.toUpperCase()}: ${data.count} 个 (${percentage}%) - ${(data.size / 1024).toFixed(2)} KB`);
    });
    console.log('');

    // 状态码分布
    printWarning('HTTP 状态码分布:');
    Object.entries(metrics.statusCodes)
      .sort((a, b) => a[0] - b[0])
      .forEach(([status, count]) => {
        const percentage = ((count / metrics.totalRequests) * 100).toFixed(1);
        console.log(`  [*] ${status}: ${count} 个 (${percentage}%)`);
      });
    console.log('');

    // 最慢的请求
    printWarning('最慢的请求 (Top 5):');
    metrics.slowestRequests.forEach((req, index) => {
      console.log(`  ${index + 1}. ${req.url} (${(req.time / 1000).toFixed(3)}s)`);
    });
    console.log('');

    // 最大的资源
    printWarning('最大的资源 (Top 5):');
    metrics.largestResources.forEach((res, index) => {
      console.log(`  ${index + 1}. ${res.url} (${(res.size / 1024).toFixed(2)} KB)`);
    });
    console.log('');

    // 域名分析
    const topDomains = Object.entries(metrics.domainStats)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5);
    
    if (topDomains.length > 0) {
      printWarning('主要域名 (Top 5):');
      topDomains.forEach(([domain, data]) => {
        console.log(`  [*] ${domain}: ${data.count} 个请求 - ${(data.time / 1000).toFixed(2)}s`);
      });
      console.log('');
    }

    printWarning('下一步可以：');
    console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 将 HAR 文件导入 JMeter 进行性能测试`);
    console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 使用 HAR 文件进行离线回放测试`);
    console.log(`  ${COLORS.CYAN}[*]${COLORS.RESET} 分析网络性能和进行对比`);
    console.log('');
    console.log(COLORS.CYAN + SEPARATOR + COLORS.RESET);
    console.log('');
  } catch (error) {
    console.warn(`${COLORS.GREEN}[!] 无法解析 HAR 文件统计信息${COLORS.RESET}\n`);
  }
}
