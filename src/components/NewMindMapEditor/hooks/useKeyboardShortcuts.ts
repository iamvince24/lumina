import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  onDelete?: () => void;
  onDuplicate?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onNewNode?: () => void;
  onNewSiblingNode?: () => void;
  onEditNode?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onSwitchToMindmap?: () => void;
  onSwitchToOutline?: () => void;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, shiftKey } = event;
      const isModifier = ctrlKey || metaKey;

      // Check if the target is an input element
      const target = event.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Delete
      if ((key === 'Delete' || key === 'Backspace') && !isInputElement) {
        event.preventDefault();
        shortcuts.onDelete?.();
      }

      // Ctrl/Cmd + D: Duplicate
      if (isModifier && key === 'd') {
        event.preventDefault();
        shortcuts.onDuplicate?.();
      }

      // Ctrl/Cmd + Z: Undo
      if (isModifier && key === 'z' && !shiftKey) {
        event.preventDefault();
        shortcuts.onUndo?.();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if (
        (isModifier && key === 'z' && shiftKey) ||
        (isModifier && key === 'y')
      ) {
        event.preventDefault();
        shortcuts.onRedo?.();
      }

      // Ctrl/Cmd + A: Select All (only when not editing text)
      if (isModifier && key === 'a' && !isInputElement) {
        event.preventDefault();
        shortcuts.onSelectAll?.();
      }

      // Ctrl/Cmd + Plus: Zoom In
      if (isModifier && (key === '+' || key === '=')) {
        event.preventDefault();
        shortcuts.onZoomIn?.();
      }

      // Ctrl/Cmd + Minus: Zoom Out
      if (isModifier && (key === '-' || key === '_')) {
        event.preventDefault();
        shortcuts.onZoomOut?.();
      }

      // Ctrl/Cmd + 0: Reset Zoom
      if (isModifier && key === '0') {
        event.preventDefault();
        shortcuts.onZoomReset?.();
      }

      // Ctrl/Cmd + 1: Switch to Mindmap View
      if (isModifier && key === '1') {
        event.preventDefault();
        shortcuts.onSwitchToMindmap?.();
      }

      // Ctrl/Cmd + 2: Switch to Outline View
      if (isModifier && key === '2') {
        event.preventDefault();
        shortcuts.onSwitchToOutline?.();
      }

      // Tab: Create New Node (only when not editing)
      if (key === 'Tab' && !isModifier && !isInputElement) {
        event.preventDefault();
        shortcuts.onNewNode?.();
      }

      // Enter: Create Sibling Node (only when not editing)
      if (key === 'Enter' && !isModifier && !isInputElement) {
        event.preventDefault();
        shortcuts.onNewSiblingNode?.();
      }

      // Ctrl/Cmd + Enter: Edit Node (enter edit mode)
      if (key === 'Enter' && isModifier && !isInputElement) {
        event.preventDefault();
        shortcuts.onEditNode?.();
      }

      if (!isModifier && !isInputElement) {
        if (key === 'ArrowUp') {
          event.preventDefault();
          shortcuts.onArrowUp?.();
        }
        if (key === 'ArrowDown') {
          event.preventDefault();
          shortcuts.onArrowDown?.();
        }
        if (key === 'ArrowLeft') {
          event.preventDefault();
          shortcuts.onArrowLeft?.();
        }
        if (key === 'ArrowRight') {
          event.preventDefault();
          shortcuts.onArrowRight?.();
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
