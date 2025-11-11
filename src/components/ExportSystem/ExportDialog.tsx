/**
 * 匯出 Dialog 組件
 */

'use client';

import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { exportToMarkdown, exportToPrompt } from '@/utils/export';
import type { Node, Edge } from '@/types/mindmap';

interface ExportDialogProps {
  /** 是否開啟 */
  open: boolean;

  /** 關閉回調 */
  onClose: () => void;

  /** 要匯出的 nodes */
  nodes: Node[];

  /** 要匯出的 edges */
  edges: Edge[];

  /** 標題（可選） */
  title?: string;
}

/**
 * 匯出 Dialog 組件
 */
export function ExportDialog({
  open,
  onClose,
  nodes,
  edges,
  title = '心智圖',
}: ExportDialogProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'prompt'>('markdown');
  const [copied, setCopied] = useState(false);

  // 生成匯出內容
  const markdownContent = exportToMarkdown(nodes, edges);
  const promptContent = exportToPrompt(nodes, edges);

  const currentContent =
    activeTab === 'markdown' ? markdownContent : promptContent;

  /**
   * 複製到剪貼簿
   */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentContent);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  /**
   * 下載為檔案
   */
  const handleDownload = () => {
    const extension = activeTab === 'markdown' ? 'md' : 'txt';
    const filename = `${title}_${new Date().toISOString().split('T')[0]}.${extension}`;

    const blob = new Blob([currentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>匯出</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'markdown' | 'prompt')}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="markdown">Markdown</TabsTrigger>
            <TabsTrigger value="prompt">Prompt (AI)</TabsTrigger>
          </TabsList>

          <TabsContent value="markdown" className="space-y-4">
            <p className="text-sm text-gray-600">
              匯出為 Markdown 大綱格式，適合做筆記或文件
            </p>
            <Textarea
              value={markdownContent}
              readOnly
              className="font-mono text-sm h-64"
            />
          </TabsContent>

          <TabsContent value="prompt" className="space-y-4">
            <p className="text-sm text-gray-600">
              匯出為 Prompt 格式，可以直接貼給 AI 分析
            </p>
            <Textarea
              value={promptContent}
              readOnly
              className="font-mono text-sm h-64"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                已複製
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                複製
              </>
            )}
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            下載
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
