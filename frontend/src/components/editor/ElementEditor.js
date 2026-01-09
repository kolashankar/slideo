import React from 'react';
import { X, Trash2 } from 'lucide-react';

export const ElementEditor = ({ editor }) => {
  const { selectedElement } = editor;
  
  if (!selectedElement) return null;
  
  const updateStyle = (styleUpdates) => {
    editor.updateElement(selectedElement.id, {
      style: { ...selectedElement.style, ...styleUpdates }
    });
  };
  
  const updatePosition = (positionUpdates) => {
    editor.updateElement(selectedElement.id, {
      position: { ...selectedElement.position, ...positionUpdates }
    });
  };
  
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Properties</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => editor.deleteElement(selectedElement.id)}
            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
            title="Delete Element"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => editor.selectElement(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Properties */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Position & Size */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Position & Size</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.position?.x || 0)}
                onChange={(e) => updatePosition({ x: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.position?.y || 0)}
                onChange={(e) => updatePosition({ y: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Width</label>
              <input
                type="number"
                value={Math.round(selectedElement.position?.width || 0)}
                onChange={(e) => updatePosition({ width: parseInt(e.target.value) || 50 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Height</label>
              <input
                type="number"
                value={Math.round(selectedElement.position?.height || 0)}
                onChange={(e) => updatePosition({ height: parseInt(e.target.value) || 30 })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Text Properties */}
        {selectedElement.type === 'text' && (
          <>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Text</h4>
              <textarea
                value={selectedElement.content || ''}
                onChange={(e) => editor.updateElement(selectedElement.id, { content: e.target.value })}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Font</h4>
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-gray-600">Font Family</label>
                  <select
                    value={selectedElement.style?.font_family || 'Inter'}
                    onChange={(e) => updateStyle({ font_family: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Inter">Inter</option>
                    <option value="Manrope">Manrope</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Arial">Arial</option>
                    <option value="Times New Roman">Times New Roman</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Font Size</label>
                  <input
                    type="number"
                    value={selectedElement.style?.font_size || 24}
                    onChange={(e) => updateStyle({ font_size: parseInt(e.target.value) || 24 })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Font Weight</label>
                  <select
                    value={selectedElement.style?.font_weight || '400'}
                    onChange={(e) => updateStyle({ font_weight: e.target.value })}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="300">Light (300)</option>
                    <option value="400">Regular (400)</option>
                    <option value="500">Medium (500)</option>
                    <option value="600">Semibold (600)</option>
                    <option value="700">Bold (700)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={selectedElement.style?.color || '#000000'}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedElement.style?.color || '#000000'}
                      onChange={(e) => updateStyle({ color: e.target.value })}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs text-gray-600">Alignment</label>
                  <div className="flex gap-1">
                    {['left', 'center', 'right', 'justify'].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateStyle({ text_align: align })}
                        className={`flex-1 px-2 py-1 text-xs rounded border ${
                          selectedElement.style?.text_align === align
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {align.charAt(0).toUpperCase() + align.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Shape Properties */}
        {selectedElement.type === 'shape' && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Shape</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Fill Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedElement.style?.fill_color || '#3B82F6'}
                    onChange={(e) => updateStyle({ fill_color: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedElement.style?.fill_color || '#3B82F6'}
                    onChange={(e) => updateStyle({ fill_color: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Stroke Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={selectedElement.style?.stroke_color || '#1E40AF'}
                    onChange={(e) => updateStyle({ stroke_color: e.target.value })}
                    className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={selectedElement.style?.stroke_color || '#1E40AF'}
                    onChange={(e) => updateStyle({ stroke_color: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Stroke Width</label>
                <input
                  type="number"
                  value={selectedElement.style?.stroke_width || 2}
                  onChange={(e) => updateStyle({ stroke_width: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement.style?.opacity || 1}
                  onChange={(e) => updateStyle({ opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-gray-600 text-center">
                  {Math.round((selectedElement.style?.opacity || 1) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Image Properties */}
        {selectedElement.type === 'image' && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Image</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-600">Object Fit</label>
                <select
                  value={selectedElement.style?.object_fit || 'cover'}
                  onChange={(e) => updateStyle({ object_fit: e.target.value })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="fill">Fill</option>
                  <option value="none">None</option>
                </select>
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Border Radius</label>
                <input
                  type="number"
                  value={selectedElement.style?.border_radius || 0}
                  onChange={(e) => updateStyle({ border_radius: parseInt(e.target.value) || 0 })}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="text-xs text-gray-600">Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={selectedElement.style?.opacity || 1}
                  onChange={(e) => updateStyle({ opacity: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="text-xs text-gray-600 text-center">
                  {Math.round((selectedElement.style?.opacity || 1) * 100)}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
