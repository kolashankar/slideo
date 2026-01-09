import React, { useEffect, useState } from 'react';
import { useEditor } from '@/hooks/useEditor';
import { Navbar } from '@/components/common/Navbar';
import { Toolbar } from '@/components/editor/Toolbar';
import { Canvas } from '@/components/editor/Canvas';
import { SlideList } from '@/components/editor/SlideList';
import { ElementEditor } from '@/components/editor/ElementEditor';
import { AIChat } from '@/components/editor/AIChat';
import { TemplateGallery } from '@/components/templates/TemplateGallery';
import { Loader2 } from 'lucide-react';
import api from '@/utils/api';

export const Editor = () => {
  const editor = useEditor();
  const [showChat, setShowChat] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  
  // Handle template application
  const handleApplyTemplate = async ({ template, colorScheme, fontPairing }) => {
    try {
      await api.post('/api/templates/apply', {
        presentation_id: editor.presentation.id,
        template_id: template.id,
        color_scheme: colorScheme,
        font_pairing: fontPairing
      });
      
      // Reload slides to see changes
      await editor.loadPresentation(editor.presentation.id);
    } catch (error) {
      console.error('Error applying template:', error);
      alert('Failed to apply template. Please try again.');
    }
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Z: Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editor.undo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y: Redo
      if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault();
        editor.redo();
      }
      // Delete: Delete selected element
      if (e.key === 'Delete' && editor.selectedElementId) {
        e.preventDefault();
        editor.deleteElement(editor.selectedElementId);
      }
      // Arrow keys: Navigate slides
      if (e.key === 'ArrowLeft' && !e.target.closest('input, textarea')) {
        e.preventDefault();
        editor.previousSlide();
      }
      if (e.key === 'ArrowRight' && !e.target.closest('input, textarea')) {
        e.preventDefault();
        editor.nextSlide();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor]);
  
  if (editor.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading presentation...</p>
        </div>
      </div>
    );
  }
  
  if (editor.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{editor.error}</div>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar presentation={editor.presentation} saving={editor.saving} />
      
      {/* Toolbar */}
      <Toolbar 
        editor={editor} 
        onToggleChat={() => setShowChat(!showChat)}
        onToggleTemplates={() => setShowTemplates(!showTemplates)}
        showChat={showChat}
      />
      
      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Slide List */}
        <SlideList editor={editor} />
        
        {/* Center - Canvas */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
          <Canvas editor={editor} />
        </div>
        
        {/* Right Sidebar - Element Editor or AI Chat */}
        {showChat ? (
          <AIChat 
            presentationId={editor.presentation?.id} 
            currentSlide={editor.currentSlide}
            onClose={() => setShowChat(false)}
          />
        ) : editor.selectedElement ? (
          <ElementEditor editor={editor} />
        ) : null}
      </div>
      
      {/* Template Gallery Modal */}
      {showTemplates && (
        <TemplateGallery
          onApply={handleApplyTemplate}
          onClose={() => setShowTemplates(false)}
          currentTemplate={editor.presentation?.template}
        />
      )}
    </div>
  );
};
