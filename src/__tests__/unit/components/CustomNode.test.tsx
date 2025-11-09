/**
 * CustomNode 組件測試
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ReactFlowProvider } from 'reactflow';
import { CustomNode } from '@/components/MindMapEditor/RadialView/CustomNode';
import type { NodeData } from '@/types/mindmap';

// 包裝組件以提供 React Flow Context
const CustomNodeWrapper = (props: Parameters<typeof CustomNode>[0]) => (
  <ReactFlowProvider>
    <CustomNode {...props} />
  </ReactFlowProvider>
);

describe('CustomNode', () => {
  it('應該正確渲染 Node 內容', () => {
    const mockData: NodeData = {
      label: 'Test Node',
    };

    const mockProps = {
      id: 'test-node',
      data: mockData,
      selected: false,
      type: 'custom',
      position: { x: 0, y: 0 },
      xPos: 0,
      yPos: 0,
      width: 150,
      height: 50,
      dragging: false,
      zIndex: 0,
      isConnectable: true,
    };

    render(<CustomNodeWrapper {...mockProps} />);

    expect(screen.getByText('Test Node')).toBeInTheDocument();
  });

  it('選中時應該套用不同的樣式', () => {
    const mockData: NodeData = {
      label: 'Test Node',
    };

    const mockProps = {
      id: 'test-node',
      data: mockData,
      selected: false,
      type: 'custom',
      position: { x: 0, y: 0 },
      xPos: 0,
      yPos: 0,
      width: 150,
      height: 50,
      dragging: false,
      zIndex: 0,
      isConnectable: true,
    };

    const { rerender } = render(<CustomNodeWrapper {...mockProps} />);

    const node = screen.getByText('Test Node').parentElement;
    expect(node).not.toHaveClass('border-blue-500');

    // 重新渲染為選中狀態
    rerender(<CustomNodeWrapper {...mockProps} selected={true} />);

    expect(node).toHaveClass('border-blue-500');
  });

  it('Topic Node 應該有特殊樣式', () => {
    const mockData: NodeData = {
      label: 'Topic Node',
      isTopic: true,
    };

    const mockProps = {
      id: 'test-node',
      data: mockData,
      selected: false,
      type: 'topic',
      position: { x: 0, y: 0 },
      xPos: 0,
      yPos: 0,
      width: 150,
      height: 50,
      dragging: false,
      zIndex: 0,
      isConnectable: true,
    };

    render(<CustomNodeWrapper {...mockProps} />);

    const node = screen.getByText('Topic Node').parentElement;
    expect(node).toHaveClass('bg-blue-50');
  });
});
