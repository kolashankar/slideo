import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, Clock, FileText, Maximize, Download, Share2 } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';

const Preview = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [presentation, setPresentation] = useState(null);
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Load presentation data
  useEffect(() => {
    const loadPreview = async () => {
      try {
        const response = await api.get(`/api/export/preview/${id}${token ? `?token=${token}` : ''}`);
        setPresentation(response.data.presentation);
        setSlides(response.data.slides);
      } catch (error) {
        console.error('Error loading preview:', error);
        toast.error('Failed to load presentation');
      } finally {
        setLoading(false);
      }
    };
    loadPreview();
  }, [id, token]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevSlide();
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          exitFullscreen();
        } else {
          navigate(-1);
        }
      } else if (e.key === 'n' || e.key === 'N') {
        setShowNotes(prev => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length, isFullscreen]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  }, [currentSlide]);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      await document.documentElement.requestFullscreen();
      setIsTimerRunning(true);
    } else {
      await document.exitFullscreen();
    }
  };

  const exitFullscreen = async () => {
    if (isFullscreen) {
      await document.exitFullscreen();
    }
  };

  const handleExport = async () => {
    try {
      const response = await api.post(`/api/export/pdf/${id}`, {}, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${presentation?.title || 'presentation'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleShare = async () => {
    try {
      const response = await api.post(`/api/export/share/${id}`);
      const shareLink = response.data.share_link;
      
      await navigator.clipboard.writeText(shareLink);
      toast.success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error generating share link:', error);
      toast.error('Failed to generate share link');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderSlideElement = (element) => {
    const { type, content, position, style: elementStyle } = element;
    const positionStyle = {
      position: 'absolute',
      left: `${position.x}px`,
      top: `${position.y}px`,
      width: `${position.width}px`,
      height: `${position.height}px`,
      zIndex: position.z_index || 1,
    };

    if (type === 'text') {
      return (
        <div
          key={element.id}
          style={{
            ...positionStyle,
            fontFamily: elementStyle?.font_family || 'Inter',
            fontSize: `${elementStyle?.font_size || 16}px`,
            fontWeight: elementStyle?.font_weight || 400,
            color: elementStyle?.color || '#000000',
            textAlign: elementStyle?.align || 'left',
            display: 'flex',
            alignItems: elementStyle?.vertical_align === 'middle' ? 'center' : elementStyle?.vertical_align === 'bottom' ? 'flex-end' : 'flex-start',
          }}
        >
          {content.text}
        </div>
      );
    }

    if (type === 'image') {
      return (
        <img
          key={element.id}
          src={content.url}
          alt={content.alt || 'Slide image'}
          style={{
            ...positionStyle,
            objectFit: elementStyle?.object_fit || 'cover',
            opacity: elementStyle?.opacity || 1,
            borderRadius: `${elementStyle?.border_radius || 0}px`,
          }}
        />
      );
    }

    if (type === 'shape') {
      return (
        <div
          key={element.id}
          style={{
            ...positionStyle,
            backgroundColor: elementStyle?.fill || '#000000',
            opacity: elementStyle?.opacity || 1,
            borderRadius: content.shape === 'circle' ? '50%' : `${elementStyle?.border_radius || 0}px`,
            border: elementStyle?.stroke ? `${elementStyle.stroke_width || 1}px solid ${elementStyle.stroke}` : 'none',
          }}
        />
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading presentation...</div>
      </div>
    );
  }

  if (!presentation || slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-xl">Presentation not found</div>
      </div>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      {!isFullscreen && (
        <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={24} />
            </button>
            <div>
              <h1 className="text-white font-semibold text-lg">{presentation.title}</h1>
              <p className="text-gray-400 text-sm">{presentation.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                showNotes ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <FileText size={18} />
              <span>Notes</span>
            </button>
            <button
              onClick={handleShare}
              className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
            >
              <Download size={18} />
              <span>Export PDF</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
            >
              <Maximize size={18} />
              <span>Present</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div
            className="relative bg-white shadow-2xl"
            style={{
              width: '960px',
              height: '540px',
              maxWidth: '100%',
              aspectRatio: '16/9',
              backgroundColor: currentSlideData.background?.color || '#ffffff',
            }}
          >
            {currentSlideData.elements?.map(renderSlideElement)}
          </div>

          {/* Controls */}
          <div className="mt-6 flex items-center gap-6">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="text-white text-lg font-medium">
              {currentSlide + 1} / {slides.length}
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className="p-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full transition"
            >
              <ChevronRight size={24} />
            </button>

            {isTimerRunning && (
              <div className="ml-6 flex items-center gap-2 text-white">
                <Clock size={20} />
                <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Speaker Notes Panel */}
        {showNotes && !isFullscreen && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 p-6 overflow-y-auto">
            <h3 className="text-white font-semibold mb-4">Speaker Notes</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {currentSlideData.notes || 'No notes for this slide.'}
            </p>
          </div>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      {!isFullscreen && (
        <div className="bg-gray-800 px-6 py-3 border-t border-gray-700">
          <p className="text-gray-400 text-sm text-center">
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mr-2">←</kbd>
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs mr-4">→</kbd>
            Navigate
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs ml-6 mr-2">N</kbd>
            Toggle Notes
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs ml-6 mr-2">F</kbd>
            Fullscreen
            <kbd className="px-2 py-1 bg-gray-700 rounded text-xs ml-6 mr-2">ESC</kbd>
            Exit
          </p>
        </div>
      )}
    </div>
  );
};

export default Preview;
