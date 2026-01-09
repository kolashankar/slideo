import { useState, useEffect, useCallback } from 'react';
import api from '@/utils/api';

export const useChat = (presentationId, currentSlide) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Load chat history
  const loadHistory = useCallback(async () => {
    if (!presentationId) return;
    
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/ai/chat-history/${presentationId}`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error loading chat history:', err);
      setError(err.response?.data?.detail || 'Failed to load chat history');
    } finally {
      setLoading(false);
    }
  }, [presentationId]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Send message
  const sendMessage = useCallback(async (message) => {
    if (!message.trim() || !presentationId) return;

    try {
      setSending(true);
      setError(null);

      // Build context from current slide
      const context = currentSlide ? {
        slide_id: currentSlide.id,
        slide_number: currentSlide.slide_number,
        slide_title: currentSlide.elements?.find(el => el.type === 'text')?.content?.text || 'Untitled',
        slide_content: currentSlide.elements
          ?.filter(el => el.type === 'text')
          .map(el => el.content?.text || '')
          .join(' ')
          .substring(0, 500)
      } : null;

      const response = await api.post('/api/ai/chat', {
        presentation_id: presentationId,
        message: message.trim(),
        context
      });

      if (response.data?.success) {
        const { user_message, assistant_message } = response.data.data;
        setMessages(prev => [...prev, user_message, assistant_message]);
        return assistant_message;
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.response?.data?.detail || 'Failed to send message');
      throw err;
    } finally {
      setSending(false);
    }
  }, [presentationId, currentSlide]);

  // Quick actions
  const improveContent = useCallback(async () => {
    if (!currentSlide) return;
    
    const slideContent = currentSlide.elements
      ?.filter(el => el.type === 'text')
      .map(el => el.content?.text || '')
      .join('\n');

    if (!slideContent) {
      setError('No content to improve on this slide');
      return;
    }

    return sendMessage(`Please suggest improvements for this slide content:\n\n${slideContent}`);
  }, [currentSlide, sendMessage]);

  const generateImage = useCallback(async () => {
    if (!currentSlide) return;
    
    const slideTitle = currentSlide.elements?.find(el => el.type === 'text')?.content?.text || 'Untitled';
    return sendMessage(`Generate an image idea for a slide titled "${slideTitle}"`);
  }, [currentSlide, sendMessage]);

  const suggestLayout = useCallback(async () => {
    if (!currentSlide) return;
    return sendMessage('Suggest a better layout for this slide');
  }, [currentSlide, sendMessage]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    sending,
    error,
    sendMessage,
    loadHistory,
    clearHistory,
    // Quick actions
    improveContent,
    generateImage,
    suggestLayout
  };
};
