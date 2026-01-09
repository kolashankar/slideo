import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/utils/api';

export const useEditor = () => {
  const { presentationId } = useParams();
  const navigate = useNavigate();
  
  const [presentation, setPresentation] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  
  const saveTimeoutRef = useRef(null);
  
  // Get current slide
  const currentSlide = slides[currentSlideIndex] || null;
  
  // Load presentation and slides
  const loadPresentation = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch presentation
      const presResponse = await api.get(`/presentations/${presentationId}`);
      setPresentation(presResponse.data.data);
      
      // Fetch slides
      const slidesResponse = await api.get(`/presentations/${presentationId}/slides`);
      const slidesList = slidesResponse.data.data || [];
      setSlides(slidesList);
      
      // Initialize history with first slide
      if (slidesList.length > 0) {
        setHistory([slidesList[0]]);
        setHistoryIndex(0);
      }
      
    } catch (err) {
      console.error('Error loading presentation:', err);
      setError(err.response?.data?.detail || 'Failed to load presentation');
    } finally {
      setLoading(false);
    }
  }, [presentationId]);
  
  useEffect(() => {
    if (presentationId) {
      loadPresentation();
    }
  }, [presentationId, loadPresentation]);
  
  // Save slide (debounced)
  const saveSlide = useCallback(async (slideData) => {
    if (!slideData || !slideData.id) return;
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Debounce save
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setSaving(true);
        await api.put(`/slides/${slideData.id}`, slideData);
      } catch (err) {
        console.error('Error saving slide:', err);
      } finally {
        setSaving(false);
      }
    }, 2000); // Save after 2 seconds of inactivity
  }, []);
  
  // Update current slide
  const updateCurrentSlide = useCallback((updates) => {
    if (!currentSlide) return;
    
    const updatedSlide = { ...currentSlide, ...updates };
    
    // Update slides array
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = updatedSlide;
    setSlides(newSlides);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedSlide);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // Auto-save
    saveSlide(updatedSlide);
  }, [currentSlide, slides, currentSlideIndex, history, historyIndex, saveSlide]);
  
  // Add element to current slide
  const addElement = useCallback((element) => {
    if (!currentSlide) return;
    
    const newElement = {
      id: `element-${Date.now()}`,
      ...element,
      position: element.position || { x: 100, y: 100, width: 200, height: 100, z_index: (currentSlide.elements?.length || 0) + 1 }
    };
    
    const updatedElements = [...(currentSlide.elements || []), newElement];
    updateCurrentSlide({ elements: updatedElements });
    
    // Auto-select new element
    setSelectedElementId(newElement.id);
  }, [currentSlide, updateCurrentSlide]);
  
  // Update element
  const updateElement = useCallback((elementId, updates) => {
    if (!currentSlide) return;
    
    const updatedElements = currentSlide.elements.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    );
    
    updateCurrentSlide({ elements: updatedElements });
  }, [currentSlide, updateCurrentSlide]);
  
  // Delete element
  const deleteElement = useCallback((elementId) => {
    if (!currentSlide) return;
    
    const updatedElements = currentSlide.elements.filter(el => el.id !== elementId);
    updateCurrentSlide({ elements: updatedElements });
    
    if (selectedElementId === elementId) {
      setSelectedElementId(null);
    }
  }, [currentSlide, selectedElementId, updateCurrentSlide]);
  
  // Select element
  const selectElement = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);
  
  // Get selected element
  const selectedElement = currentSlide?.elements?.find(el => el.id === selectedElementId) || null;
  
  // Navigate slides
  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
      setSelectedElementId(null);
    }
  }, [slides.length]);
  
  const nextSlide = useCallback(() => {
    goToSlide(currentSlideIndex + 1);
  }, [currentSlideIndex, goToSlide]);
  
  const previousSlide = useCallback(() => {
    goToSlide(currentSlideIndex - 1);
  }, [currentSlideIndex, goToSlide]);
  
  // Add new slide
  const addSlide = useCallback(async () => {
    try {
      const newSlide = {
        slide_number: slides.length + 1,
        layout: 'blank',
        elements: [],
        background: { type: 'solid', color: '#ffffff' }
      };
      
      const response = await api.post(`/presentations/${presentationId}/slides`, newSlide);
      const createdSlide = response.data.data;
      
      setSlides([...slides, createdSlide]);
      setCurrentSlideIndex(slides.length);
    } catch (err) {
      console.error('Error adding slide:', err);
      setError('Failed to add slide');
    }
  }, [presentationId, slides]);
  
  // Delete slide
  const deleteSlide = useCallback(async (slideId) => {
    try {
      await api.delete(`/slides/${slideId}`);
      
      // Reload slides to get updated slide numbers
      const slidesResponse = await api.get(`/presentations/${presentationId}/slides`);
      const slidesList = slidesResponse.data.data || [];
      setSlides(slidesList);
      
      // Adjust current index
      if (currentSlideIndex >= slidesList.length) {
        setCurrentSlideIndex(Math.max(0, slidesList.length - 1));
      }
    } catch (err) {
      console.error('Error deleting slide:', err);
      setError('Failed to delete slide');
    }
  }, [presentationId, currentSlideIndex]);
  
  // Duplicate slide
  const duplicateSlide = useCallback(async (slideId) => {
    try {
      const response = await api.post(`/slides/${slideId}/duplicate`);
      const duplicatedSlide = response.data.data;
      
      // Reload slides
      const slidesResponse = await api.get(`/presentations/${presentationId}/slides`);
      setSlides(slidesResponse.data.data || []);
    } catch (err) {
      console.error('Error duplicating slide:', err);
      setError('Failed to duplicate slide');
    }
  }, [presentationId]);
  
  // Undo/Redo
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      const newSlides = [...slides];
      newSlides[currentSlideIndex] = previousState;
      setSlides(newSlides);
      setHistoryIndex(newIndex);
      
      // Save
      saveSlide(previousState);
    }
  }, [historyIndex, history, slides, currentSlideIndex, saveSlide]);
  
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      const newSlides = [...slides];
      newSlides[currentSlideIndex] = nextState;
      setSlides(newSlides);
      setHistoryIndex(newIndex);
      
      // Save
      saveSlide(nextState);
    }
  }, [historyIndex, history, slides, currentSlideIndex, saveSlide]);
  
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  
  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(Math.min(200, zoom + 25));
  }, [zoom]);
  
  const zoomOut = useCallback(() => {
    setZoom(Math.max(25, zoom - 25));
  }, [zoom]);
  
  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);
  
  return {
    // State
    presentation,
    slides,
    currentSlide,
    currentSlideIndex,
    selectedElement,
    selectedElementId,
    zoom,
    loading,
    saving,
    error,
    canUndo,
    canRedo,
    
    // Actions
    loadPresentation,
    updateCurrentSlide,
    addElement,
    updateElement,
    deleteElement,
    selectElement,
    goToSlide,
    nextSlide,
    previousSlide,
    addSlide,
    deleteSlide,
    duplicateSlide,
    undo,
    redo,
    zoomIn,
    zoomOut,
    resetZoom
  };
};
