import { useState, useCallback } from 'react';
import { Position } from '../types';

interface ConnectionState {
  isConnecting: boolean;
  sourceNodeId: string | null;
  currentPosition: Position | null;
}

interface UseNodeConnectionProps {
  onConnect?: (sourceId: string, targetId: string) => void;
}

export const useNodeConnection = ({
  onConnect,
}: UseNodeConnectionProps = {}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnecting: false,
    sourceNodeId: null,
    currentPosition: null,
  });

  const startConnection = useCallback((nodeId: string, position: Position) => {
    setConnectionState({
      isConnecting: true,
      sourceNodeId: nodeId,
      currentPosition: position,
    });
  }, []);

  const updateConnectionPosition = useCallback((position: Position) => {
    setConnectionState((prev) => ({
      ...prev,
      currentPosition: position,
    }));
  }, []);

  const endConnection = useCallback(
    (targetNodeId: string | null) => {
      if (connectionState.sourceNodeId && targetNodeId) {
        onConnect?.(connectionState.sourceNodeId, targetNodeId);
      }

      setConnectionState({
        isConnecting: false,
        sourceNodeId: null,
        currentPosition: null,
      });
    },
    [connectionState.sourceNodeId, onConnect]
  );

  const cancelConnection = useCallback(() => {
    setConnectionState({
      isConnecting: false,
      sourceNodeId: null,
      currentPosition: null,
    });
  }, []);

  return {
    connectionState,
    startConnection,
    updateConnectionPosition,
    endConnection,
    cancelConnection,
  };
};
