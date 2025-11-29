import { useCallback } from 'react';

interface UseNodeSelectionOptions {
  selectedNodeIds: string[];
  onSelectionChange: (nodeIds: string[]) => void;
}

interface UseNodeSelectionReturn {
  handleNodeClick: (nodeId: string, event: React.MouseEvent) => void;
  handleCanvasClick: () => void;
  selectAll: (nodeIds: string[]) => void;
  clearSelection: () => void;
}

export function useNodeSelection(
  options: UseNodeSelectionOptions
): UseNodeSelectionReturn {
  const { selectedNodeIds, onSelectionChange } = options;

  const handleNodeClick = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      const isMultiSelect = event.shiftKey || event.metaKey || event.ctrlKey;

      if (isMultiSelect) {
        // 多選模式：切換選取狀態
        if (selectedNodeIds.includes(nodeId)) {
          onSelectionChange(selectedNodeIds.filter((id) => id !== nodeId));
        } else {
          onSelectionChange([...selectedNodeIds, nodeId]);
        }
      } else {
        // 單選模式：替換選取
        onSelectionChange([nodeId]);
      }
    },
    [selectedNodeIds, onSelectionChange]
  );

  const handleCanvasClick = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  const selectAll = useCallback(
    (nodeIds: string[]) => {
      onSelectionChange(nodeIds);
    },
    [onSelectionChange]
  );

  const clearSelection = useCallback(() => {
    onSelectionChange([]);
  }, [onSelectionChange]);

  return {
    handleNodeClick,
    handleCanvasClick,
    selectAll,
    clearSelection,
  };
}
