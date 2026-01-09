/**
 * Template Engine
 * Utilities for applying templates to presentations and slides
 */

// Color schemes for templates
export const colorSchemes = {
  modernBusiness: {
    name: 'Modern Business',
    primary: '#2563EB',
    secondary: '#64748B',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1E293B'
  },
  boldPitch: {
    name: 'Bold Pitch',
    primary: '#DC2626',
    secondary: '#000000',
    accent: '#FBBF24',
    background: '#FFFFFF',
    text: '#000000'
  },
  minimalWhite: {
    name: 'Minimal White',
    primary: '#000000',
    secondary: '#6B7280',
    accent: '#3B82F6',
    background: '#FFFFFF',
    text: '#111827'
  },
  darkElegance: {
    name: 'Dark Elegance',
    primary: '#1F2937',
    secondary: '#D97706',
    accent: '#FCD34D',
    background: '#111827',
    text: '#F9FAFB'
  },
  gradientFlow: {
    name: 'Gradient Flow',
    primary: '#8B5CF6',
    secondary: '#3B82F6',
    accent: '#EC4899',
    background: '#FFFFFF',
    text: '#1E293B'
  },
  educational: {
    name: 'Educational',
    primary: '#0EA5E9',
    secondary: '#64748B',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1E293B'
  },
  creativeBurst: {
    name: 'Creative Burst',
    primary: '#EC4899',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1E293B'
  },
  startupPitch: {
    name: 'Startup Pitch',
    primary: '#6366F1',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#FFFFFF',
    text: '#1E293B'
  },
  portfolio: {
    name: 'Portfolio',
    primary: '#000000',
    secondary: '#6B7280',
    accent: '#8B5CF6',
    background: '#F9FAFB',
    text: '#000000'
  },
  corporate: {
    name: 'Corporate Standard',
    primary: '#1E40AF',
    secondary: '#64748B',
    accent: '#059669',
    background: '#FFFFFF',
    text: '#1E293B'
  }
};

// Font pairings
export const fontPairings = {
  modern: {
    name: 'Modern',
    heading: 'Inter',
    body: 'Inter'
  },
  elegant: {
    name: 'Elegant',
    heading: 'Playfair Display',
    body: 'Source Sans Pro'
  },
  professional: {
    name: 'Professional',
    heading: 'Roboto',
    body: 'Open Sans'
  },
  creative: {
    name: 'Creative',
    heading: 'Poppins',
    body: 'Nunito'
  },
  minimal: {
    name: 'Minimal',
    heading: 'Helvetica',
    body: 'Arial'
  }
};

/**
 * Apply template styles to a slide
 */
export const applyTemplateToSlide = (slide, template, colorScheme, fontPairing) => {
  const updatedSlide = { ...slide };
  
  // Update background
  if (template.background) {
    updatedSlide.background = {
      ...template.background,
      color: colorScheme.background
    };
  }
  
  // Update elements
  if (updatedSlide.elements) {
    updatedSlide.elements = updatedSlide.elements.map(element => {
      const updatedElement = { ...element };
      
      if (element.type === 'text') {
        // Apply font pairing
        const isHeading = element.style?.font_size > 30;
        updatedElement.style = {
          ...element.style,
          font_family: isHeading ? fontPairing.heading : fontPairing.body,
          color: colorScheme.text
        };
      } else if (element.type === 'shape') {
        // Apply color scheme to shapes
        updatedElement.style = {
          ...element.style,
          fill_color: colorScheme.primary,
          stroke_color: colorScheme.secondary
        };
      }
      
      return updatedElement;
    });
  }
  
  return updatedSlide;
};

/**
 * Apply template to entire presentation
 */
export const applyTemplateToPresentation = (slides, template, colorScheme, fontPairing) => {
  return slides.map(slide => applyTemplateToSlide(slide, template, colorScheme, fontPairing));
};

/**
 * Get template preview data
 */
export const getTemplatePreview = (templateId) => {
  const templates = {
    'modern-business': {
      id: 'modern-business',
      name: 'Modern Business',
      colorScheme: colorSchemes.modernBusiness,
      fontPairing: fontPairings.professional,
      thumbnail: '/templates/modern-business.png'
    },
    'bold-pitch': {
      id: 'bold-pitch',
      name: 'Bold Pitch',
      colorScheme: colorSchemes.boldPitch,
      fontPairing: fontPairings.modern,
      thumbnail: '/templates/bold-pitch.png'
    },
    'minimal-white': {
      id: 'minimal-white',
      name: 'Minimal White',
      colorScheme: colorSchemes.minimalWhite,
      fontPairing: fontPairings.minimal,
      thumbnail: '/templates/minimal-white.png'
    },
    'dark-elegance': {
      id: 'dark-elegance',
      name: 'Dark Elegance',
      colorScheme: colorSchemes.darkElegance,
      fontPairing: fontPairings.elegant,
      thumbnail: '/templates/dark-elegance.png'
    },
    'gradient-flow': {
      id: 'gradient-flow',
      name: 'Gradient Flow',
      colorScheme: colorSchemes.gradientFlow,
      fontPairing: fontPairings.modern,
      thumbnail: '/templates/gradient-flow.png'
    },
    'educational': {
      id: 'educational',
      name: 'Educational',
      colorScheme: colorSchemes.educational,
      fontPairing: fontPairings.professional,
      thumbnail: '/templates/educational.png'
    },
    'creative-burst': {
      id: 'creative-burst',
      name: 'Creative Burst',
      colorScheme: colorSchemes.creativeBurst,
      fontPairing: fontPairings.creative,
      thumbnail: '/templates/creative-burst.png'
    },
    'startup-pitch': {
      id: 'startup-pitch',
      name: 'Startup Pitch',
      colorScheme: colorSchemes.startupPitch,
      fontPairing: fontPairings.modern,
      thumbnail: '/templates/startup-pitch.png'
    },
    'portfolio': {
      id: 'portfolio',
      name: 'Portfolio',
      colorScheme: colorSchemes.portfolio,
      fontPairing: fontPairings.elegant,
      thumbnail: '/templates/portfolio.png'
    },
    'corporate': {
      id: 'corporate',
      name: 'Corporate Standard',
      colorScheme: colorSchemes.corporate,
      fontPairing: fontPairings.professional,
      thumbnail: '/templates/corporate.png'
    }
  };
  
  return templates[templateId] || templates['modern-business'];
};

/**
 * Get all available templates
 */
export const getAllTemplates = () => {
  return [
    { id: 'modern-business', name: 'Modern Business', category: 'Business' },
    { id: 'bold-pitch', name: 'Bold Pitch', category: 'Business' },
    { id: 'minimal-white', name: 'Minimal White', category: 'Minimal' },
    { id: 'dark-elegance', name: 'Dark Elegance', category: 'Premium' },
    { id: 'gradient-flow', name: 'Gradient Flow', category: 'Creative' },
    { id: 'educational', name: 'Educational', category: 'Education' },
    { id: 'creative-burst', name: 'Creative Burst', category: 'Creative' },
    { id: 'startup-pitch', name: 'Startup Pitch', category: 'Business' },
    { id: 'portfolio', name: 'Portfolio', category: 'Creative' },
    { id: 'corporate', name: 'Corporate Standard', category: 'Business' }
  ];
};
