'use client';

import React from 'react';

interface NodeToolbarProps {
  onEdit: () => void;
  onDelete: () => void;
  onAddChild: () => void;
  onToggleCollapse: () => void;
  isCollapsed: boolean;
  hasChildren: boolean;
}

export const NodeToolbar: React.FC<NodeToolbarProps> = ({
  onEdit,
  onDelete,
  onAddChild,
  onToggleCollapse,
  isCollapsed,
  hasChildren,
}) => {
  return (
    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-1 flex gap-1 z-20">
      <button
        onClick={onEdit}
        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
        title="編輯"
      >
        ✏️
      </button>

      <button
        onClick={onAddChild}
        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
        title="新增子節點"
      >
        ➕
      </button>

      {hasChildren && (
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title={isCollapsed ? '展開' : '收合'}
        >
          {isCollapsed ? '📂' : '📁'}
        </button>
      )}

      <div className="w-px bg-gray-300" />

      <button
        onClick={onDelete}
        className="p-1.5 hover:bg-red-100 rounded transition-colors text-red-500"
        title="刪除"
      >
        🗑️
      </button>
    </div>
  );
};
