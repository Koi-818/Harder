/**
 * HAR 文件解析模块 - 独立的 HAR 文件解析和统计
 * 
 * 功能:
 * - HAR 文件解析
 * - 性能指标计算
 * - 资源类型识别
 * - 统计数据生成
 */

import fs from 'fs';
import { COLORS, printTitle, printWarning } from './constants.js';
import { info, warn, debug, error as logError } from './logger.js';

/**
 * 资源类型映射
 */
const RESOURCE_TYPE_MAP = {
  'text/html': 'html',
  'text/css': 'css',
  'text/javascript': 'js',
  'application/javascript': 'js',
  'application/x-javascript': 'js',
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/svg+xml': 'image',
  'image/webp': 'image',
  'image/avif': 'image',
  'font/woff': 'font',
  'font/woff2': 'font',
  'font/ttf': 'font',
  'font/otf': 'font',
  'video/mp4': 'video',
  'video/webm': 'video',
  'audio/mpeg': 'audio',
  'audio/ogg': 'audio',
};

/**
 * 获取资源类型
 */
export function getResourceType(mimeType) {
  if (!mimeType) return 'other';
  
  const normalizedType = mimeType.split(';')[0].trim().toLowerCase();
  return RESOURCE_TYPE_MAP[normalizedType] || 'other';
}

/**
 * 解析 HAR 文件
 */
export function parseHAR(harPath) {
  try {
    if (!fs.existsSync(harPath)) {
      logError(`HAR 文件不存在：${harPath}`);
      return null;
    }

    const stats = fs.statSync(harPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    
    info('开始解析 HAR 文件', { path: harPath, size: fileSizeKB + ' KB' });

    const MAX_MEMORY_SIZE = 50 * 1024 * 1024;
    let harContent;
    
    if (stats.size > MAX_MEMORY_SIZE) {
      warn(`检测到大型 HAR 文件 (${fileSizeKB}KB)，使用流式处理`);
      harContent = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
    } else {
      harContent = JSON.parse(fs.readFileSync(harPath, 'utf-8'));
    }

    debug('HAR 文件解析成功', { 
      entries: harContent.log.entries?.length,
      version: harContent.log.version
    });

    return {
      log: harContent.log,
      entries: harContent.log.entries || [],
      stats: {
        size: stats.size,
        sizeKB: fileSizeKB,
      }
    };
  } catch (error) {
    logError(`解析 HAR 文件失败：${error.message}`, { path: harPath });
    return null;
  }
}

/**
 * 计算性能指标
 */
export function calculateMetrics(entries) {
  debug('开始计算性能指标', { entriesCount: entries.length });

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

  const slowestHeap = [];
  const largestHeap = [];
  const HEAP_SIZE = 5;

  entries.forEach((entry) => {
    const time = entry.time || 0;
    const size = entry.response?.content?.size || 0;
    const status = entry.response?.status;
    const url = entry.request?.url;
    const mimeType = entry.response?.content?.mimeType;

    metrics.totalSize += size;
    metrics.totalTime += time;

    if (status >= 400) {
      metrics.failedCount++;
    } else if (status >= 200 && status < 300) {
      metrics.successCount++;
    }

    const resourceType = getResourceType(mimeType);
    if (!metrics.resourceTypes[resourceType]) {
      metrics.resourceTypes[resourceType] = { count: 0, size: 0 };
    }
    metrics.resourceTypes[resourceType].count++;
    metrics.resourceTypes[resourceType].size += size;

    if (!metrics.statusCodes[status]) {
      metrics.statusCodes[status] = 0;
    }
    metrics.statusCodes[status]++;

    const timings = entry.timings || {};
    metrics.timings.blocked += timings.blocked || 0;
    metrics.timings.dns += timings.dns || 0;
    metrics.timings.connect += timings.connect || 0;
    metrics.timings.send += timings.send || 0;
    metrics.timings.wait += timings.wait || 0;
    metrics.timings.receive += timings.receive || 0;

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
      debug('忽略无效 URL', { url });
    }

    const slowRequest = {
      url: url?.substring(0, 60) || 'unknown',
      time: time,
      size: size,
      status: status,
    };
    if (slowestHeap.length < HEAP_SIZE || time > slowestHeap[0].time) {
      slowestHeap.push(slowRequest);
      slowestHeap.sort((a, b) => a.time - b.time);
      if (slowestHeap.length > HEAP_SIZE) slowestHeap.shift();
    }

    const largeResource = {
      url: url?.substring(0, 60) || 'unknown',
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

  metrics.slowestRequests = slowestHeap.reverse();
  metrics.largestResources = largestHeap.reverse();

  debug('性能指标计算完成', {
    totalRequests: metrics.totalRequests,
    totalTime: metrics.totalTime,
    totalSize: metrics.totalSize
  });

  return metrics;
}

/**
 * 格式化性能报告
 */
export function formatPerformanceReport(metrics, fileSizeKB) {
  const report = [];

  report.push('');
  report.push(`${COLORS.YELLOW}[->] 文件信息:${COLORS.RESET}`);
  report.push(`  [*] 大小：${fileSizeKB} KB`);
  report.push('');

  report.push(`${COLORS.YELLOW}[->] 网络统计:${COLORS.RESET}`);
  report.push(`  [*] 总请求数：${metrics.totalRequests}`);
  report.push(`  [*] 成功请求：${metrics.successCount}`);
  if (metrics.failedCount > 0) {
    report.push(`  [!] 失败请求：${metrics.failedCount}`);
  }
  report.push(`  [*] 成功率：${((metrics.successCount / metrics.totalRequests) * 100).toFixed(2)}%`);
  report.push('');

  report.push(`${COLORS.YELLOW}[->] 性能时间:${COLORS.RESET}`);
  report.push(`  [*] 总加载时间：${(metrics.totalTime / 1000).toFixed(2)} 秒`);
  report.push(`  [*] 平均响应时间：${(metrics.totalTime / metrics.totalRequests / 1000).toFixed(3)} 秒`);
  report.push(`  [*] 等待时间：${(metrics.timings.wait / 1000).toFixed(2)} 秒`);
  report.push(`  [*] 接收时间：${(metrics.timings.receive / 1000).toFixed(2)} 秒`);
  report.push('');

  report.push(`${COLORS.YELLOW}[->] 数据流量:${COLORS.RESET}`);
  report.push(`  [*] 总数据量：${(metrics.totalSize / 1024 / 1024).toFixed(2)} MB`);
  report.push(`  [*] 平均请求大小：${(metrics.totalSize / metrics.totalRequests / 1024).toFixed(2)} KB`);
  report.push('');

  report.push(`${COLORS.YELLOW}[->] 资源类型分布:${COLORS.RESET}`);
  Object.entries(metrics.resourceTypes).forEach(([type, data]) => {
    const percentage = ((data.count / metrics.totalRequests) * 100).toFixed(1);
    report.push(`  [*] ${type.toUpperCase()}: ${data.count} 个 (${percentage}%) - ${(data.size / 1024).toFixed(2)} KB`);
  });
  report.push('');

  report.push(`${COLORS.YELLOW}[->] HTTP 状态码分布:${COLORS.RESET}`);
  Object.entries(metrics.statusCodes)
    .sort((a, b) => a[0] - b[0])
    .forEach(([status, count]) => {
      const percentage = ((count / metrics.totalRequests) * 100).toFixed(1);
      report.push(`  [*] ${status}: ${count} 个 (${percentage}%)`);
    });
  report.push('');

  report.push(`${COLORS.YELLOW}[->] 最慢的请求 (Top 5):${COLORS.RESET}`);
  metrics.slowestRequests.forEach((req, index) => {
    report.push(`  ${index + 1}. ${req.url} (${(req.time / 1000).toFixed(3)}s)`);
  });
  report.push('');

  report.push(`${COLORS.YELLOW}[->] 最大的资源 (Top 5):${COLORS.RESET}`);
  metrics.largestResources.forEach((res, index) => {
    report.push(`  ${index + 1}. ${res.url} (${(res.size / 1024).toFixed(2)} KB)`);
  });
  report.push('');

  const topDomains = Object.entries(metrics.domainStats)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);
  
  if (topDomains.length > 0) {
    report.push(`${COLORS.YELLOW}[->] 主要域名 (Top 5):${COLORS.RESET}`);
    topDomains.forEach(([domain, data]) => {
      report.push(`  [*] ${domain}: ${data.count} 个请求 - ${(data.time / 1000).toFixed(2)}s`);
    });
    report.push('');
  }

  return report.join('\n');
}

/**
 * 显示 HAR 统计信息（使用新的解析器）
 */
export function showHARStats(harPath) {
  info('显示 HAR 统计信息', { path: harPath });

  const parsed = parseHAR(harPath);
  
  if (!parsed) {
    console.error(`${COLORS.GREEN}[!] HAR 文件解析失败${COLORS.RESET}`);
    return;
  }

  console.log('');
  printTitle('[+] 录制完成！');
  console.log(`${COLORS.YELLOW}[->] 文件信息:${COLORS.RESET}`);
  console.log(`  [*] 位置：${harPath}`);

  const metrics = calculateMetrics(parsed.entries);
  const report = formatPerformanceReport(metrics, parsed.stats.sizeKB);
  console.log(report);

  console.log(`${COLORS.CYAN}${'═'.repeat(60)}${COLORS.RESET}`);
  console.log('');

  info('HAR 统计信息显示完成');
}

export default {
  parseHAR,
  calculateMetrics,
  formatPerformanceReport,
  showHARStats,
  getResourceType,
};
