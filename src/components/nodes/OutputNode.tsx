import { memo, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Download, Eye, Monitor, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface OutputNodeProps {
  data: {
    images?: string[];
    isLoading?: boolean;
  };
}

const OutputNode = memo(({ data }: OutputNodeProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const images = data.images || [];

  const downloadImage = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated-image-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gradient-node rounded-lg border border-node-output/20 shadow-node hover:shadow-node-hover transition-all duration-300 min-w-[280px]">
      <div className="flex items-center gap-2 p-3 border-b border-border/10">
        <div className="w-3 h-3 rounded-full bg-node-output"></div>
        <Monitor className="w-4 h-4" />
        <span className="text-sm font-medium">Output</span>
      </div>
      
      <div className="p-4 space-y-4">
        {data.isLoading ? (
          <div className="flex items-center justify-center h-48 bg-muted/20 rounded-lg border border-dashed border-border">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-node-output border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-muted-foreground">Generating image...</p>
            </div>
          </div>
        ) : images.length > 0 ? (
          <div className="space-y-4">
            {/* Main Image Display */}
            <div className="relative group">
              <img
                src={images[selectedImageIndex]}
                alt={`Generated ${selectedImageIndex + 1}`}
                className="w-full h-48 object-cover rounded-lg border border-border/20"
              />
              
              {/* Image Controls Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="secondary" size="sm" className="bg-background/90 hover:bg-background">
                        <Maximize2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <img
                        src={images[selectedImageIndex]}
                        alt={`Generated ${selectedImageIndex + 1}`}
                        className="w-full h-auto rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-background/90 hover:bg-background"
                    onClick={() => downloadImage(images[selectedImageIndex], selectedImageIndex)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Image Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden rounded border-2 transition-all ${
                      index === selectedImageIndex 
                        ? 'border-node-output' 
                        : 'border-border/20 hover:border-node-output/50'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Generated ${index + 1}`}
                      className="w-full h-12 object-cover"
                    />
                    {index === selectedImageIndex && (
                      <div className="absolute inset-0 bg-node-output/10 flex items-center justify-center">
                        <Eye className="w-3 h-3 text-node-output" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Image Info */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Generated {images.length} image(s)</div>
              <div>Viewing image {selectedImageIndex + 1} of {images.length}</div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-muted/10 rounded-lg border border-dashed border-border">
            <div className="text-center space-y-2">
              <Monitor className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No images generated yet</p>
              <p className="text-xs text-muted-foreground">Connect inputs and run generation</p>
            </div>
          </div>
        )}
      </div>

      <Handle 
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 border-2 border-node-output bg-background"
      />
    </div>
  );
});

OutputNode.displayName = 'OutputNode';

export default OutputNode;