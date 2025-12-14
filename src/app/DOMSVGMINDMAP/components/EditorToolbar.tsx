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
  onZoomIn,
  onZoomOut,
  zoom,
}) => {
  return (
    <div className="absolute top-4 left-4 flex items-center bg-white rounded-full shadow-md px-2 py-1 gap-1 z-10">
      {/* 視圖切換按鈕組 */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onViewModeChange('mindmap')}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            viewMode === 'mindmap'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="心智圖視圖"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <circle cx="4" cy="6" r="2" />
            <circle cx="20" cy="6" r="2" />
            <circle cx="4" cy="18" r="2" />
            <circle cx="20" cy="18" r="2" />
            <line x1="9.5" y1="10" x2="5.5" y2="7" />
            <line x1="14.5" y1="10" x2="18.5" y2="7" />
            <line x1="9.5" y1="14" x2="5.5" y2="17" />
            <line x1="14.5" y1="14" x2="18.5" y2="17" />
          </svg>
        </button>
        <button
          onClick={() => onViewModeChange('outline')}
          className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
            viewMode === 'outline'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="大綱列表視圖"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </button>
      </div>

      {/* 分隔線 */}
      <div className="w-px h-6 bg-gray-300 mx-2" />

      {/* 縮放控制 */}
      <div className="flex items-center gap-3 px-2">
        <button
          onClick={onZoomOut}
          className="text-gray-600 hover:text-gray-900 transition-colors text-xl font-light"
          title="縮小 (Ctrl + -)"
        >
          −
        </button>

        <span className="text-gray-700 text-sm font-medium min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={onZoomIn}
          className="text-gray-600 hover:text-gray-900 transition-colors text-xl font-light"
          title="放大 (Ctrl + +)"
        >
          +
        </button>
      </div>
    </div>
  );
};
