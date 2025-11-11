/**
 * Recently Deleted 頁面
 * 路由: /recently-deleted
 */

'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Trash2, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
import {
  useMockGetDeletedTopics,
  useMockGetDeletedNodes,
  useMockGetDeletedMindMaps,
  useMockRestoreTopic,
  useMockPermanentDeleteTopic,
} from '@/__mocks__/hooks';

/**
 * 已刪除 Topic 的型別
 */
interface DeletedTopic {
  id: string;
  name: string;
  deletedAt: Date;
}

/**
 * 已刪除 Node 的型別
 */
interface DeletedNode {
  id: string;
  label: string;
  deletedAt: Date;
}

/**
 * 已刪除 MindMap 的型別
 */
interface DeletedMindMap {
  id: string;
  title: string;
  deletedAt: Date;
}

export default function RecentlyDeletedPage() {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmDeleteType, setConfirmDeleteType] = useState<
    'topic' | 'node' | 'mindmap' | null
  >(null);

  // ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
  const { data: deletedTopics, refetch: refetchTopics } =
    useMockGetDeletedTopics();
  const { data: deletedNodes, refetch: refetchNodes } =
    useMockGetDeletedNodes();
  const { data: deletedMindMaps, refetch: refetchMindMaps } =
    useMockGetDeletedMindMaps();

  // ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
  const restoreTopicMutation = useMockRestoreTopic();
  const permanentDeleteTopicMutation = useMockPermanentDeleteTopic();

  /**
   * 復原項目
   * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
   */
  const handleRestore = async (
    type: 'topic' | 'node' | 'mindmap',
    id: string
  ) => {
    try {
      switch (type) {
        case 'topic':
          // ⚠️ 假資料：模擬復原 Topic，實際應呼叫 restoreTopicMutation.mutateAsync()
          await restoreTopicMutation.mutate({ topicId: id });
          refetchTopics?.();
          break;
        case 'node':
          // TODO: 實作復原 Node
          console.log('Restore node:', id);
          refetchNodes?.();
          break;
        case 'mindmap':
          // TODO: 實作復原 MindMap
          console.log('Restore mindmap:', id);
          refetchMindMaps?.();
          break;
      }
    } catch (error) {
      console.error('Failed to restore:', error);
    }
  };

  /**
   * 永久刪除
   * ⚠️ 目前使用假資料 Hook，待後端 API 完成後需替換為真實 API
   */
  const handlePermanentDelete = async (
    type: 'topic' | 'node' | 'mindmap',
    id: string
  ) => {
    try {
      switch (type) {
        case 'topic':
          // ⚠️ 假資料：模擬永久刪除 Topic，實際應呼叫 permanentDeleteTopicMutation.mutateAsync()
          await permanentDeleteTopicMutation.mutate({ topicId: id });
          refetchTopics?.();
          break;
        case 'node':
          // TODO: 實作永久刪除 Node
          console.log('Permanent delete node:', id);
          refetchNodes?.();
          break;
        case 'mindmap':
          // TODO: 實作永久刪除 MindMap
          console.log('Permanent delete mindmap:', id);
          refetchMindMaps?.();
          break;
      }

      setConfirmDeleteId(null);
      setConfirmDeleteType(null);
    } catch (error) {
      console.error('Failed to delete permanently:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">最近刪除</h1>
        <p className="text-sm text-gray-600 mt-2">
          項目將在 30 天後自動永久刪除
        </p>
      </div>

      <Tabs defaultValue="topics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="topics">
            Topics ({deletedTopics?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="nodes">
            Nodes ({deletedNodes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="mindmaps">
            MindMaps ({deletedMindMaps?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Topics Tab */}
        <TabsContent value="topics" className="space-y-4">
          {!deletedTopics || deletedTopics.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              沒有已刪除的 Topics
            </div>
          ) : (
            deletedTopics.map((topic) => (
              <Card key={topic.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{topic.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      刪除於{' '}
                      {format(topic.deletedAt, 'yyyy/MM/dd HH:mm', {
                        locale: zhTW,
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore('topic', topic.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      復原
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setConfirmDeleteId(topic.id);
                        setConfirmDeleteType('topic');
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      永久刪除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Nodes Tab */}
        <TabsContent value="nodes" className="space-y-4">
          {!deletedNodes || deletedNodes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              沒有已刪除的 Nodes
            </div>
          ) : (
            deletedNodes.map((node) => (
              <Card key={node.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{node.label}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      刪除於{' '}
                      {format(node.deletedAt, 'yyyy/MM/dd HH:mm', {
                        locale: zhTW,
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore('node', node.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      復原
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setConfirmDeleteId(node.id);
                        setConfirmDeleteType('node');
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      永久刪除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* MindMaps Tab */}
        <TabsContent value="mindmaps" className="space-y-4">
          {!deletedMindMaps || deletedMindMaps.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              沒有已刪除的 MindMaps
            </div>
          ) : (
            deletedMindMaps.map((mindmap) => (
              <Card key={mindmap.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <h3 className="font-semibold">{mindmap.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      刪除於{' '}
                      {format(mindmap.deletedAt, 'yyyy/MM/dd HH:mm', {
                        locale: zhTW,
                      })}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore('mindmap', mindmap.id)}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      復原
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setConfirmDeleteId(mindmap.id);
                        setConfirmDeleteType('mindmap');
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      永久刪除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* 確認永久刪除 Dialog */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={() => {
          setConfirmDeleteId(null);
          setConfirmDeleteType(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              確認永久刪除
            </AlertDialogTitle>
            <AlertDialogDescription>
              此操作無法復原，確定要永久刪除嗎？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDeleteId && confirmDeleteType) {
                  handlePermanentDelete(confirmDeleteType, confirmDeleteId);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              永久刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
