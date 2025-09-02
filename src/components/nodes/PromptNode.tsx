import { memo, useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Type, Wand2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface PromptNodeProps {
  data: {
    prompt?: string;
    onPromptChange?: (prompt: string) => void;
  };
}

const PromptNode = memo(({ data }: PromptNodeProps) => {
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [focused, setFocused] = useState(false);

  const handlePromptChange = useCallback((value: string) => {
    setPrompt(value);
    data.onPromptChange?.(value);
  }, [data]);

  const promptExamples = [
    "Make the background dreamy and ethereal",
    "Add vibrant colors and artistic effects",
    "Transform into a cyberpunk style",
    "Create a fantasy landscape version"
  ];

  const addExample = (example: string) => {
    const newPrompt = prompt ? `${prompt}\n${example}` : example;
    handlePromptChange(newPrompt);
  };

  return (
    <div className="bg-gradient-node rounded-lg border border-node-prompt/20 shadow-node hover:shadow-node-hover transition-all duration-300 min-w-[320px]">
      <div className="flex items-center gap-2 p-3 border-b border-border/10">
        <div className="w-3 h-3 rounded-full bg-node-prompt"></div>
        <Type className="w-4 h-4" />
        <span className="text-sm font-medium">Prompt</span>
      </div>
      
      <div className="p-4 space-y-4">
        <div className={`transition-all duration-200 ${focused ? 'ring-2 ring-node-prompt/20 rounded-md' : ''}`}>
          <Textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Describe how you want to transform or generate the image..."
            className="min-h-[100px] resize-none border-border/20 focus:border-node-prompt/50 transition-colors"
          />
        </div>

        {/* Quick Examples */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground font-medium">Quick Examples:</div>
          <div className="grid grid-cols-1 gap-1">
            {promptExamples.map((example, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs h-auto p-2 text-left justify-start hover:bg-node-prompt/10 hover:text-node-prompt"
                onClick={() => addExample(example)}
              >
                <Wand2 className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">{example}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          {prompt.length} characters
        </div>
      </div>

      {/* Input and output handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 border-2 border-node-prompt bg-background"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 border-2 border-node-prompt bg-background"
      />
    </div>
  );
});

PromptNode.displayName = 'PromptNode';

export default PromptNode;