'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MindMapNode as MindMapNodeType } from '../types';

// 預設寬度常數
const DEFAULT_WIDTH = 200; // 預設開始斷行的寬度
const MIN_WIDTH = 60; // 最小寬度
const MAX_WIDTH = 600; // 最大寬度

interface MindMapNodeProps {
  node: MindMapNodeType;
  isSelected: boolean;
  editRequested: boolean;
  onSelect: (nodeId: string, multiSelect: boolean) => void;
  onMouseDown: (nodeId: string, event: React.MouseEvent) => void;
  onContentChange: (nodeId: string, content: string) => void;
  onDoubleClick: (nodeId: string) => void;
  onSizeChange: (
    nodeId: string,
    size: { width: number; height: number }
  ) => void;
  onWidthChange?: (nodeId: string, width: number) => void;
  onCancelNode: (nodeId: string) => void;
  onEditComplete: () => void;
  zoom: number;
}

export const MindMapNode: React.FC<MindMapNodeProps> = ({
  node,
  isSelected,
  editRequested,
  onSelect,
  onMouseDown,
  onContentChange,
  onDoubleClick,
  onSizeChange,
  onCancelNode,
  onWidthChange,
  onEditComplete,
  zoom,
}: MindMapNodeProps) => {
  // 新節點（空內容）自動進入編輯模式 - 直接在初始狀態設定
  const [isEditing, setIsEditing] = useState(() => node.content === '');
  const [editContent, setEditContent] = useState(node.content);
  const [isResizing, setIsResizing] = useState(false);
  // null 表示使用自動寬度 (fit-content)
  // 只有當用戶手動拖拉調整過寬度後，才會設定固定寬度
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const resizeStartRef = useRef<{ x: number; width: number } | null>(null);

  // 自動調整 textarea 高度
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, editContent]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // 當收到編輯請求時進入編輯模式 (Command + Enter)
  // 直接在 render 時判斷並更新狀態，避免在 useEffect 中同步調用 setState
  if (editRequested && !isEditing) {
    setIsEditing(true);
  }

  useEffect(() => {
    if (editRequested) {
      onEditComplete();
    }
  }, [editRequested, onEditComplete]);

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

  // Resize 拖拉處理
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setIsResizing(true);
      const currentWidth =
        customWidth ?? nodeRef.current?.offsetWidth ?? DEFAULT_WIDTH;
      resizeStartRef.current = { x: e.clientX, width: currentWidth };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!resizeStartRef.current) return;
        const delta = (moveEvent.clientX - resizeStartRef.current.x) / zoom;
        const newWidth = Math.max(
          MIN_WIDTH,
          Math.min(MAX_WIDTH, resizeStartRef.current.width + delta)
        );
        setCustomWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        if (onWidthChange && customWidth !== null) {
          onWidthChange(node.id, customWidth);
        }
        resizeStartRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [customWidth, zoom, node.id, onWidthChange]
  );

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
    // 編輯結束後，確保節點保持選取狀態
    onSelect(node.id, false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 如果正在進行 IME 組合輸入（例如中文選字），則不處理 Enter 鍵
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // 如果是新節點（原內容為空）且編輯內容也為空，則取消新增
      if (node.content === '' && editContent.trim() === '') {
        setIsEditing(false);
        onCancelNode(node.id);
      } else {
        handleBlur();
      }
    } else if (e.key === 'Tab') {
      // 如果是新節點（原內容為空）且編輯內容也為空，則取消新增
      if (node.content === '' && editContent.trim() === '') {
        e.preventDefault();
        setIsEditing(false);
        onCancelNode(node.id);
      }
      // 如果有內容，讓 Tab 正常觸發（會在 MindMapEditor 中處理創建新子節點）
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

  // 計算當前應該顯示的文字內容
  const displayContent = isEditing ? editContent : node.content;

  return (
    <div
      ref={nodeRef}
      data-node-id={node.id}
      data-zoom={zoom}
      className="absolute select-none flex flex-col group"
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        width: customWidth !== null ? `${customWidth}px` : 'fit-content',
        minWidth: `${MIN_WIDTH}px`,
        maxWidth: `${MAX_WIDTH}px`,
        minHeight: '32px',
        transform: 'scale(1)',
        transformOrigin: 'top left',
        transition: isResizing
          ? 'none'
          : 'top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        willChange: 'top, left, transform',
        pointerEvents: 'auto',
        cursor: isResizing ? 'ew-resize' : 'move',
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDownCapture={handleMouseDownCapture}
    >
      <div
        className="w-full flex-1 flex items-start justify-center transition-all duration-200 relative"
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
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
        }}
      >
        {/* 隱藏的測量元素 - 用於撐開容器寬度和高度 */}
        <span
          ref={measureRef}
          className="min-w-[1em] invisible whitespace-pre-wrap block"
          style={{
            fontSize: `${node.style.fontSize}px`,
            fontWeight: node.style.fontWeight,
            lineHeight: '1.5',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
          aria-hidden="true"
        >
          {/* 加上 \u00A0 確保空行和換行後的新行都能正確計算高度 */}
          {(displayContent || '') + '\u00A0'}
        </span>

        {/* 編輯區域或顯示區域 - 絕對定位覆蓋在測量元素上 */}
        <div
          className="absolute inset-0 flex items-start"
          style={{ padding: `${node.style.padding}px` }}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full h-full resize-none outline-none bg-transparent"
              style={{
                color: node.style.textColor,
                fontSize: `${node.style.fontSize}px`,
                fontWeight: node.style.fontWeight,
                lineHeight: '1.5',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
              }}
            />
          ) : (
            <div
              className="w-full"
              style={{
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap',
                lineHeight: '1.5',
              }}
            >
              {node.content}
            </div>
          )}
        </div>
      </div>

      {/* Resize Handle - 右側拖拉調整寬度 */}
      {isSelected && (
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 hover:bg-blue-400/30 transition-opacity"
          style={{
            transform: 'translateX(50%)',
          }}
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
};
