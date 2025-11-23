import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { topicService } from '@/lib/services/topic.service';

/**
 * GET /api/topics/parent-topics
 * 取得父 Topics（parentTopicId 為 null 且有子 topics）
 * 返回包含子 topics 和節點統計的資料
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const parentTopics = await topicService.getParentTopicsWithChildren(
      user.id
    );

    return NextResponse.json({
      data: parentTopics,
      success: true,
    });
  } catch (error) {
    console.error('Error fetching parent topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parent topics', success: false },
      { status: 500 }
    );
  }
});
