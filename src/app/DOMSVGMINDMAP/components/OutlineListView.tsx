'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MindMapNode } from '../types';

interface OutlineListViewProps {
  nodes: Map<string, MindMapNode>;
  rootNodeId: string | null;
  onContentChange: (nodeId: string, content: string) => void;
  onToggleCollapse: (nodeId: string) => void;
}

interface OutlineItemProps {
  node: MindMapNode;
  nodes: Map<string, MindMapNode>;
  depth: number;
  onContentChange: (nodeId: string, content: string) => void;
  onToggleCollapse: (nodeId: string) => void;
}

const OutlineItem: React.FC<OutlineItemProps> = ({
  node,
  nodes,
  depth,
  onContentChange,
  onToggleCollapse,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasChildren = node.children.length > 0;
  const isCollapsed = node.isCollapsed;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = useCallback(() => {
    setEditContent(node.content);
    setIsEditing(true);
  }, [node.content]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editContent.trim() !== node.content) {
      onContentChange(node.id, editContent.trim());
    }
  }, [editContent, node.content, node.id, onContentChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleBlur();
      } else if (e.key === 'Escape') {
        setEditContent(node.content);
        setIsEditing(false);
      }
    },
    [handleBlur, node.content]
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleCollapse(node.id);
    },
    [node.id, onToggleCollapse]
  );

  // 獲取可見的子節點
  const visibleChildren = isCollapsed
    ? []
    : (node.children
        .map((id) => nodes.get(id))
        .filter(Boolean) as MindMapNode[]);

  return (
    <div className="outline-item">
      <div
        className="flex items-center py-1.5 hover:bg-gray-50 rounded transition-colors group"
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        {/* 收合/展開按鈕 */}
        <button
          onClick={handleToggle}
          className={`w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors ${
            hasChildren ? 'cursor-pointer' : 'invisible'
          }`}
          aria-label={isCollapsed ? '展開' : '收合'}
        >
          <span
            className="text-xs transition-transform duration-200"
            style={{
              display: 'inline-block',
              transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            }}
          >
            ▼
          </span>
        </button>

        {/* 項目符號 */}
        <span className="w-2 h-2 rounded-full bg-gray-300 mx-2 flex-shrink-0" />

        {/* 內容 */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-0.5 text-gray-700 bg-white border border-blue-400 rounded outline-none focus:ring-2 focus:ring-blue-200"
          />
        ) : (
          <span
            onDoubleClick={handleDoubleClick}
            className="flex-1 px-2 py-0.5 text-gray-700 cursor-text rounded hover:bg-gray-100"
          >
            {node.content || (
              <span className="text-gray-400 italic">空白節點</span>
            )}
          </span>
        )}
      </div>

      {/* 子節點 - 帶虛線連接 */}
      {visibleChildren.length > 0 && (
        <div
          className="relative"
          style={{
            marginLeft: `${depth * 24 + 10}px`,
            borderLeft: '1px dashed #d1d5db',
          }}
        >
          {visibleChildren.map((childNode) => (
            <OutlineItem
              key={childNode.id}
              node={childNode}
              nodes={nodes}
              depth={1}
              onContentChange={onContentChange}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OutlineListView: React.FC<OutlineListViewProps> = ({
  nodes,
  rootNodeId,
  onContentChange,
  onToggleCollapse,
}) => {
  const rootNode = rootNodeId ? nodes.get(rootNodeId) : null;

  if (!rootNode) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        尚無內容
      </div>
    );
  }

  // 獲取根節點的可見子節點
  const visibleChildren = rootNode.isCollapsed
    ? []
    : (rootNode.children
        .map((id) => nodes.get(id))
        .filter(Boolean) as MindMapNode[]);

  return (
    <div className="flex-1 overflow-auto bg-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* 標題（根節點內容） */}
        <h1 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-200">
          {rootNode.content || 'Knowledge Map'}
        </h1>

        {/* 大綱列表 */}
        <div className="space-y-1">
          {visibleChildren.map((childNode) => (
            <OutlineItem
              key={childNode.id}
              node={childNode}
              nodes={nodes}
              depth={0}
              onContentChange={onContentChange}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>

        {visibleChildren.length === 0 && (
          <div className="text-gray-400 italic py-4">
            尚無子節點。在心智圖視圖中新增節點。
          </div>
        )}
      </div>
    </div>
  );
};
