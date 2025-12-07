'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MindMapNode as MindMapNodeType } from '../types';

interface MindMapNodeProps {
  node: MindMapNodeType;
  isSelected: boolean;
  onSelect: (nodeId: string, multiSelect: boolean) => void;
  onMouseDown: (nodeId: string, event: React.MouseEvent) => void;
  onContentChange: (nodeId: string, content: string) => void;
  onDoubleClick: (nodeId: string) => void;
  onSizeChange: (
    nodeId: string,
    size: { width: number; height: number }
  ) => void;
  onCancelNode: (nodeId: string) => void;
  zoom: number;
}

export const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isSelected,
  onSelect,
  onMouseDown,
  onContentChange,
  onDoubleClick,
  onSizeChange,
  onCancelNode,
  zoom,
}: MindMapNodeProps) => {
  // 新節點（空內容）自動進入編輯模式 - 直接在初始狀態設定
  const [isEditing, setIsEditing] = useState(() => node.content === '');
  const [editContent, setEditContent] = useState(node.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!nodeRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      // 使用 borderBoxSize 取得包含 padding 和 border 的完整尺寸
      const borderBox = entry.borderBoxSize[0];
      if (borderBox) {
        onSizeChange(node.id, {
          width: borderBox.inlineSize,
          height: borderBox.blockSize,
        });
      } else {
        // Fallback for browsers that don't support borderBoxSize
        const rect = entry.target.getBoundingClientRect();
        onSizeChange(node.id, { width: rect.width, height: rect.height });
      }
    });

    observer.observe(nodeRef.current);
    return () => observer.disconnect();
  }, [node.id, onSizeChange]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id, e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    onDoubleClick(node.id);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (editContent.trim() !== node.content) {
      onContentChange(node.id, editContent.trim() || 'Empty Node');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 如果是新節點（原內容為空）且編輯內容也為空，則取消新增
      if (node.content === '' && editContent.trim() === '') {
        setIsEditing(false);
        onCancelNode(node.id);
      } else {
        handleBlur();
      }
    } else if (e.key === 'Escape') {
      // 如果是新節點（原內容為空）且編輯內容也為空，則取消新增
      if (node.content === '' && editContent.trim() === '') {
        setIsEditing(false);
        onCancelNode(node.id);
      } else {
        // 否則恢復原內容
        setEditContent(node.content);
        setIsEditing(false);
      }
    }
  };

  const handleMouseDownCapture = (e: React.MouseEvent) => {
    if (!isEditing) {
      onMouseDown(node.id, e);
    }
  };

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      data-zoom={zoom}
      className="absolute cursor-move select-none flex flex-col"
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: `${node.size.width}px`,
        minHeight: `${node.size.height}px`,
        transform: 'scale(1)',
        transformOrigin: 'top left',
        transition:
          'top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        willChange: 'top, left, transform',
        pointerEvents: 'auto',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDownCapture={handleMouseDownCapture}
    >
      <div
        className="w-full flex-1 flex items-center justify-center transition-all duration-200"
        style={{
          backgroundColor: node.style.backgroundColor,
          color: node.style.textColor,
          borderColor: isSelected ? '#3b82f6' : 'transparent',
          borderWidth: isSelected
            ? `${Math.max(node.style.borderWidth, 1)}px`
            : '0px',
          borderStyle: 'solid',
          borderRadius: `${node.style.borderRadius}px`,
          padding: `${node.style.padding}px`,
          fontSize: `${node.style.fontSize}px`,
          fontWeight: node.style.fontWeight,
          boxShadow: isSelected ? '0 0 0 3px rgba(59, 130, 246, 0.3)' : 'none',
        }}
      >
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full resize-none outline-none bg-transparent text-center"
            rows={1}
            style={{
              color: node.style.textColor,
              fontSize: `${node.style.fontSize}px`,
              fontWeight: node.style.fontWeight,
              lineHeight: '1.5',
              minHeight: '1.5em',
            }}
          />
        ) : (
          <div className="text-center wrap-break-word w-full">
            {node.content}
          </div>
        )}
      </div>
    </div>
  );
};
