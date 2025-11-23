'use server';

import { tagService } from '@/lib/services/tag.service';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Helper to get authenticated user
 */
async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error('Unauthorized');
  }

  return user;
}

/**
 * Get all tags for the current user
 */
export async function getTagsAction() {
  try {
    const user = await getAuthUser();
    const tags = await tagService.getTagsByUserId(user.id);
    return { success: true, data: tags };
  } catch (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: 'Failed to fetch tags' };
  }
}

/**
 * Get a specific tag by ID
 */
export async function getTagByIdAction(tagId: string) {
  try {
    const user = await getAuthUser();
    const tag = await tagService.getTagById(tagId);

    if (!tag) {
      return { success: false, error: 'Tag not found' };
    }

    // Security check: ensure tag belongs to user
    if (tag.userId !== user.id) {
      return { success: false, error: 'Unauthorized' };
    }

    return { success: true, data: tag };
  } catch (error) {
    console.error('Error fetching tag:', error);
    return { success: false, error: 'Failed to fetch tag' };
  }
}

/**
 * Create a new tag
 */
export async function createTagAction(data: { name: string; color?: string }) {
  try {
    const user = await getAuthUser();
    const newTag = await tagService.createTag(user.id, data);

    revalidatePath('/tags');
    revalidatePath('/all-tags'); // In case old path is still used
    return { success: true, data: newTag };
  } catch (error) {
    console.error('Error creating tag:', error);
    return { success: false, error: 'Failed to create tag' };
  }
}

/**
 * Update an existing tag
 */
export async function updateTagAction(
  tagId: string,
  data: { name?: string; color?: string }
) {
  try {
    const user = await getAuthUser();

    // Verify ownership
    const existingTag = await tagService.getTagById(tagId);
    if (!existingTag || existingTag.userId !== user.id) {
      return { success: false, error: 'Unauthorized or Tag not found' };
    }

    const updatedTag = await tagService.updateTag(tagId, data);

    revalidatePath('/tags');
    revalidatePath(`/tags/${tagId}`);
    return { success: true, data: updatedTag };
  } catch (error) {
    console.error('Error updating tag:', error);
    return { success: false, error: 'Failed to update tag' };
  }
}

/**
 * Delete a tag
 */
export async function deleteTagAction(tagId: string) {
  try {
    const user = await getAuthUser();

    // Verify ownership
    const existingTag = await tagService.getTagById(tagId);
    if (!existingTag || existingTag.userId !== user.id) {
      return { success: false, error: 'Unauthorized or Tag not found' };
    }

    await tagService.deleteTag(tagId);

    revalidatePath('/tags');
    return { success: true };
  } catch (error) {
    console.error('Error deleting tag:', error);
    return { success: false, error: 'Failed to delete tag' };
  }
}

/**
 * Get nodes by tag ID
 */
export async function getNodesByTagIdAction(tagId: string) {
  try {
    const user = await getAuthUser();

    // Verify ownership of the tag first
    const tag = await tagService.getTagById(tagId);
    if (!tag || tag.userId !== user.id) {
      return { success: false, error: 'Unauthorized or Tag not found' };
    }

    const nodes = await tagService.getNodesByTagId(tagId);
    return { success: true, data: nodes };
  } catch (error) {
    console.error('Error fetching nodes by tag:', error);
    return { success: false, error: 'Failed to fetch nodes' };
  }
}

/**
 * Remove a tag from a node
 */
export async function removeTagFromNodeAction(nodeId: string, tagId: string) {
  try {
    const user = await getAuthUser();

    // Verify ownership (check if tag belongs to user)
    const tag = await tagService.getTagById(tagId);
    if (!tag || tag.userId !== user.id) {
      return { success: false, error: 'Unauthorized or Tag not found' };
    }

    await tagService.removeTagFromNode(nodeId, tagId);

    revalidatePath(`/tags/${tagId}`);
    return { success: true };
  } catch (error) {
    console.error('Error removing tag from node:', error);
    return { success: false, error: 'Failed to remove tag from node' };
  }
}
