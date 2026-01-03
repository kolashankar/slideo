import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Check, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

export const TemplateSelector = ({ selectedTemplate, onSelectTemplate }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await api.get('/templates');
      setTemplates(response.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(response.data.map(t => t.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="template-selector">
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2">
        {/* Blank Template */}
        <div
          onClick={() => onSelectTemplate(null)}
          className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
            selectedTemplate === null
              ? 'border-blue-600 ring-2 ring-blue-200'
              : 'border-gray-200 hover:border-gray-300'
          }`}
          data-testid="template-blank"
        >
          <div className="aspect-[4/3] bg-white flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">Blank</p>
            </div>
          </div>
          {selectedTemplate === null && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Template Cards */}
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`relative cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
              selectedTemplate?.id === template.id
                ? 'border-blue-600 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            data-testid={`template-${template.id}`}
          >
            <div className="aspect-[4/3] relative">
              <img
                src={template.thumbnail_url}
                alt={template.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-sm font-semibold text-white">{template.name}</p>
                <p className="text-xs text-gray-200">{template.category}</p>
              </div>
            </div>
            {selectedTemplate?.id === template.id && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No templates found in this category
        </div>
      )}
    </div>
  );
};