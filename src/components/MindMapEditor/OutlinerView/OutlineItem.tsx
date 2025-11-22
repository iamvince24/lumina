/**
 * Outliner 視圖的單一項目組件
 * 支援編輯、展開/收合、焦點管理
 */

import { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/utils';
import type { OutlineItem as OutlineItemType } from '@/types/view';

interface OutlineItemProps {
  /** 項目資料 */
  item: OutlineItemType;

  /** 是否為焦點項目 */
  isFocused: boolean;

  /** 編輯項目的回調 */
  onEdit: (id: string, newLabel: string) => void;

  /** 切換收合狀態的回調 */
  onToggleCollapse: (id: string) => void;

  /** 聚焦項目的回調 */
  onFocus: (id: string) => void;

  /** 按下 Enter 的回調 */
  onEnter: (id: string) => void;

  /** 按下 Tab 的回調 */
  onTab: (id: string) => void;

  /** 按下 Shift+Tab 的回調 */
  onShiftTab: (id: string) => void;
}

/**
 * Outliner 項目組件
 */
export const OutlineItemComponent = ({
  item,
  isFocused,
  onEdit,
  onToggleCollapse,
  onFocus,
  onEnter,
  onTab,
  onShiftTab,
}: OutlineItemProps) => {
  // 編輯狀態（手動觸發的編輯，如雙擊）
  const [manualEditing, setManualEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.label);

  // Input ref（用於自動 focus）
  const inputRef = useRef<HTMLInputElement>(null);

  // 是否有子項目
  const hasChildren = item.children.length > 0;

  // 是否處於編輯模式：聚焦時自動編輯，或手動觸發編輯
  const isEditing = isFocused || manualEditing;

  /**
   * 當進入編輯模式時，自動 focus input
   */
  useEffect(() => {
    const shouldEdit = isFocused || manualEditing;
    if (shouldEdit && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isFocused, manualEditing]);

  /**
   * 當 item.label 改變且不在編輯模式時，更新 editValue
   */
  useEffect(() => {
    if (!isEditing) {
      // 使用 setTimeout 避免同步 setState
      const timeoutId = setTimeout(() => {
        setEditValue(item.label);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [item.label, isEditing]);

  /**
   * 處理 input blur 事件
   */
  const handleBlur = () => {
    setManualEditing(false);

    // 如果內容有變更，呼叫 onEdit
    if (editValue !== item.label) {
      onEdit(item.id, editValue);
    }
  };

  /**
   * 處理 input 鍵盤事件
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleBlur();
        onEnter(item.id);
        break;

      case 'Tab':
        e.preventDefault();
        handleBlur();

        if (e.shiftKey) {
          onShiftTab(item.id);
        } else {
          onTab(item.id);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setEditValue(item.label); // 恢復原始值
        setManualEditing(false);
        break;
    }
  };

  return (
    <div
      className={cn(
        'group flex items-center py-1 px-2 hover:bg-gray-50 transition-colors',
        isFocused && 'bg-blue-50'
      )}
      style={{
        paddingLeft: `${item.level * 24 + 8}px`, // 根據層級縮排
      }}
      onClick={() => onFocus(item.id)}
    >
      {/* 展開/收合按鈕 */}
      {hasChildren && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(item.id);
          }}
          className="mr-1 p-1 hover:bg-gray-200 rounded transition-colors"
          aria-label={item.isCollapsed ? '展開' : '收合'}
        >
          {item.isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-600" />
          )}
        </button>
      )}

      {/* 如果沒有子項目，保留空間對齊 */}
      {!hasChildren && <div className="w-6" />}

      {/* 項目內容 */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            'flex-1 px-2 py-1 text-sm border-none outline-none bg-transparent',
            item.nodeRef.data.isTopic && 'font-semibold text-blue-600'
          )}
        />
      ) : (
        <div
          className={cn(
            'flex-1 px-2 py-1 text-sm cursor-text',
            item.nodeRef.data.isTopic && 'font-semibold text-blue-600'
          )}
          onDoubleClick={() => setManualEditing(true)}
        >
          {item.label}
        </div>
      )}
    </div>
  );
};
