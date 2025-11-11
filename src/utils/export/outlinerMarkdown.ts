/**
 * Outliner 視圖專用的 Markdown 匯出
 */

import type { OutlineItem } from '@/types/view';

/**
 * 將 Outliner 匯出為 Markdown
 */
export function exportOutlinerToMarkdown(items: OutlineItem[]): string {
  /**
   * 遞迴生成 Markdown
   */
  function generateMarkdown(item: OutlineItem): string {
    const indent = '  '.repeat(item.level);
    let markdown = `${indent}- ${item.label}\n`;

    // 如果有 tags，加上 tags 資訊
    if (item.nodeRef.data.tags && item.nodeRef.data.tags.length > 0) {
      const tagNames = item.nodeRef.data.tags
        .map((t) => `#${t.name}`)
        .join(' ');
      markdown += `${indent}  ${tagNames}\n`;
    }

    // 處理子項目
    item.children.forEach((child) => {
      markdown += generateMarkdown(child);
    });

    return markdown;
  }

  let fullMarkdown = '# Outline\n\n';

  items.forEach((item) => {
    fullMarkdown += generateMarkdown(item);
  });

  return fullMarkdown.trim();
}
