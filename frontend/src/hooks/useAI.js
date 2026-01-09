import { useState } from 'react';
import api from '../utils/api';

/**
 * Custom hook for AI generation operations
 */
export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Generate a complete presentation from a topic
   */
  const generatePresentation = async ({
    topic,
    audience = 'general',
    tone = 'professional',
    slideCount = 10,
    additionalContext = null
  }) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(20);
      
      const response = await api.post('/ai/generate-presentation', {
        topic,
        audience,
        tone,
        slide_count: slideCount,
        additional_context: additionalContext
      });

      setProgress(100);
      setLoading(false);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to generate presentation';
      setError(errorMessage);
      setLoading(false);
      setProgress(0);
      throw new Error(errorMessage);
    }
  };

  /**
   * Generate a presentation outline
   */
  const generateOutline = async ({ topic, slideCount = 10 }) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(20);
      
      const response = await api.post('/ai/generate-outline', {
        topic,
        slide_count: slideCount
      });

      setProgress(100);
      setLoading(false);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to generate outline';
      setError(errorMessage);
      setLoading(false);
      setProgress(0);
      throw new Error(errorMessage);
    }
  };

  /**
   * Generate content for a single slide
   */
  const generateSlideContent = async ({ slideTitle, presentationContext = null }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/generate-slide-content', {
        slide_title: slideTitle,
        presentation_context: presentationContext
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to generate slide content';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Improve existing content
   */
  const improveContent = async ({
    currentContent,
    improvementType = 'general',
    context = null
  }) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/ai/improve-content', {
        current_content: currentContent,
        improvement_type: improvementType,
        context
      });

      setLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to improve content';
      setError(errorMessage);
      setLoading(false);
      throw new Error(errorMessage);
    }
  };

  /**
   * Generate an image
   */
  const generateImage = async ({
    prompt,
    style = 'professional',
    referenceImage = null
  }) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      setProgress(20);
      
      const response = await api.post('/ai/generate-image', {
        prompt,
        style,
        reference_image: referenceImage
      });

      setProgress(100);
      setLoading(false);

      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to generate image';
      setError(errorMessage);
      setLoading(false);
      setProgress(0);
      throw new Error(errorMessage);
    }
  };

  /**
   * Check AI service health
   */
  const checkAIHealth = async () => {
    try {
      const response = await api.get('/ai/health');
      return response.data;
    } catch (err) {
      return {
        success: false,
        message: 'AI services unavailable'
      };
    }
  };

  return {
    loading,
    progress,
    error,
    generatePresentation,
    generateOutline,
    generateSlideContent,
    improveContent,
    generateImage,
    checkAIHealth,
    setError
  };
};

export default useAI;