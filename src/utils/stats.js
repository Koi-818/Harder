/**
 * HAR 文件统计模块 - 向后兼容包装器
 * 
 * 注意：此模块已迁移到 har-parser.js
 * 保留此文件用于向后兼容现有代码
 */

import { parseHAR, calculateMetrics as calcMetrics, formatPerformanceReport, showHARStats as showStats, getResourceType as getType } from './har-parser.js';
import { warn } from './logger.js';

warn('stats.js 已废弃，请使用 har-parser.js');

/**
 * 获取资源类型
 */
export function getResourceType(mimeType) {
  return getType(mimeType);
}

/**
 * 计算性能指标
 */
export function calculateMetrics(entries) {
  return calcMetrics(entries);
}

/**
 * 显示 HAR 文件统计信息
 */
export function showHARStats(harPath) {
  showStats(harPath);
}

/**
 * 解析 HAR 文件
 */
export function parse(harPath) {
  return parseHAR(harPath);
}

/**
 * 格式化性能报告
 */
export function formatReport(metrics, fileSizeKB) {
  return formatPerformanceReport(metrics, fileSizeKB);
}
