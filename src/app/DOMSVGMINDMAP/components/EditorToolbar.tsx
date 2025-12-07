'use client';

import React from 'react';
import { ViewMode } from '../types';

interface EditorToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onAddNode: () => void;
  onAutoLayout: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onExport: () => void;
  zoom: number;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  viewMode,
  onViewModeChange,
  onAddNode,
  onAutoLayout,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onExport,
  zoom,
}) => {
  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-10">
      {/* 視圖切換按鈕組 */}
      <div className="flex bg-gray-100 rounded-lg p-0.5">
        <button
          onClick={() => onViewModeChange('outline')}
          className={`px-3 py-2 rounded-md transition-colors ${
            viewMode === 'outline'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="大綱列表視圖"
        >
          📄
        </button>
        <button
          onClick={() => onViewModeChange('mindmap')}
          className={`px-3 py-2 rounded-md transition-colors ${
            viewMode === 'mindmap'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-200'
          }`}
          title="心智圖視圖"
        >
          🔗
        </button>
      </div>

      <div className="w-px bg-gray-300" />

      <button
        onClick={onAddNode}
        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        title="新增節點 (Tab)"
      >
        ➕ 新增
      </button>

      <button
        onClick={onAutoLayout}
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        title="自動排版"
      >
        📐 排版
      </button>

      <div className="w-px bg-gray-300" />

      <button
        onClick={onZoomOut}
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        title="縮小 (Ctrl + -)"
      >
        🔍−
      </button>

      <span className="px-3 py-2 bg-gray-50 rounded text-sm flex items-center">
        {Math.round(zoom * 100)}%
      </span>

      <button
        onClick={onZoomReset}
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        title="重置縮放 (Ctrl + 0)"
      >
        1:1
      </button>

      <button
        onClick={onZoomIn}
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        title="放大 (Ctrl + +)"
      >
        🔍+
      </button>

      <div className="w-px bg-gray-300" />

      <button
        onClick={onExport}
        className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
        title="匯出"
      >
        💾 匯出
      </button>
    </div>
  );
};
