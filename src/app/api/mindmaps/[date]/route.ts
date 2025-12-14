// app/api/mindmaps/[date]/route.ts
import { NextResponse } from 'next/server';
import { MindMapService } from '@/lib/services/mindmap.service';
import { withAuth } from '@/lib/api/middleware';
import type { MindMap, Node, Edge } from '@/types/mindmap';

// 初始化 Service
const mindMapService = new MindMapService();

// 定義資料庫返回的資料結構型別
interface DbNodeTag {
  createdAt: Date;
  nodeId: string;
  tagId: string;
  tag: {
    id: string;
    name: string;
    userId: string;
    createdAt: Date;
    color: string | null;
  };
}

interface DbTopic {
  id: string;
  name: string;
  color: string | null;
}

interface DbNode {
  id: string;
  mindMapId: string;
  content: string;
  positionX: number;
  positionY: number;
  isTopic: boolean;
  topicId: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags?: DbNodeTag[];
  topic?: DbTopic | null;
}

interface DbMindMapData {
  id: string;
  userId: string;
  date: string;
  createdAt: Date;
  updatedAt: Date;
  nodes: DbNode[];
}

/**
 * 將數據庫格式轉換為前端 MindMap 格式
 */
function transformDbToMindMap(dbData: DbMindMapData): MindMap {
  // 轉換 nodes
  const nodes: Node[] = dbData.nodes.map((dbNode: DbNode) => {
    // 處理 tags（從關聯表獲取）
    const tags =
      dbNode.tags?.map((nodeTag: DbNodeTag) => ({
        id: nodeTag.tag.id,
        name: nodeTag.tag.name,
        color: nodeTag.tag.color ?? '#6B7280', // 預設顏色
      })) || [];

    // 處理 topic color
    const color = dbNode.topic?.color ?? undefined;

    return {
      id: dbNode.id,
      type: dbNode.isTopic ? 'topic' : 'custom',
      position: {
        x: dbNode.positionX,
        y: dbNode.positionY,
      },
      data: {
        label: dbNode.content,
        isTopic: dbNode.isTopic,
        topicId: dbNode.topicId ?? undefined,
        color,
        tags: tags.length > 0 ? tags : undefined,
        createdAt: dbNode.createdAt,
        updatedAt: dbNode.updatedAt,
      },
      ...(dbNode.parentId && { parentNode: dbNode.parentId }),
    };
  });

  // 根據 parentId 關係生成 edges
  const edges: Edge[] = dbData.nodes
    .filter((dbNode: DbNode) => dbNode.parentId)
    .map((dbNode: DbNode) => ({
      id: `edge_${dbNode.parentId}_${dbNode.id}`,
      source: dbNode.parentId!,
      target: dbNode.id,
    }));

  return {
    id: dbData.id,
    title: `心智圖 ${dbData.date}`,
    date: new Date(dbData.date),
    nodes,
    edges,
    createdAt: dbData.createdAt,
    updatedAt: dbData.updatedAt,
    userId: dbData.userId,
  };
}

// GET /api/mindmaps/[date]
// 使用 withAuth 保護這個 API
export const GET = withAuth(async (req, { params, user }) => {
  try {
    if (!params?.date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    const date = params.date;

    // 呼叫 Service Layer
    const dbData = await mindMapService.getMindMapByDate(user.id, date);

    // 如果沒有資料，回傳 null
    if (!dbData) {
      return NextResponse.json({
        data: null,
      });
    }

    // 轉換數據格式
    const mindMap = transformDbToMindMap(dbData);

    // 回傳結果
    return NextResponse.json({
      data: mindMap,
    });
  } catch (error) {
    console.error('MindMap API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch mindmap',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
