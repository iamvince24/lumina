import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  // 節點操作
  onAddSibling?: () => void; // Enter
  onAddChild?: () => void; // Tab
  onDelete?: () => void; // Delete / Backspace
  onEdit?: () => void; // F2

  // 導航
  onMoveUp?: () => void; // Arrow Up
  onMoveDown?: () => void; // Arrow Down
  onMoveLeft?: () => void; // Arrow Left
  onMoveRight?: () => void; // Arrow Right

  // 編輯
  onUndo?: () => void; // Cmd/Ctrl + Z
  onRedo?: () => void; // Cmd/Ctrl + Shift + Z
  onSelectAll?: () => void; // Cmd/Ctrl + A

  // 主題
  onSetTopic?: () => void; // Cmd/Ctrl + T

  // 狀態
  enabled?: boolean;
  isEditing?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig): void {
  const {
    onAddSibling,
    onAddChild,
    onDelete,
    onEdit,
    onMoveUp,
    onMoveDown,
    onMoveLeft,
    onMoveRight,
    onUndo,
    onRedo,
    onSelectAll,
    onSetTopic,
    enabled = true,
    isEditing = false,
  } = config;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 編輯模式下只處理 Escape
      if (isEditing) {
        return;
      }

      const { key, metaKey, ctrlKey, shiftKey } = event;
      const isMod = metaKey || ctrlKey;

      // 節點操作
      if (key === 'Enter' && !isMod) {
        event.preventDefault();
        onAddSibling?.();
        return;
      }

      if (key === 'Tab' && !isMod) {
        event.preventDefault();
        onAddChild?.();
        return;
      }

      if (key === 'Delete' || key === 'Backspace') {
        event.preventDefault();
        onDelete?.();
        return;
      }

      if (key === 'F2') {
        event.preventDefault();
        onEdit?.();
        return;
      }

      // 導航
      if (key === 'ArrowUp') {
        event.preventDefault();
        onMoveUp?.();
        return;
      }

      if (key === 'ArrowDown') {
        event.preventDefault();
        onMoveDown?.();
        return;
      }

      if (key === 'ArrowLeft') {
        event.preventDefault();
        onMoveLeft?.();
        return;
      }

      if (key === 'ArrowRight') {
        event.preventDefault();
        onMoveRight?.();
        return;
      }

      // 編輯快捷鍵
      if (isMod && key === 'z' && !shiftKey) {
        event.preventDefault();
        onUndo?.();
        return;
      }

      if (isMod && key === 'z' && shiftKey) {
        event.preventDefault();
        onRedo?.();
        return;
      }

      if (isMod && key === 'a') {
        event.preventDefault();
        onSelectAll?.();
        return;
      }

      // 主題
      if (isMod && key === 't' && !shiftKey) {
        event.preventDefault();
        onSetTopic?.();
        return;
      }
    },
    [
      isEditing,
      onAddSibling,
      onAddChild,
      onDelete,
      onEdit,
      onMoveUp,
      onMoveDown,
      onMoveLeft,
      onMoveRight,
      onUndo,
      onRedo,
      onSelectAll,
      onSetTopic,
    ]
  );

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
