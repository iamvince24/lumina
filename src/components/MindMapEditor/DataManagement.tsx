/**
 * 資料管理組件
 * 提供匯出、匯入、清除資料等功能
 */

'use client';

import { useRef, useState } from 'react';
import { Upload, Trash2, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  exportMindMapJSON,
  importMindMapJSON,
  clearMindMap,
  getStorageUsage,
  hasMindMapData,
} from '@/services/localStorage/mindmapStorage';
import { useMindMapStore } from '@/stores/mindmapStore';
import { toast } from 'sonner';

/**
 * 資料管理按鈕組件
 */
export function DataManagement() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState(() => getStorageUsage());
  const loadMindMapData = useMindMapStore((state) => state.loadMindMap);

  /**
   * 處理匯出
   */
  const handleExport = () => {
    try {
      exportMindMapJSON();
      toast.success('匯出成功', {
        description: 'JSON 檔案已下載',
      });
    } catch (error) {
      toast.error('匯出失敗', {
        description: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  };

  /**
   * 處理匯入
   */
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  /**
   * 處理檔案選擇
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const result = await importMindMapJSON(file);

      if (result.success) {
        toast.success('匯入成功', {
          description: '資料已成功匯入',
        });

        // 重新載入資料到 store
        const { loadMindMap } = await import(
          '@/services/localStorage/mindmapStorage'
        );
        const data = loadMindMap();
        loadMindMapData(data.nodes, data.edges);

        // 更新儲存空間資訊
        setStorageInfo(getStorageUsage());
      } else {
        toast.error('匯入失敗', {
          description: result.error || '未知錯誤',
        });
      }
    } catch (error) {
      toast.error('匯入失敗', {
        description: error instanceof Error ? error.message : '未知錯誤',
      });
    }

    // 重置 input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /**
   * 處理清除資料
   */
  const handleClear = () => {
    try {
      clearMindMap();

      // 清空 store
      loadMindMapData([], []);

      // 更新儲存空間資訊
      setStorageInfo(getStorageUsage());

      toast.success('清除成功', {
        description: '所有資料已清除',
      });

      setClearDialogOpen(false);
    } catch (error) {
      toast.error('清除失敗', {
        description: error instanceof Error ? error.message : '未知錯誤',
      });
    }
  };

  /**
   * 更新儲存空間資訊（當下拉選單開啟時）
   */
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setStorageInfo(getStorageUsage());
    }
  };

  const hasData = hasMindMapData();

  return (
    <>
      <DropdownMenu onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <HardDrive className="w-4 h-4 mr-2" />
            資料管理
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>資料管理</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* 儲存空間資訊 */}
          <div className="px-2 py-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>使用空間:</span>
              <span className="font-mono">
                {storageInfo.usedMB} / {storageInfo.estimatedLimitMB} MB
              </span>
            </div>
            <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all"
                style={{ width: `${Math.min(storageInfo.percentage, 100)}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-center">
              {storageInfo.percentage}% 使用中
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* 匯出 */}
          <DropdownMenuItem onClick={handleExport} disabled={!hasData}>
            <Upload className="w-4 h-4 mr-2" />
            匯出 JSON
          </DropdownMenuItem>

          {/* 匯入 */}
          <DropdownMenuItem onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2 rotate-180" />
            匯入 JSON
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* 清除所有資料 */}
          <DropdownMenuItem
            onClick={() => setClearDialogOpen(true)}
            disabled={!hasData}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            清除所有資料
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 隱藏的檔案 input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 清除確認對話框 */}
      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確定要清除所有資料嗎？</AlertDialogTitle>
            <AlertDialogDescription>
              此操作將永久刪除所有心智圖資料，包括所有節點和連接。
              <br />
              <strong>此操作無法復原。</strong>
              <br />
              <br />
              建議在清除前先匯出資料備份。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClear}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              確定清除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
