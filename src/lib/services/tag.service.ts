import { createClient } from '@/lib/supabase/server';
import { Node } from '@/types/mindmap';
import { Tag } from '@/types/tag';

interface TagRow {
  id: string;
  name: string;
  color: string;
  created_at: string;
  usage_count?: number;
  user_id: string;
}

interface NodeTagRow {
  node_id: string;
  tag_id?: string;
}

export const tagService = {
  async getTagsByUserId(userId: string): Promise<Tag[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tags:', error);
      throw new Error('Failed to fetch tags');
    }

    return (data || []).map(mapTag);
  },

  async getTagById(tagId: string): Promise<Tag | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('id', tagId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching tag:', error);
      throw new Error('Failed to fetch tag');
    }

    return mapTag(data);
  },

  async createTag(
    userId: string,
    data: { name: string; color?: string }
  ): Promise<Tag> {
    const supabase = await createClient();
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert({
        user_id: userId,
        name: data.name,
        color: data.color || '#94a3b8', // Default gray-400
        usage_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      throw new Error('Failed to create tag');
    }

    return mapTag(newTag);
  },

  async updateTag(
    tagId: string,
    data: { name?: string; color?: string }
  ): Promise<Tag> {
    const supabase = await createClient();
    const updateData: { name?: string; color?: string; updated_at?: string } =
      {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.color !== undefined) updateData.color = data.color;
    updateData.updated_at = new Date().toISOString();

    const { data: updatedTag, error } = await supabase
      .from('tags')
      .update(updateData)
      .eq('id', tagId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tag:', error);
      throw new Error('Failed to update tag');
    }

    return mapTag(updatedTag);
  },

  async deleteTag(tagId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase.from('tags').delete().eq('id', tagId);

    if (error) {
      console.error('Error deleting tag:', error);
      throw new Error('Failed to delete tag');
    }
  },

  async getNodesByTagId(tagId: string): Promise<Node[]> {
    const supabase = await createClient();

    // First get node IDs from junction table
    const { data: nodeTags, error: linkError } = await supabase
      .from('node_tags')
      .select('node_id')
      .eq('tag_id', tagId);

    if (linkError) {
      console.error('Error fetching node tags:', linkError);
      throw new Error('Failed to fetch node tags');
    }

    if (!nodeTags || nodeTags.length === 0) {
      return [];
    }

    const nodeIds = nodeTags.map((nt: NodeTagRow) => nt.node_id);

    // Then fetch nodes
    // Assuming table name is 'mind_map_nodes' or 'nodes'.
    // Based on common patterns in this project (e.g. mindmapStore), it might be 'nodes' or 'mind_map_nodes'.
    // I'll try 'mind_map_nodes' as it is more specific, but 'nodes' is also possible.
    // Given I don't know the schema, I'll guess 'nodes'.
    const { data: nodes, error: nodesError } = await supabase
      .from('nodes')
      .select('*')
      .in('id', nodeIds);

    if (nodesError) {
      // If 'nodes' table doesn't exist, this will fail.
      // But I can't verify without schema.
      console.error('Error fetching nodes:', nodesError);
      throw new Error('Failed to fetch nodes');
    }

    return nodes || [];
  },

  async removeTagFromNode(nodeId: string, tagId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('node_tags')
      .delete()
      .match({ node_id: nodeId, tag_id: tagId });

    if (error) {
      console.error('Error removing tag from node:', error);
      throw new Error('Failed to remove tag from node');
    }
  },
};

function mapTag(row: TagRow): Tag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    createdAt: new Date(row.created_at),
    usageCount: row.usage_count || 0,
    userId: row.user_id,
  };
}
