import { useState } from 'react';
import api from '../utils/api';

export const usePresentation = () => {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPresentations = async (search = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = search ? { search } : {};
      const response = await api.get('/presentations', { params });
      setPresentations(response.data);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to fetch presentations';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createPresentation = async (title, description, template_id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/presentations', {
        title,
        description,
        template_id,
      });
      setPresentations([response.data, ...presentations]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create presentation';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deletePresentation = async (presentationId) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/presentations/${presentationId}`);
      setPresentations(presentations.filter(p => p.id !== presentationId));
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete presentation';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updatePresentation = async (presentationId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/presentations/${presentationId}`, updates);
      setPresentations(presentations.map(p => 
        p.id === presentationId ? response.data : p
      ));
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update presentation';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const createPresentationFromAI = async (aiData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/presentations/from-ai', aiData);
      setPresentations([response.data, ...presentations]);
      return { success: true, data: response.data };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create presentation from AI';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  return {
    presentations,
    loading,
    error,
    fetchPresentations,
    createPresentation,
    deletePresentation,
    updatePresentation,
    createPresentationFromAI,
  };
};