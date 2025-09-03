import axios from 'axios';

export interface GenerateImageParams {
  prompt: string;
  imageUrls: string[];
  apiKey: string;
}

export interface GeneratedImageResponse {
  images: string[];
}

export class ImageGenerationService {
  private static readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';
  private static readonly MODEL = 'google/gemini-2.5-flash-image-preview:free';

  static async generateImage(params: GenerateImageParams): Promise<GeneratedImageResponse> {
    const { prompt, imageUrls, apiKey } = params;

    if (!apiKey.trim()) {
      throw new Error('API key is required');
    }

    if (!prompt.trim()) {
      throw new Error('Prompt is required');
    }

    try {
      const messages = [
        {
          role: 'system' as const,
          content: 'Ensure that all generated images keep characters, objects, and visual styles consistent unless explicitly instructed otherwise. Maintain the same subject identity across multiple generations including face, hairstyle, clothes, body shape, and accessories.'
        },
        {
          role: 'user' as const,
          content: [
            // Add image URLs first
            ...imageUrls.map(url => ({
              type: 'image_url' as const,
              image_url: { url }
            })),
            // Then add the text prompt
            { 
              type: 'text' as const, 
              text: prompt 
            }
          ]
        }
      ];

      const payload = {
        model: this.MODEL,
        messages,
        modalities: ['image', 'text'],
        stream: false,
        max_tokens: 4096,
        generation_config: {
          size: "1024x1024",
          quality: "high"
        }
      };

      const headers = {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Node-Based Image Generator'
      };

      console.log('Sending request to OpenRouter:', {
        model: payload.model,
        messageCount: messages.length,
        imageCount: imageUrls.length,
        promptLength: prompt.length
      });

      const response = await axios.post(this.API_URL, payload, { headers });

      if (response.data.error) {
        throw new Error(response.data.error.message || 'API request failed');
      }

      const message = response.data.choices?.[0]?.message;
      
      if (!message) {
        throw new Error('No response message received');
      }

      // Extract images from the response
      let images: string[] = [];
      
      if (message.images && Array.isArray(message.images)) {
        // If images are returned in a dedicated images array
        images = message.images.map((img: any) => img.image_url?.url || img.url).filter(Boolean);
      } else if (message.content) {
        // If images are embedded in content (fallback)
        const content = Array.isArray(message.content) ? message.content : [message.content];
        images = content
          .filter((item: any) => item.type === 'image_url' || item.image_url)
          .map((item: any) => item.image_url?.url || item.url)
          .filter(Boolean);
      }

      if (images.length === 0) {
        // If no images found in expected places, check for base64 data in text
        const textContent = message.content || message.text || '';
        const base64Matches = textContent.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/g);
        if (base64Matches) {
          images = base64Matches;
        }
      }

      if (images.length === 0) {
        console.warn('No images found in response:', response.data);
        throw new Error('No images were generated. The model may have returned text-only content.');
      }

      console.log(`Successfully generated ${images.length} image(s)`);

      return { images };
    } catch (error) {
      console.error('Image generation error:', error);
      
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const errorData = error.response?.data;
        
        if (status === 401) {
          throw new Error('Invalid API key. Please check your OpenRouter API key.');
        } else if (status === 402) {
          throw new Error('Insufficient credits. Please check your OpenRouter account balance.');
        } else if (status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (status === 400) {
          const errorMessage = errorData?.error?.message || 'Invalid request format';
          throw new Error(`Bad request: ${errorMessage}`);
        } else if (errorData?.error?.message) {
          throw new Error(errorData.error.message);
        }
      }
      
      throw error instanceof Error ? error : new Error('Failed to generate image');
    }
  }
}