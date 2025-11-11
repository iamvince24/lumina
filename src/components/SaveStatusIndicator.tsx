/**
 * 儲存狀態指示器
 * 顯示當前的儲存狀態
 */

'use client';

import { useSaveStatusStore } from '@/stores/saveStatusStore';
import { Check, Cloud, CloudOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale/zh-TW';

/**
 * 儲存狀態指示器組件
 */
export function SaveStatusIndicator() {
  const { status, errorMessage, lastSavedAt } = useSaveStatusStore();

  /**
   * 根據狀態渲染不同的 UI
   */
  const renderStatus = () => {
    switch (status) {
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="w-4 h-4" />
            <span>已儲存</span>
            {lastSavedAt && (
              <span className="text-gray-500 text-xs">
                {format(lastSavedAt, 'HH:mm', { locale: zhTW })}
              </span>
            )}
          </div>
        );

      case 'saving':
        return (
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>儲存中...</span>
          </div>
        );

      case 'unsaved':
        return (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Cloud className="w-4 h-4" />
            <span>未儲存</span>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <CloudOff className="w-4 h-4" />
            <span>儲存失敗</span>
            {errorMessage && <span className="text-xs">({errorMessage})</span>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed top-4 right-4 px-4 py-2 bg-white rounded-lg shadow-md border border-gray-200 z-50">
      {renderStatus()}
    </div>
  );
}
