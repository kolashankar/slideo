import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';

const OnboardingTutorial = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to Slideo!',
      description: 'Create stunning AI-powered presentations in minutes. Let\'s take a quick tour.',
      image: '🎉',
    },
    {
      title: 'Create Presentations',
      description: 'Start from scratch or use AI to generate a complete presentation from a simple prompt.',
      image: '✨',
    },
    {
      title: 'Edit with Ease',
      description: 'Drag, drop, and customize elements. Add text, images, and shapes to make your slides perfect.',
      image: '🎨',
    },
    {
      title: 'AI Assistant',
      description: 'Chat with our AI assistant for content suggestions, improvements, and design tips.',
      image: '🤖',
    },
    {
      title: 'Beautiful Templates',
      description: 'Choose from professional templates and customize colors and fonts to match your brand.',
      image: '🎯',
    },
    {
      title: 'Present & Share',
      description: 'Present in fullscreen mode, export to PDF, or share a link with your audience.',
      image: '🚀',
    },
  ];

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Getting Started</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 text-center">
          <div className="text-6xl mb-6">{currentStepData.image}</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {currentStepData.title}
          </h3>
          <p className="text-gray-600 mb-8">{currentStepData.description}</p>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 border-t flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition disabled:opacity-0 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="text-sm text-gray-500">
            {currentStep + 1} of {steps.length}
          </span>

          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            {isLastStep ? 'Get Started' : 'Next'}
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
