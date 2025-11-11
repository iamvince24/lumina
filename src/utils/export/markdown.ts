/**
 * Markdown 匯出工具
 */

import type { Node, Edge } from '@/types/mindmap';

/**
 * 將心智圖匯出為 Markdown 格式
 */
export function exportToMarkdown(nodes: Node[], edges: Edge[]): string {
  // 建立 nodeId -> children 的 map
  const childrenMap = new Map<string, Node[]>();

  edges.forEach((edge) => {
    const children = childrenMap.get(edge.source) || [];
    const childNode = nodes.find((n) => n.id === edge.target);

    if (childNode) {
      children.push(childNode);
      childrenMap.set(edge.source, children);
    }
  });

  // 找出所有 root nodes（沒有 incoming edge）
  const rootNodes = nodes.filter(
    (node) => !edges.some((edge) => edge.target === node.id)
  );

  /**
   * 遞迴生成 Markdown
   */
  function generateMarkdown(node: Node, level: number): string {
    const indent = '  '.repeat(level);
    let markdown = `${indent}- ${node.data.label}\n`;

    // 如果有 tags，加上 tags 資訊
    if (node.data.tags && node.data.tags.length > 0) {
      const tagNames = node.data.tags.map((t) => `#${t.name}`).join(' ');
      markdown += `${indent}  ${tagNames}\n`;
    }

    // 處理子節點
    const children = childrenMap.get(node.id) || [];
    children.forEach((child) => {
      markdown += generateMarkdown(child, level + 1);
    });

    return markdown;
  }

  // 生成完整的 Markdown
  let fullMarkdown = '# Mind Map\n\n';

  rootNodes.forEach((rootNode) => {
    fullMarkdown += generateMarkdown(rootNode, 0);
    fullMarkdown += '\n';
  });

  return fullMarkdown.trim();
}

/**
 * 將 Topic 整合視圖匯出為 Markdown
 */
export function exportTopicToMarkdown(
  topicName: string,
  nodes: Node[],
  edges: Edge[]
): string {
  let markdown = `# ${topicName}\n\n`;

  // 按日期分組
  const nodesByDate = new Map<string, Node[]>();

  nodes.forEach((node) => {
    if (node.data.createdAt) {
      const dateStr = new Date(node.data.createdAt).toISOString().split('T')[0];
      const nodesForDate = nodesByDate.get(dateStr) || [];
      nodesForDate.push(node);
      nodesByDate.set(dateStr, nodesForDate);
    }
  });

  // 按日期排序
  const sortedDates = Array.from(nodesByDate.keys()).sort();

  sortedDates.forEach((date) => {
    markdown += `## ${date}\n\n`;

    const nodesForDate = nodesByDate.get(date) || [];
    nodesForDate.forEach((node) => {
      markdown += `- ${node.data.label}\n`;
    });

    markdown += '\n';
  });

  return markdown.trim();
}
