import { memo } from 'react';
import { Group } from '@visx/group';
import type { HierarchyPointLink } from 'd3-hierarchy';
import type { MindMapNodeData, ViewMode } from '@/lib/mindmap/types';
import { getDepthColor } from '@/lib/mindmap/visx';
import { MindMapLink } from './MindMapLink';

interface MindMapLinksProps {
  links: HierarchyPointLink<MindMapNodeData>[];
  viewMode: ViewMode;
}

export const MindMapLinks = memo<MindMapLinksProps>(({ links, viewMode }) => {
  return (
    <Group className="links-layer">
      {links.map((link) => (
        <MindMapLink
          key={`link-${link.source.data.id}-${link.target.data.id}`}
          link={link}
          viewMode={viewMode}
          color={getDepthColor(link.source.depth)}
        />
      ))}
    </Group>
  );
});

MindMapLinks.displayName = 'MindMapLinks';
