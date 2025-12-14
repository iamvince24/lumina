'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MindMapNode } from '../types';

interface OutlineListViewProps {
  nodes: Map<string, MindMapNode>;
  rootNodeId: string | null;
  onContentChange: (nodeId: string, content: string) => void;
  onToggleCollapse: (nodeId: string) => void;
  onAddSiblingNode: (nodeId: string) => string | null;
  onIndentNode: (nodeId: string) => void;
  onOutdentNode: (nodeId: string) => void;
  onMoveNodeUp: (nodeId: string) => void;
  onMoveNodeDown: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  focusNodeId: string | null;
  onClearFocusNode: () => void;
}

interface OutlineItemProps {
  node: MindMapNode;
  nodes: Map<string, MindMapNode>;
  depth: number;
  onContentChange: (nodeId: string, content: string) => void;
  onToggleCollapse: (nodeId: string) => void;
  onAddSiblingNode: (nodeId: string) => string | null;
  onIndentNode: (nodeId: string) => void;
  onOutdentNode: (nodeId: string) => void;
  onMoveNodeUp: (nodeId: string) => void;
  onMoveNodeDown: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  focusNodeId: string | null;
  onClearFocusNode: () => void;
  rootNodeId: string | null;
}

const OutlineItem: React.FC<OutlineItemProps> = ({
  node,
  nodes,
  depth,
  onContentChange,
  onToggleCollapse,
  onAddSiblingNode,
  onIndentNode,
  onOutdentNode,
  onMoveNodeUp,
  onMoveNodeDown,
  onSelectNode,
  onDeleteNode,
  focusNodeId,
  onClearFocusNode,
  rootNodeId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // Only track editContent separately when editing; otherwise derive from node.content
  const [localEditContent, setLocalEditContent] = useState(node.content);
  const inputRef = useRef<HTMLInputElement>(null);

  // Track previous focusNodeId to detect focus triggers
  const prevFocusNodeIdRef = useRef(focusNodeId);

  const hasChildren = node.children.length > 0;
  const isCollapsed = node.isCollapsed;

  // Derive editContent: use localEditContent when editing, otherwise use node.content
  const editContent = isEditing ? localEditContent : node.content;

  // Wrapper to update localEditContent
  const setEditContent = useCallback((content: string) => {
    setLocalEditContent(content);
  }, []);

  // Handle focus node trigger - use microtask to defer state updates
  useEffect(() => {
    if (focusNodeId === node.id && prevFocusNodeIdRef.current !== node.id) {
      prevFocusNodeIdRef.current = focusNodeId;
      // Defer state updates to avoid cascading renders
      queueMicrotask(() => {
        setLocalEditContent(node.content);
        setIsEditing(true);
        onClearFocusNode();
      });
    } else if (prevFocusNodeIdRef.current !== focusNodeId) {
      prevFocusNodeIdRef.current = focusNodeId;
    }
  }, [focusNodeId, node.id, node.content, onClearFocusNode]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at end of text
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  // Click to focus and edit (like markdown editor)
  const handleClick = useCallback(() => {
    setLocalEditContent(node.content);
    setIsEditing(true);
    onSelectNode(node.id);
  }, [node.content, node.id, onSelectNode]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (editContent.trim() !== node.content) {
      onContentChange(node.id, editContent.trim());
    }
  }, [editContent, node.content, node.id, onContentChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevent default behaviors and handle custom shortcuts

      // Cmd/Ctrl + Up: Move node up
      if (e.key === 'ArrowUp' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onMoveNodeUp(node.id);
        return;
      }

      // Cmd/Ctrl + Down: Move node down
      if (e.key === 'ArrowDown' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onMoveNodeDown(node.id);
        return;
      }

      // Enter: Save and add sibling node
      if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
        e.preventDefault();
        // Save current content first
        if (editContent.trim() !== node.content) {
          onContentChange(node.id, editContent.trim());
        }
        setIsEditing(false);
        // Add sibling node
        onAddSiblingNode(node.id);
        return;
      }

      // Tab: Indent (become child of previous sibling)
      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        // Save current content first
        if (editContent.trim() !== node.content) {
          onContentChange(node.id, editContent.trim());
        }
        onIndentNode(node.id);
        return;
      }

      // Shift+Tab: Outdent (move to parent level)
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        // Save current content first
        if (editContent.trim() !== node.content) {
          onContentChange(node.id, editContent.trim());
        }
        onOutdentNode(node.id);
        return;
      }

      // Escape: Cancel editing
      if (e.key === 'Escape') {
        setEditContent(node.content);
        setIsEditing(false);
        return;
      }

      // Backspace on empty content: Delete node
      if (
        e.key === 'Backspace' &&
        editContent === '' &&
        node.id !== rootNodeId
      ) {
        e.preventDefault();
        setIsEditing(false);
        onDeleteNode(node.id);
        return;
      }
    },
    [
      editContent,
      node.content,
      node.id,
      rootNodeId,
      onContentChange,
      onAddSiblingNode,
      onIndentNode,
      onOutdentNode,
      onMoveNodeUp,
      onMoveNodeDown,
      onDeleteNode,
      setEditContent,
    ]
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

        {/* 內容 - 點擊即可編輯 */}
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
            onClick={handleClick}
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
              onAddSiblingNode={onAddSiblingNode}
              onIndentNode={onIndentNode}
              onOutdentNode={onOutdentNode}
              onMoveNodeUp={onMoveNodeUp}
              onMoveNodeDown={onMoveNodeDown}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              focusNodeId={focusNodeId}
              onClearFocusNode={onClearFocusNode}
              rootNodeId={rootNodeId}
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
  onAddSiblingNode,
  onIndentNode,
  onOutdentNode,
  onMoveNodeUp,
  onMoveNodeDown,
  onSelectNode,
  onDeleteNode,
  focusNodeId,
  onClearFocusNode,
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
              onAddSiblingNode={onAddSiblingNode}
              onIndentNode={onIndentNode}
              onOutdentNode={onOutdentNode}
              onMoveNodeUp={onMoveNodeUp}
              onMoveNodeDown={onMoveNodeDown}
              onSelectNode={onSelectNode}
              onDeleteNode={onDeleteNode}
              focusNodeId={focusNodeId}
              onClearFocusNode={onClearFocusNode}
              rootNodeId={rootNodeId}
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
