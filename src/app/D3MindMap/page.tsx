import type { Metadata } from 'next';
import { MindMapContainer } from '@/components/MindMap/MindMapContainer';
import { initialMindMapData } from '@/data/initialData';

export const metadata: Metadata = {
  title: 'D3.js Mind Map Editor | Lumina',
  description: 'Interactive mind map editor built with D3.js and Next.js',
};

/**
 * D3.js Mind Map Editor Page
 *
 * Features:
 * - Force-directed graph layout
 * - Drag nodes to reposition
 * - Zoom and pan controls
 * - Responsive canvas sizing
 */
export default function D3MindMapPage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <MindMapContainer initialData={initialMindMapData} />
    </main>
  );
}
