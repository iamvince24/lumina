import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/middleware';
import { tagService } from '@/lib/services/tag.service';

/**
 * GET /api/tags
 * 取得當前使用者的所有 Tags
 */
export const GET = withAuth(async (req: NextRequest, { user }) => {
  try {
    const tags = await tagService.getTagsByUserId(user.id);

    return NextResponse.json({ data: tags, success: true });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags', success: false },
      { status: 500 }
    );
  }
});
