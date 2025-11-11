/**
 * Prompt 格式匯出工具
 * 用於給 AI 分析或處理
 */

import type { Node, Edge } from '@/types/mindmap';

/**
 * 將心智圖匯出為 Prompt 格式
 */
export function exportToPrompt(nodes: Node[], edges: Edge[]): string {
  let prompt = `以下是一個心智圖的結構化資料，請協助分析：\n\n`;

  // 節點資訊
  prompt += `## 節點列表 (共 ${nodes.length} 個)\n\n`;

  nodes.forEach((node, index) => {
    prompt += `${index + 1}. "${node.data.label}"`;

    if (node.data.isTopic) {
      prompt += ` [Topic]`;
    }

    if (node.data.tags && node.data.tags.length > 0) {
      const tagNames = node.data.tags.map((t) => t.name).join(', ');
      prompt += ` (標籤: ${tagNames})`;
    }

    prompt += `\n`;
  });

  // 關係資訊
  prompt += `\n## 節點關係 (共 ${edges.length} 個連接)\n\n`;

  edges.forEach((edge, index) => {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (sourceNode && targetNode) {
      prompt += `${index + 1}. "${sourceNode.data.label}" → "${targetNode.data.label}"\n`;
    }
  });

  prompt += `\n## 分析任務\n\n`;
  prompt += `請根據以上心智圖內容，提供：\n`;
  prompt += `1. 整體結構分析\n`;
  prompt += `2. 主要主題和子主題\n`;
  prompt += `3. 知識點之間的邏輯關係\n`;
  prompt += `4. 可能的改進建議\n`;

  return prompt;
}

/**
 * 將 Topic 匯出為 Prompt 格式
 */
export function exportTopicToPrompt(
  topicName: string,
  nodes: Node[],
  edges: Edge[]
): string {
  let prompt = `以下是關於「${topicName}」主題的學習記錄：\n\n`;

  // 按日期整理
  const nodesByDate = new Map<string, Node[]>();

  nodes.forEach((node) => {
    if (node.data.createdAt) {
      const dateStr = new Date(node.data.createdAt).toISOString().split('T')[0];
      const nodesForDate = nodesByDate.get(dateStr) || [];
      nodesForDate.push(node);
      nodesByDate.set(dateStr, nodesForDate);
    }
  });

  const sortedDates = Array.from(nodesByDate.keys()).sort();

  sortedDates.forEach((date) => {
    prompt += `## ${date}\n`;

    const nodesForDate = nodesByDate.get(date) || [];
    nodesForDate.forEach((node) => {
      prompt += `- ${node.data.label}\n`;
    });

    prompt += `\n`;
  });

  prompt += `\n請根據以上學習軌跡：\n`;
  prompt += `1. 總結我對「${topicName}」的理解程度\n`;
  prompt += `2. 指出知識體系中的盲點或遺漏\n`;
  prompt += `3. 建議下一步應該學習的內容\n`;

  return prompt;
}
