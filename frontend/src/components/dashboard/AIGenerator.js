import React, { useState } from 'react';
import { useAI } from '../../hooks/useAI';
import { Sparkles, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

const AIGenerator = ({ onGenerated, onClose }) => {
  const [step, setStep] = useState(1); // 1: topic, 2: options, 3: generating
  const [formData, setFormData] = useState({
    topic: '',
    audience: 'general',
    tone: 'professional',
    slideCount: 10,
    additionalContext: ''
  });

  const { generatePresentation, loading, progress, error, setError } = useAI();

  const audiences = [
    { value: 'general', label: 'General Audience', icon: '👥' },
    { value: 'business', label: 'Business Professionals', icon: '💼' },
    { value: 'educational', label: 'Students & Educators', icon: '🎓' },
    { value: 'technical', label: 'Technical Experts', icon: '💻' }
  ];

  const tones = [
    { value: 'professional', label: 'Professional', icon: '👔' },
    { value: 'casual', label: 'Casual', icon: '😊' },
    { value: 'educational', label: 'Educational', icon: '📚' },
    { value: 'inspirational', label: 'Inspirational', icon: '✨' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleNext = () => {
    if (step === 1 && formData.topic.trim().length < 3) {
      setError('Please enter a topic (at least 3 characters)');
      return;
    }
    setStep(2);
  };

  const handleGenerate = async () => {
    setStep(3);
    try {
      const result = await generatePresentation(formData);
      
      if (result.success && result.data) {
        // Pass generated data back to parent
        onGenerated(result.data);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (err) {
      console.error('Generation error:', err);
      setStep(2); // Go back to options
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AI Presentation Generator</h2>
              <p className="text-white/80 text-sm">Create a professional presentation in seconds</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {step === 3 && (
          <div className="px-6 pt-6">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-600 mt-2">
              Generating your presentation... {progress}%
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">Generation Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Topic */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What's your presentation about?
                </label>
                <textarea
                  name="topic"
                  value={formData.topic}
                  onChange={handleInputChange}
                  placeholder="E.g., The Future of Artificial Intelligence, Marketing Strategy for 2025, Introduction to React"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={4}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Be specific! The more detail you provide, the better your presentation will be.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  disabled={formData.topic.trim().length < 3}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Options */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Audience */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Target Audience
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {audiences.map((aud) => (
                    <button
                      key={aud.value}
                      onClick={() => setFormData(prev => ({ ...prev, audience: aud.value }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.audience === aud.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{aud.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{aud.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Presentation Tone
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {tones.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setFormData(prev => ({ ...prev, tone: t.value }))}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        formData.tone === t.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <div className="text-sm font-medium text-gray-900">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Slide Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Slides: {formData.slideCount}
                </label>
                <input
                  type="range"
                  name="slideCount"
                  min="5"
                  max="15"
                  value={formData.slideCount}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5 slides</span>
                  <span>15 slides</span>
                </div>
              </div>

              {/* Additional Context */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional Context (Optional)
                </label>
                <textarea
                  name="additionalContext"
                  value={formData.additionalContext}
                  onChange={handleInputChange}
                  placeholder="Any specific points you want to cover or additional requirements..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Presentation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generating */}
          {step === 3 && (
            <div className="text-center py-12">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Creating Your Presentation
              </h3>
              <p className="text-gray-600">
                AI is working its magic... This usually takes 10-20 seconds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIGenerator;