/**
 * Markdown 匯出工具
 * 將 Outline 轉換為 Markdown 格式
 */

import type { OutlineItem } from '@/types/view';

/**
 * 將 Outline 轉換為 Markdown 字串
 *
 * @param items - Outline 項目陣列
 * @returns Markdown 格式的字串
 */
export function outlineToMarkdown(items: OutlineItem[]): string {
  let markdown = '';

  /**
   * 遞迴處理項目，生成 Markdown
   */
  function traverse(item: OutlineItem) {
    // 根據層級決定使用標題還是列表
    if (item.level === 0) {
      // 第一層使用 H1
      markdown += `# ${item.label}\n\n`;
    } else if (item.level === 1) {
      // 第二層使用 H2
      markdown += `## ${item.label}\n\n`;
    } else {
      // 其他層級使用列表
      const indent = '  '.repeat(item.level - 2);
      markdown += `${indent}- ${item.label}\n`;
    }

    // 處理子項目
    item.children.forEach(traverse);
  }

  items.forEach(traverse);

  return markdown.trim();
}

/**
 * 複製 Markdown 到剪貼簿
 *
 * @param markdown - Markdown 字串
 */
export async function copyMarkdownToClipboard(markdown: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(markdown);
  } catch (error) {
    console.error('複製到剪貼簿失敗:', error);
    throw new Error('複製失敗');
  }
}
