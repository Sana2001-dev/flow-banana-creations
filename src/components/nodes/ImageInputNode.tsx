import { memo, useCallback, useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Upload, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageInputNodeProps {
  data: {
    label?: string;
    image?: string;
    onImageChange?: (image: string | null) => void;
  };
}

const ImageInputNode = memo(({ data }: ImageInputNodeProps) => {
  const [image, setImage] = useState<string | null>(data.image || null);
  const [dragOver, setDragOver] = useState(false);

  // Sync with external data changes
  const handleImageChange = useCallback((newImage: string | null) => {
    setImage(newImage);
    data.onImageChange?.(newImage);
  }, [data]);

  const handleFileUpload = useCallback((files: FileList) => {
    const file = files[0]; // Only take the first file
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage = e.target.result as string;
          handleImageChange(newImage);
        }
      };
      reader.readAsDataURL(file);
    }
  }, [handleImageChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  const removeImage = useCallback(() => {
    handleImageChange(null);
  }, [handleImageChange]);

  const handleUrlAdd = useCallback((url: string) => {
    if (url && url.startsWith('http')) {
      handleImageChange(url);
    }
  }, [handleImageChange]);

  return (
    <div className="bg-gradient-node rounded-lg border border-node-input/20 shadow-node hover:shadow-node-hover transition-all duration-300 min-w-[280px]">
      <div className="flex items-center gap-2 p-3 border-b border-border/10">
        <div className="w-3 h-3 rounded-full bg-node-input"></div>
        <span className="text-sm font-medium">Image Input</span>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
            dragOver 
              ? 'border-node-input bg-node-input/5' 
              : 'border-border hover:border-node-input/50'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop images here or
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              Browse Files
            </Button>
          </div>
        </div>

        {/* URL Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Or paste image URL..."
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleUrlAdd(e.currentTarget.value);
                e.currentTarget.value = '';
              }
            }}
          />
        </div>

        {/* Image Preview */}
        {image && (
          <div className="relative group">
            <img
              src={image}
              alt="Input image"
              className="w-full h-32 object-cover rounded border border-border/20"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={removeImage}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {image ? '1 image selected' : 'No image selected'}
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 border-2 border-node-input bg-background"
      />
    </div>
  );
});

ImageInputNode.displayName = 'ImageInputNode';

export default ImageInputNode;