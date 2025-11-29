import type { D3MindMapData } from '@/types/d3-mindmap';

/**
 * Sample Mind Map Data
 * Demonstrates a hierarchical structure with 3+ levels
 */
export const initialMindMapData: D3MindMapData = {
  nodes: [
    // Level 0: Root
    {
      id: 'root',
      label: 'Product Strategy 2024',
      parentId: null,
      level: 0,
      color: '#3B82F6',
    },

    // Level 1: Main branches
    {
      id: 'market',
      label: 'Market Analysis',
      parentId: 'root',
      level: 1,
      color: '#10B981',
    },
    {
      id: 'features',
      label: 'Core Features',
      parentId: 'root',
      level: 1,
      color: '#F59E0B',
    },
    {
      id: 'tech',
      label: 'Technology Stack',
      parentId: 'root',
      level: 1,
      color: '#EF4444',
    },
    {
      id: 'timeline',
      label: 'Timeline & Milestones',
      parentId: 'root',
      level: 1,
      color: '#8B5CF6',
    },

    // Level 2: Market Analysis sub-branches
    {
      id: 'market-research',
      label: 'User Research',
      parentId: 'market',
      level: 2,
      color: '#10B981',
    },
    {
      id: 'market-competitors',
      label: 'Competitor Analysis',
      parentId: 'market',
      level: 2,
      color: '#10B981',
    },

    // Level 2: Features sub-branches
    {
      id: 'features-editor',
      label: 'Mind Map Editor',
      parentId: 'features',
      level: 2,
      color: '#F59E0B',
    },
    {
      id: 'features-collab',
      label: 'Real-time Collaboration',
      parentId: 'features',
      level: 2,
      color: '#F59E0B',
    },
    {
      id: 'features-export',
      label: 'Export Options',
      parentId: 'features',
      level: 2,
      color: '#F59E0B',
    },

    // Level 2: Tech stack sub-branches
    {
      id: 'tech-frontend',
      label: 'Frontend',
      parentId: 'tech',
      level: 2,
      color: '#EF4444',
    },
    {
      id: 'tech-backend',
      label: 'Backend',
      parentId: 'tech',
      level: 2,
      color: '#EF4444',
    },

    // Level 3: Deeper nesting examples
    {
      id: 'market-research-surveys',
      label: 'User Surveys',
      parentId: 'market-research',
      level: 3,
      color: '#10B981',
    },
    {
      id: 'market-research-interviews',
      label: 'User Interviews',
      parentId: 'market-research',
      level: 3,
      color: '#10B981',
    },
    {
      id: 'features-editor-d3',
      label: 'D3.js Integration',
      parentId: 'features-editor',
      level: 3,
      color: '#F59E0B',
    },
    {
      id: 'features-editor-canvas',
      label: 'Canvas Controls',
      parentId: 'features-editor',
      level: 3,
      color: '#F59E0B',
    },
    {
      id: 'tech-frontend-nextjs',
      label: 'Next.js 14',
      parentId: 'tech-frontend',
      level: 3,
      color: '#EF4444',
    },
    {
      id: 'tech-frontend-d3',
      label: 'D3.js v7',
      parentId: 'tech-frontend',
      level: 3,
      color: '#EF4444',
    },
  ],
  links: [
    // Level 0 -> 1 connections
    { id: 'link-root-market', source: 'root', target: 'market' },
    { id: 'link-root-features', source: 'root', target: 'features' },
    { id: 'link-root-tech', source: 'root', target: 'tech' },
    { id: 'link-root-timeline', source: 'root', target: 'timeline' },

    // Level 1 -> 2 connections (Market)
    { id: 'link-market-research', source: 'market', target: 'market-research' },
    {
      id: 'link-market-competitors',
      source: 'market',
      target: 'market-competitors',
    },

    // Level 1 -> 2 connections (Features)
    {
      id: 'link-features-editor',
      source: 'features',
      target: 'features-editor',
    },
    {
      id: 'link-features-collab',
      source: 'features',
      target: 'features-collab',
    },
    {
      id: 'link-features-export',
      source: 'features',
      target: 'features-export',
    },

    // Level 1 -> 2 connections (Tech)
    { id: 'link-tech-frontend', source: 'tech', target: 'tech-frontend' },
    { id: 'link-tech-backend', source: 'tech', target: 'tech-backend' },

    // Level 2 -> 3 connections
    {
      id: 'link-research-surveys',
      source: 'market-research',
      target: 'market-research-surveys',
    },
    {
      id: 'link-research-interviews',
      source: 'market-research',
      target: 'market-research-interviews',
    },
    {
      id: 'link-editor-d3',
      source: 'features-editor',
      target: 'features-editor-d3',
    },
    {
      id: 'link-editor-canvas',
      source: 'features-editor',
      target: 'features-editor-canvas',
    },
    {
      id: 'link-frontend-nextjs',
      source: 'tech-frontend',
      target: 'tech-frontend-nextjs',
    },
    {
      id: 'link-frontend-d3',
      source: 'tech-frontend',
      target: 'tech-frontend-d3',
    },
  ],
};
