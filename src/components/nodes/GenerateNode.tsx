import { memo, useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Zap, Loader2, Settings, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface GenerateNodeProps {
  data: {
    onGenerate?: (apiKey: string) => void;
    isGenerating?: boolean;
    error?: string | null;
    onDelete?: () => void;
  };
}

const GenerateNode = memo(({ data }: GenerateNodeProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showApiKeyWarning, setShowApiKeyWarning] = useState(false);

  const handleGenerate = useCallback(() => {
    if (!apiKey.trim()) {
      setShowApiKeyWarning(true);
      return;
    }
    setShowApiKeyWarning(false);
    data.onGenerate?.(apiKey);
  }, [apiKey, data]);

  return (
    <div className="bg-gradient-node rounded-lg border border-node-generate/20 shadow-node hover:shadow-node-hover transition-all duration-300 min-w-[280px] relative">
      {/* Delete Button */}
      <button
        onClick={data.onDelete}
        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 hover:scale-110 shadow-md"
      >
        ✕
      </button>
      
      <div className="flex items-center gap-2 p-3 border-b border-border/10">
        <div className="w-3 h-3 rounded-full bg-node-generate"></div>
        <Zap className="w-4 h-4" />
        <span className="text-sm font-medium">Generate</span>
      </div>
      
      <div className="p-4 space-y-4">
        {/* API Key Input */}
        <div className="space-y-2">
          <Label htmlFor="api-key" className="text-xs font-medium">
            OpenRouter API Key
          </Label>
          <Input
            id="api-key"
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setShowApiKeyWarning(false);
            }}
            placeholder="sk-or-v1-..."
            className={`text-sm ${showApiKeyWarning ? 'border-destructive' : ''}`}
          />
          {showApiKeyWarning && (
            <div className="flex items-center gap-1 text-xs text-destructive">
              <AlertCircle className="w-3 h-3" />
              API key required
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Get your free API key at{' '}
            <a 
              href="https://openrouter.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-node-generate hover:underline"
            >
              openrouter.ai
            </a>
          </p>
        </div>

        {/* Settings */}
        <Collapsible open={showSettings} onOpenChange={setShowSettings}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between p-2">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="text-sm">Settings</span>
              </span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Model: google/gemini-2.5-flash-image-preview:free</div>
              <div>Modalities: image, text</div>
              <div>Cost: Free tier</div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Error Display */}
        {data.error && (
          <div className="p-3 rounded border border-destructive/20 bg-destructive/5 text-destructive text-sm">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">{data.error}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={data.isGenerating}
          className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          {data.isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Generate Image
            </>
          )}
        </Button>
      </div>

      {/* Input handles */}
      <Handle 
        type="target" 
        position={Position.Left} 
        id="images"
        style={{ top: '30%' }}
        className="w-3 h-3 border-2 border-node-generate bg-background"
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        id="prompt"
        style={{ top: '70%' }}
        className="w-3 h-3 border-2 border-node-generate bg-background"
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 border-2 border-node-generate bg-background"
      />
    </div>
  );
});

GenerateNode.displayName = 'GenerateNode';

export default GenerateNode;