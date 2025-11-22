// app/api/mindmaps/[date]/route.ts
import { NextResponse } from 'next/server';
import { MindMapService } from '../../../../../lib/services/mindmap.service';
import { withAuth } from '../../../../../lib/api/middleware';

// 初始化 Service
const mindMapService = new MindMapService();

// GET /api/mindmaps/[date]
// 使用 withAuth 保護這個 API
export const GET = withAuth(async (req, { params, user }) => {
  const date = params.date;

  // 呼叫 Service Layer
  const data = await mindMapService.getMindMapByDate(user.id, date);

  // 回傳結果
  return NextResponse.json({
    data: data,
    // 如果 data 是 null，代表這天還沒建立心智圖，前端可以顯示空白狀態
  });
});
