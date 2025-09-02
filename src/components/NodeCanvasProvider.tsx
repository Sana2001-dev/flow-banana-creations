import { ReactFlowProvider } from '@xyflow/react';
import NodeCanvas from './NodeCanvas';

export default function NodeCanvasProvider() {
  return (
    <ReactFlowProvider>
      <NodeCanvas />
    </ReactFlowProvider>
  );
}