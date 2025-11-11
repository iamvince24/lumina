/**
 * Layout Worker Hook
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { Node, Edge } from '@/types/mindmap';
import type { TreeNode, LayoutDirection } from '@/types/view';
import { calculateTreeLayout } from '@/utils/layoutAlgorithms/d3Tree';

interface UseLayoutWorkerOptions {
  /** Nodes 數量門檻，超過此數量使用 Worker */
  threshold?: number;
}

/**
 * Layout Worker Hook
 */
export function useLayoutWorker(options: UseLayoutWorkerOptions = {}) {
  const { threshold = 200 } = options;

  const workerRef = useRef<Worker | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * 初始化 Worker
   */
  useEffect(() => {
    // 只在瀏覽器環境中建立 Worker
    if (typeof window !== 'undefined') {
      workerRef.current = new Worker(
        new URL('../workers/layoutWorker.ts', import.meta.url),
        { type: 'module' }
      );

      return () => {
        workerRef.current?.terminate();
      };
    }
  }, []);

  /**
   * 計算佈局
   */
  const calculateLayout = useCallback(
    async (
      nodes: Node[],
      edges: Edge[],
      direction: LayoutDirection
    ): Promise<TreeNode[]> => {
      // 如果 nodes 數量小於門檻，直接在主執行緒計算
      if (nodes.length < threshold) {
        return calculateTreeLayout(nodes, edges, { direction });
      }

      // 使用 Worker 計算
      if (!workerRef.current) {
        // Worker 未初始化，回退到主執行緒
        return calculateTreeLayout(nodes, edges, { direction });
      }

      setIsCalculating(true);

      return new Promise((resolve, reject) => {
        const handleMessage = (event: MessageEvent) => {
          const { type, nodes, message } = event.data;

          if (type === 'result') {
            setIsCalculating(false);
            workerRef.current?.removeEventListener('message', handleMessage);
            resolve(nodes as TreeNode[]);
          } else if (type === 'error') {
            setIsCalculating(false);
            workerRef.current?.removeEventListener('message', handleMessage);
            reject(new Error(message));
          }
        };

        workerRef.current?.addEventListener('message', handleMessage);

        workerRef.current?.postMessage({
          type: 'calculate',
          nodes,
          edges,
          direction,
        });
      });
    },
    [threshold]
  );

  return {
    calculateLayout,
    isCalculating,
  };
}
