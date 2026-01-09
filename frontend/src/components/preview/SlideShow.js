import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SlideShow = ({ slides, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

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
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide, slides.length]);

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (prev >= slides.length - 1) {
            setIsAutoPlay(false);
            return prev;
          }
          return prev + 1;
        });
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  const nextSlide = useCallback(() => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((prev) => prev + 1);
    }
  }, [currentSlide, slides.length]);

  const prevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }, [currentSlide]);

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
            alignItems:
              elementStyle?.vertical_align === 'middle'
                ? 'center'
                : elementStyle?.vertical_align === 'bottom'
                ? 'flex-end'
                : 'flex-start',
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
            borderRadius:
              content.shape === 'circle'
                ? '50%'
                : `${elementStyle?.border_radius || 0}px`,
            border: elementStyle?.stroke
              ? `${elementStyle.stroke_width || 1}px solid ${elementStyle.stroke}`
              : 'none',
          }}
        />
      );
    }

    return null;
  };

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlideData = slides[currentSlide];

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Slide Display */}
      <div className="flex-1 flex items-center justify-center">
        <div
          className="relative"
          style={{
            width: '1280px',
            height: '720px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            backgroundColor: currentSlideData.background?.color || '#ffffff',
          }}
        >
          {currentSlideData.elements?.map(renderSlideElement)}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-gray-900/80 px-6 py-3 rounded-full backdrop-blur-sm">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="p-2 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="text-white text-sm font-medium px-4">
          {currentSlide + 1} / {slides.length}
        </div>

        <button
          onClick={nextSlide}
          disabled={currentSlide === slides.length - 1}
          className="p-2 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed rounded-full transition"
        >
          <ChevronRight size={24} />
        </button>

        <div className="w-px h-6 bg-white/20 mx-2" />

        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            isAutoPlay
              ? 'bg-blue-600 text-white'
              : 'text-white hover:bg-white/10'
          }`}
        >
          {isAutoPlay ? 'Pause' : 'Auto Play'}
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2 text-white hover:bg-white/10 rounded-full text-sm font-medium transition"
        >
          Exit (ESC)
        </button>
      </div>
    </div>
  );
};

export default SlideShow;
