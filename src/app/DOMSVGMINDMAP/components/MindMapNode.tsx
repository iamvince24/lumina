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
  zoom,
}: MindMapNodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
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

      const { width, height } = entry.contentRect;
      onSizeChange(node.id, { width, height });
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
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditContent(node.content);
      setIsEditing(false);
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
      className="absolute cursor-move select-none"
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
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onMouseDownCapture={handleMouseDownCapture}
    >
      <div
        className="w-full h-full flex items-center justify-center transition-all duration-200"
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
            className="w-full h-full resize-none outline-none bg-transparent"
            style={{
              color: node.style.textColor,
              fontSize: `${node.style.fontSize}px`,
              fontWeight: node.style.fontWeight,
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
