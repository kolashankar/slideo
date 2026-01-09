import React, { useState, useRef, useEffect } from 'react';

export const Canvas = ({ editor }) => {
  const canvasRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null);
  const [editingText, setEditingText] = useState(null);
  
  const CANVAS_WIDTH = 1920;
  const CANVAS_HEIGHT = 1080;
  
  const handleCanvasClick = (e) => {
    // If clicking on canvas background, deselect
    if (e.target === canvasRef.current) {
      editor.selectElement(null);
    }
  };
  
  const handleElementClick = (elementId, e) => {
    e.stopPropagation();
    editor.selectElement(elementId);
  };
  
  const handleElementDoubleClick = (elementId, e) => {
    e.stopPropagation();
    const element = editor.currentSlide?.elements?.find(el => el.id === elementId);
    if (element?.type === 'text') {
      setEditingText(elementId);
    }
  };
  
  const handleTextEdit = (elementId, newContent) => {
    editor.updateElement(elementId, { content: newContent });
    setEditingText(null);
  };
  
  const handleDragStart = (elementId, e) => {
    e.stopPropagation();
    const element = editor.currentSlide?.elements?.find(el => el.id === elementId);
    if (!element) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    setDragging({ elementId, offsetX, offsetY });
  };
  
  const handleDrag = (e) => {
    if (!dragging || !canvasRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scale = editor.zoom / 100;
    
    const x = (e.clientX - canvasRect.left) / scale - dragging.offsetX;
    const y = (e.clientY - canvasRect.top) / scale - dragging.offsetY;
    
    const element = editor.currentSlide?.elements?.find(el => el.id === dragging.elementId);
    if (!element) return;
    
    editor.updateElement(dragging.elementId, {
      position: {
        ...element.position,
        x: Math.max(0, Math.min(CANVAS_WIDTH - element.position.width, x)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT - element.position.height, y))
      }
    });
  };
  
  const handleDragEnd = () => {
    setDragging(null);
  };
  
  const handleResizeStart = (elementId, handle, e) => {
    e.stopPropagation();
    setResizing({ elementId, handle });
  };
  
  const handleResize = (e) => {
    if (!resizing || !canvasRef.current) return;
    
    const element = editor.currentSlide?.elements?.find(el => el.id === resizing.elementId);
    if (!element) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const scale = editor.zoom / 100;
    
    const mouseX = (e.clientX - canvasRect.left) / scale;
    const mouseY = (e.clientY - canvasRect.top) / scale;
    
    const pos = element.position;
    let newPos = { ...pos };
    
    // Handle different resize directions
    switch (resizing.handle) {
      case 'nw':
        newPos.width = pos.x + pos.width - mouseX;
        newPos.height = pos.y + pos.height - mouseY;
        newPos.x = mouseX;
        newPos.y = mouseY;
        break;
      case 'ne':
        newPos.width = mouseX - pos.x;
        newPos.height = pos.y + pos.height - mouseY;
        newPos.y = mouseY;
        break;
      case 'sw':
        newPos.width = pos.x + pos.width - mouseX;
        newPos.height = mouseY - pos.y;
        newPos.x = mouseX;
        break;
      case 'se':
        newPos.width = mouseX - pos.x;
        newPos.height = mouseY - pos.y;
        break;
      case 'n':
        newPos.height = pos.y + pos.height - mouseY;
        newPos.y = mouseY;
        break;
      case 's':
        newPos.height = mouseY - pos.y;
        break;
      case 'w':
        newPos.width = pos.x + pos.width - mouseX;
        newPos.x = mouseX;
        break;
      case 'e':
        newPos.width = mouseX - pos.x;
        break;
    }
    
    // Ensure minimum size
    if (newPos.width < 50) newPos.width = 50;
    if (newPos.height < 30) newPos.height = 30;
    
    editor.updateElement(resizing.elementId, { position: newPos });
  };
  
  const handleResizeEnd = () => {
    setResizing(null);
  };
  
  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleDrag);
      window.addEventListener('mouseup', handleDragEnd);
      return () => {
        window.removeEventListener('mousemove', handleDrag);
        window.removeEventListener('mouseup', handleDragEnd);
      };
    }
  }, [dragging]);
  
  useEffect(() => {
    if (resizing) {
      window.addEventListener('mousemove', handleResize);
      window.addEventListener('mouseup', handleResizeEnd);
      return () => {
        window.removeEventListener('mousemove', handleResize);
        window.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizing]);
  
  const renderElement = (element) => {
    const isSelected = element.id === editor.selectedElementId;
    const isEditing = element.id === editingText;
    const pos = element.position || { x: 0, y: 0, width: 200, height: 100 };
    
    return (
      <div
        key={element.id}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-600' : ''}`}
        style={{
          left: pos.x,
          top: pos.y,
          width: pos.width,
          height: pos.height,
          zIndex: pos.z_index || 1
        }}
        onClick={(e) => handleElementClick(element.id, e)}
        onDoubleClick={(e) => handleElementDoubleClick(element.id, e)}
        onMouseDown={(e) => handleDragStart(element.id, e)}
      >
        {/* Element Content */}
        {element.type === 'text' && (
          <div
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={(e) => handleTextEdit(element.id, e.target.textContent)}
            className={`w-full h-full p-2 ${isEditing ? 'outline-none' : ''}`}
            style={{
              fontFamily: element.style?.font_family || 'Inter',
              fontSize: `${element.style?.font_size || 24}px`,
              fontWeight: element.style?.font_weight || '400',
              color: element.style?.color || '#000000',
              textAlign: element.style?.text_align || 'left',
              lineHeight: element.style?.line_height || 1.5
            }}
          >
            {element.content}
          </div>
        )}
        
        {element.type === 'shape' && (
          <div
            className="w-full h-full"
            style={{
              backgroundColor: element.style?.fill_color || '#3B82F6',
              border: `${element.style?.stroke_width || 2}px solid ${element.style?.stroke_color || '#1E40AF'}`,
              borderRadius: element.content?.shape_type === 'circle' ? '50%' : element.style?.border_radius || 0,
              opacity: element.style?.opacity || 1
            }}
          />
        )}
        
        {element.type === 'image' && element.content?.image_url && (
          <img
            src={element.content.image_url}
            alt={element.content.alt_text || ''}
            className="w-full h-full"
            style={{
              objectFit: element.style?.object_fit || 'cover',
              borderRadius: element.style?.border_radius || 0,
              opacity: element.style?.opacity || 1
            }}
          />
        )}
        
        {/* Resize Handles */}
        {isSelected && !isEditing && (
          <>
            {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => (
              <div
                key={handle}
                className="absolute w-3 h-3 bg-blue-600 border-2 border-white rounded-full cursor-pointer hover:scale-125 transition-transform"
                style={{
                  ...(handle.includes('n') && { top: -6 }),
                  ...(handle.includes('s') && { bottom: -6 }),
                  ...(handle.includes('w') && { left: -6 }),
                  ...(handle.includes('e') && { right: -6 }),
                  ...(handle === 'n' && { left: '50%', transform: 'translateX(-50%)' }),
                  ...(handle === 's' && { left: '50%', transform: 'translateX(-50%)' }),
                  ...(handle === 'w' && { top: '50%', transform: 'translateY(-50%)' }),
                  ...(handle === 'e' && { top: '50%', transform: 'translateY(-50%)' }),
                  cursor: `${handle}-resize`
                }}
                onMouseDown={(e) => handleResizeStart(element.id, handle, e)}
              />
            ))}
          </>
        )}
      </div>
    );
  };
  
  if (!editor.currentSlide) {
    return (
      <div className="text-center text-gray-500">
        <p>No slide selected</p>
      </div>
    );
  }
  
  const scale = editor.zoom / 100;
  
  return (
    <div
      ref={canvasRef}
      className="relative bg-white shadow-2xl"
      style={{
        width: CANVAS_WIDTH * scale,
        height: CANVAS_HEIGHT * scale,
        transform: `scale(${scale})`,
        transformOrigin: 'center center'
      }}
      onClick={handleCanvasClick}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: editor.currentSlide.background?.type === 'solid'
            ? editor.currentSlide.background.color
            : '#ffffff'
        }}
      />
      
      {/* Elements */}
      {editor.currentSlide.elements?.map(renderElement)}
    </div>
  );
};
