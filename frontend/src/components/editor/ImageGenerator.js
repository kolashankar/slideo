import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import api from '@/utils/api';

export const ImageGenerator = ({ editor, onClose }) => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('professional');
  const [generating, setGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    try {
      setGenerating(true);
      setError(null);
      setGeneratedImage(null);
      
      const response = await api.post('/ai/generate-image', {
        prompt: prompt,
        style: style
      });
      
      if (response.data.success) {
        const imageData = response.data.data;
        const imageUrl = `data:${imageData.mime_type};base64,${imageData.image_base64}`;
        setGeneratedImage(imageUrl);
      }
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err.response?.data?.detail || 'Failed to generate image');
    } finally {
      setGenerating(false);
    }
  };
  
  const handleAddToSlide = () => {
    if (!generatedImage) return;
    
    editor.addElement({
      type: 'image',
      content: {
        image_url: generatedImage,
        alt_text: prompt
      },
      position: {
        x: 100,
        y: 100,
        width: 600,
        height: 400,
        z_index: (editor.currentSlide?.elements?.length || 0) + 1
      },
      style: {
        opacity: 1,
        object_fit: 'cover',
        border_radius: 0
      }
    });
    
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI Image Generator</h2>
              <p className="text-sm text-gray-600">Create custom images for your slides</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Describe the image you want to generate
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., A modern office workspace with laptops and coffee, minimalist style"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              rows={3}
            />
          </div>
          
          {/* Style Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Image Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'professional', label: 'Professional' },
                { value: 'modern', label: 'Modern' },
                { value: 'minimalist', label: 'Minimalist' },
                { value: 'creative', label: 'Creative' },
                { value: 'corporate', label: 'Corporate' },
                { value: 'abstract', label: 'Abstract' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStyle(option.value)}
                  className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                    style === option.value
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Image</span>
              </>
            )}
          </button>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          {/* Generated Image Preview */}
          {generatedImage && (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <img
                  src={generatedImage}
                  alt="Generated"
                  className="w-full h-auto"
                />
              </div>
              <button
                onClick={handleAddToSlide}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add to Slide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
