'use client';

import { useEffect, useState } from 'react';
import { VisxMindMapEditor } from '@/components/MindMapEditor/VisxMindMapEditor';
import { useMindMapStore } from '@/lib/stores/mindmapStore';
import type { FlatMindMapNode } from '@/lib/mindmap/types';

export default function VisxMindMapPage() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const loadMindMap = useMindMapStore((state) => state.loadMindMap);

  // Initialize with dummy data
  useEffect(() => {
    const now = new Date();

    // Create dummy mind map data
    const dummyNodes: FlatMindMapNode[] = [
      {
        id: 'root',
        parentId: null,
        label: 'Central Topic',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '1',
        parentId: 'root',
        label: 'Branch 1',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '1-1',
        parentId: '1',
        label: 'Sub-topic 1.1',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '1-2',
        parentId: '1',
        label: 'Sub-topic 1.2',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '2',
        parentId: 'root',
        label: 'Branch 2',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '2-1',
        parentId: '2',
        label: 'Sub-topic 2.1',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '3',
        parentId: 'root',
        label: 'Branch 3',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '3-1',
        parentId: '3',
        label: 'Sub-topic 3.1',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: '3-1-1',
        parentId: '3-1',
        label: 'Deep topic 3.1.1',
        position: { x: 0, y: 0 },
        width: 160,
        height: 40,
        isExpanded: true,
        isTopic: false,
        createdAt: now,
        updatedAt: now,
      },
    ];

    // Load dummy data into store
    loadMindMap(dummyNodes, []);
  }, [loadMindMap]);

  // Set dimensions on mount and window resize
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <div className="text-gray-500">Loading mind map...</div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden">
      <VisxMindMapEditor width={dimensions.width} height={dimensions.height} />
    </div>
  );
}
