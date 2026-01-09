import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';

export const SlideList = ({ editor }) => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2">Slides</h3>
        <button
          onClick={editor.addSlide}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Slide</span>
        </button>
      </div>
      
      {/* Slide List */}
      <div className="flex-1 overflow-y-auto p-2">
        {editor.slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => editor.goToSlide(index)}
            className={`group mb-2 cursor-pointer rounded-lg border-2 transition-all ${
              index === editor.currentSlideIndex
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* Slide Number */}
            <div className="px-2 py-1 text-xs font-medium text-gray-500">
              {slide.slide_number}
            </div>
            
            {/* Slide Thumbnail */}
            <div className="aspect-video bg-white m-2 rounded border border-gray-200 overflow-hidden relative">
              <div
                className="w-full h-full"
                style={{
                  background: slide.background?.type === 'solid'
                    ? slide.background.color
                    : '#ffffff'
                }}
              >
                {/* Render elements (simplified) */}
                {slide.elements?.map((element, idx) => (
                  <div
                    key={element.id || idx}
                    className="absolute text-xs overflow-hidden"
                    style={{
                      left: `${(element.position?.x / 1920) * 100}%`,
                      top: `${(element.position?.y / 1080) * 100}%`,
                      width: `${(element.position?.width / 1920) * 100}%`,
                      height: `${(element.position?.height / 1080) * 100}%`,
                      fontSize: '6px'
                    }}
                  >
                    {element.type === 'text' && (
                      <div className="truncate">{element.content}</div>
                    )}
                    {element.type === 'shape' && (
                      <div
                        className="w-full h-full"
                        style={{
                          backgroundColor: element.style?.fill_color || '#3B82F6',
                          borderRadius: element.content?.shape_type === 'circle' ? '50%' : '0'
                        }}
                      />
                    )}
                    {element.type === 'image' && element.content?.image_url && (
                      <img
                        src={element.content.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  editor.duplicateSlide(slide.id);
                }}
                className="flex-1 p-1 hover:bg-gray-100 rounded text-xs flex items-center justify-center gap-1"
                title="Duplicate"
              >
                <Copy className="h-3 w-3" />
              </button>
              {editor.slides.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('Delete this slide?')) {
                      editor.deleteSlide(slide.id);
                    }
                  }}
                  className="flex-1 p-1 hover:bg-red-50 hover:text-red-600 rounded text-xs flex items-center justify-center gap-1"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
