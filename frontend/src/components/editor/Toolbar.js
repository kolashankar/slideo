import React, { useState } from 'react';
import {
  Type,
  Image,
  Square,
  Circle,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Save,
  Sparkles,
  MessageSquare,
  Palette
} from 'lucide-react';
import { ImageGenerator } from './ImageGenerator';

export const Toolbar = ({ editor, onToggleChat, onToggleTemplates, showChat }) => {
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  
  const addTextElement = () => {
    editor.addElement({
      type: 'text',
      content: 'Double-click to edit',
      style: {
        font_family: 'Inter',
        font_size: 24,
        font_weight: '400',
        color: '#000000',
        text_align: 'left'
      }
    });
  };
  
  const addShapeElement = (shapeType) => {
    editor.addElement({
      type: 'shape',
      content: { shape_type: shapeType },
      style: {
        fill_color: '#3B82F6',
        stroke_color: '#1E40AF',
        stroke_width: 2,
        opacity: 1
      }
    });
  };
  
  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        {/* Left: Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={addTextElement}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Text (T)"
          >
            <Type className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={() => setShowImageGenerator(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Generate Image"
          >
            <Sparkles className="h-5 w-5 text-purple-600" />
          </button>
          
          <button
            onClick={() => addShapeElement('rectangle')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Rectangle"
          >
            <Square className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={() => addShapeElement('circle')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Add Circle"
          >
            <Circle className="h-5 w-5 text-gray-700" />
          </button>
          
          <div className="h-6 w-px bg-gray-300 mx-2"></div>
          
          <button
            onClick={editor.undo}
            disabled={!editor.canUndo}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={editor.redo}
            disabled={!editor.canRedo}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={editor.zoomOut}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={editor.resetZoom}
            className="px-3 py-1 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
          >
            {editor.zoom}%
          </button>
          
          <button
            onClick={editor.zoomIn}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5 text-gray-700" />
          </button>
          
          <button
            onClick={editor.resetZoom}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fit to Screen"
          >
            <Maximize2 className="h-5 w-5 text-gray-700" />
          </button>
        </div>
        
        {/* Right: Save Status and Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTemplates}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium text-gray-700"
            title="Change Template"
          >
            <Palette className="h-4 w-4" />
            Templates
          </button>
          
          <button
            onClick={onToggleChat}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              showChat 
                ? 'bg-purple-100 text-purple-700' 
                : 'hover:bg-gray-100 text-gray-700'
            }`}
            title="AI Assistant"
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </button>
          
          {editor.saving ? (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Save className="h-4 w-4 animate-pulse" />
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Save className="h-4 w-4" />
              <span>Saved</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Image Generator Modal */}
      {showImageGenerator && (
        <ImageGenerator
          editor={editor}
          onClose={() => setShowImageGenerator(false)}
        />
      )}
    </>
  );
};
