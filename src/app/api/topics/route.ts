import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { topicService } from '@/lib/services/topic.service';

/**
 * GET /api/topics
 * 取得當前使用者的所有 Topics
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'all' | 'pinned' | 'regular'

    let topics;

    switch (type) {
      case 'pinned':
        topics = await topicService.getPinnedTopics(user.id);
        break;
      case 'regular':
        topics = await topicService.getRegularTopics(user.id);
        break;
      default:
        topics = await topicService.getTopicsByUserId(user.id);
    }

    return NextResponse.json({ data: topics, success: true });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics', success: false },
      { status: 500 }
    );
  }
});
