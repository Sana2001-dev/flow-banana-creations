import { useCallback, useState, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Background,
  Controls,
  MiniMap,
  Connection,
  ConnectionMode,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ImageInputNode from './nodes/ImageInputNode';
import PromptNode from './nodes/PromptNode';
import GenerateNode from './nodes/GenerateNode';
import OutputNode from './nodes/OutputNode';
import { ImageGenerationService } from '@/services/imageGeneration';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Plus, Zap, Type, Image, Monitor } from 'lucide-react';

const nodeTypes = {
  imageInput: ImageInputNode,
  prompt: PromptNode,
  generate: GenerateNode,
  output: OutputNode,
};

const initialNodes: Node[] = [
  {
    id: 'imageInput-1',
    type: 'imageInput',
    position: { x: 100, y: 100 },
    data: { label: 'Image Input' },
  },
  {
    id: 'prompt-1',
    type: 'prompt',
    position: { x: 100, y: 300 },
    data: { prompt: 'Transform this image with vibrant colors and artistic effects' },
  },
  {
    id: 'generate-1',
    type: 'generate',
    position: { x: 500, y: 200 },
    data: {},
  },
  {
    id: 'output-1',
    type: 'output',
    position: { x: 900, y: 200 },
    data: {},
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-3',
    source: 'imageInput-1',
    target: 'generate-1',
    targetHandle: 'images',
    animated: true,
    style: { stroke: 'hsl(var(--connection-line))' },
  },
  {
    id: 'e2-3',
    source: 'prompt-1',
    target: 'generate-1',
    targetHandle: 'prompt',
    animated: true,
    style: { stroke: 'hsl(var(--connection-line))' },
  },
  {
    id: 'e3-4',
    source: 'generate-1',
    target: 'output-1',
    animated: true,
    style: { stroke: 'hsl(var(--connection-line))' },
  },
];

export default function NodeCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isGenerating, setIsGenerating] = useState(false);
  const [nodeData, setNodeData] = useState<Record<string, any>>({
    'imageInput-1': { image: null }
  });
  const { screenToFlowPosition } = useReactFlow();

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      const edge = {
        ...params,
        animated: true,
        style: { stroke: 'hsl(var(--connection-line))' },
      };
      setEdges((eds) => addEdge(edge as Edge, eds));
    },
    [setEdges]
  );

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodeData(prev => ({
      ...prev,
      [nodeId]: { ...prev[nodeId], ...data }
    }));
  }, []);

  const handleGenerate = useCallback(async (apiKey: string) => {
    try {
      setIsGenerating(true);
      
      // Find connected nodes
      const generateNode = nodes.find(n => n.type === 'generate');
      if (!generateNode) return;

      // Get images from connected image input nodes
      const imageEdges = edges.filter(e => e.target === generateNode.id && e.targetHandle === 'images');
      const promptEdges = edges.filter(e => e.target === generateNode.id && e.targetHandle === 'prompt');
      
      let images: string[] = [];
      let prompt = '';

      // Collect images from all connected image input nodes
      for (const edge of imageEdges) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode?.type === 'imageInput') {
          const nodeImage = nodeData[sourceNode.id]?.image;
          if (nodeImage) {
            images.push(nodeImage);
          }
        }
      }

      // Collect prompts from all connected prompt nodes
      const prompts: string[] = [];
      for (const edge of promptEdges) {
        const sourceNode = nodes.find(n => n.id === edge.source);
        if (sourceNode?.type === 'prompt') {
          const nodePrompt = nodeData[sourceNode.id]?.prompt || sourceNode.data.prompt || '';
          if (nodePrompt.trim()) {
            prompts.push(nodePrompt.trim());
          }
        }
      }
      prompt = prompts.join(' ');

      if (images.length === 0) {
        toast.error('No images connected to the generate node');
        return;
      }

      if (!prompt.trim()) {
        toast.error('No prompt connected to the generate node');
        return;
      }

      // Update generate node to show loading state
      setNodes((nds) =>
        nds.map((node) =>
          node.type === 'generate'
            ? { ...node, data: { ...node.data, isGenerating: true, error: null } }
            : node
        )
      );

      console.log('Generating with:', { imageCount: images.length, prompt });

      const result = await ImageGenerationService.generateImage({
        prompt,
        imageUrls: images,
        apiKey,
      });

      // Update output nodes
      const outputEdges = edges.filter(e => e.source === generateNode.id);
      for (const edge of outputEdges) {
        const targetNode = nodes.find(n => n.id === edge.target);
        if (targetNode?.type === 'output') {
          setNodes((nds) =>
            nds.map((node) =>
              node.id === targetNode.id
                ? { ...node, data: { ...node.data, images: result.images, isLoading: false } }
                : node
            )
          );
        }
      }

      toast.success(`Generated ${result.images.length} image(s) successfully!`);
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      
      // Update generate node to show error
      setNodes((nds) =>
        nds.map((node) =>
          node.type === 'generate'
            ? { ...node, data: { ...node.data, isGenerating: false, error: errorMessage } }
            : node
        )
      );

      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
      
      // Clear loading state from generate node
      setNodes((nds) =>
        nds.map((node) =>
          node.type === 'generate'
            ? { ...node, data: { ...node.data, isGenerating: false } }
            : node
        )
      );
    }
  }, [nodes, edges, nodeData, setNodes]);

  // Update nodes with callbacks and data
  const enhancedNodes = useMemo(() => {
    return nodes.map((node) => {
      const data = { ...node.data };
      
      if (node.type === 'imageInput') {
        data.onImageChange = (image: string | null) => updateNodeData(node.id, { image });
        data.image = nodeData[node.id]?.image || null;
        // Pass the node ID to the component
        return { ...node, data, id: node.id };
      } else if (node.type === 'prompt') {
        data.onPromptChange = (prompt: string) => updateNodeData(node.id, { prompt });
        data.prompt = nodeData[node.id]?.prompt || node.data.prompt;
      } else if (node.type === 'generate') {
        data.onGenerate = handleGenerate;
        data.isGenerating = isGenerating;
      }
      
      return { ...node, data };
    });
  }, [nodes, nodeData, updateNodeData, handleGenerate, isGenerating]);

  const addNode = useCallback((type: string) => {
    // Generate truly unique ID with timestamp and random string
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const newNodeId = `${type}-${timestamp}-${randomStr}`;
    const position = screenToFlowPosition({ x: 400, y: 300 });
    
    const nodeConfig = {
      imageInput: { icon: Image, label: 'Image Input' },
      prompt: { icon: Type, label: 'Prompt' },
      generate: { icon: Zap, label: 'Generate' },
      output: { icon: Monitor, label: 'Output' },
    };
    
    const newNode: Node = {
      id: newNodeId,
      type,
      position,
      data: { label: nodeConfig[type as keyof typeof nodeConfig]?.label || 'Node' },
    };
    
    // Initialize node data immediately for image input nodes
    if (type === 'imageInput') {
      setNodeData(prev => ({
        ...prev,
        [newNodeId]: { image: null }
      }));
    }
    
    setNodes((nds) => [...nds, newNode]);
    
    console.log(`Added new ${type} node with ID: ${newNodeId}`);
  }, [setNodes, screenToFlowPosition, setNodeData]);

  return (
    <div className="w-full h-screen bg-gradient-canvas relative">
      {/* Node Addition Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-card/90 backdrop-blur-sm rounded-lg p-3 border border-border/20 shadow-node">
        <div className="text-xs font-medium text-muted-foreground mb-1">Add Node</div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addNode('imageInput')}
          className="justify-start"
        >
          <Image className="w-4 h-4 mr-2 text-node-input" />
          Image Input
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addNode('prompt')}
          className="justify-start"
        >
          <Type className="w-4 h-4 mr-2 text-node-prompt" />
          Prompt
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addNode('generate')}
          className="justify-start"
        >
          <Zap className="w-4 h-4 mr-2 text-node-generate" />
          Generate
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => addNode('output')}
          className="justify-start"
        >
          <Monitor className="w-4 h-4 mr-2 text-node-output" />
          Output
        </Button>
      </div>

      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className="!bg-canvas-background"
      >
        <Background 
          color="hsl(var(--canvas-grid))" 
          gap={20} 
          size={1}
        />
        <Controls 
          className="!bg-card/90 !backdrop-blur-sm !border-border/20"
        />
        <MiniMap 
          className="!bg-card/90 !backdrop-blur-sm !border-border/20"
          nodeColor={(node) => {
            switch (node.type) {
              case 'imageInput': return 'hsl(var(--node-input))';
              case 'prompt': return 'hsl(var(--node-prompt))';
              case 'generate': return 'hsl(var(--node-generate))';
              case 'output': return 'hsl(var(--node-output))';
              default: return 'hsl(var(--muted))';
            }
          }}
        />
      </ReactFlow>
    </div>
  );
}