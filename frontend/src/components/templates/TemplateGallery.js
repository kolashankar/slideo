import React, { useState } from 'react';
import { X, Check, Palette, Type } from 'lucide-react';
import { 
  getAllTemplates, 
  getTemplatePreview, 
  colorSchemes, 
  fontPairings 
} from '@/utils/templateEngine';

export const TemplateGallery = ({ onApply, onClose, currentTemplate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate || 'modern-business');
  const [selectedColorScheme, setSelectedColorScheme] = useState('modernBusiness');
  const [selectedFontPairing, setSelectedFontPairing] = useState('professional');
  const [applying, setApplying] = useState(false);

  const templates = getAllTemplates();
  const categories = ['All', 'Business', 'Creative', 'Education', 'Minimal', 'Premium'];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleApply = async () => {
    setApplying(true);
    try {
      const template = getTemplatePreview(selectedTemplate);
      const colorScheme = colorSchemes[selectedColorScheme];
      const fontPairing = fontPairings[selectedFontPairing];
      
      await onApply({
        template,
        colorScheme,
        fontPairing
      });
      
      onClose();
    } catch (error) {
      console.error('Error applying template:', error);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Choose Template</h2>
            <p className="text-sm text-gray-600 mt-1">Select a template and customize colors and fonts</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Template Selection */}
            <div className="col-span-2">
              {/* Categories */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Template Grid */}
              <div className="grid grid-cols-3 gap-4">
                {filteredTemplates.map(template => {
                  const preview = getTemplatePreview(template.id);
                  const isSelected = selectedTemplate === template.id;
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplate(template.id)}
                      className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                        isSelected
                          ? 'border-purple-600 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {/* Template Preview */}
                      <div 
                        className="aspect-video flex items-center justify-center text-white font-bold text-lg"
                        style={{ 
                          background: `linear-gradient(135deg, ${preview.colorScheme.primary}, ${preview.colorScheme.secondary})` 
                        }}
                      >
                        {template.name}
                      </div>
                      
                      {/* Selected Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-purple-600 text-white p-1 rounded-full">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      
                      {/* Template Name */}
                      <div className="p-3 bg-white">
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-xs text-gray-500">{template.category}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Customization */}
            <div className="space-y-6">
              {/* Color Scheme */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Color Scheme</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(colorSchemes).map(([key, scheme]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedColorScheme(key)}
                      className={`w-full p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                        selectedColorScheme === key
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-1">
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: scheme.primary }}></div>
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: scheme.secondary }}></div>
                        <div className="w-6 h-6 rounded" style={{ backgroundColor: scheme.accent }}></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{scheme.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Pairing */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Font Pairing</h3>
                </div>
                <div className="space-y-2">
                  {Object.entries(fontPairings).map(([key, pairing]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedFontPairing(key)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                        selectedFontPairing === key
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="text-sm font-semibold text-gray-900">{pairing.name}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {pairing.heading} / {pairing.body}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Selected: <span className="font-semibold">{templates.find(t => t.id === selectedTemplate)?.name}</span>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={applying}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
            >
              {applying ? 'Applying...' : 'Apply Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
