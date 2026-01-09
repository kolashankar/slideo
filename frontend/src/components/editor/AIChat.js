import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  Image, 
  Layout,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

export const AIChat = ({ presentationId, currentSlide, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const chat = useChat(presentationId, currentSlide);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || chat.sending) return;

    const message = input;
    setInput('');
    
    try {
      await chat.sendMessage(message);
    } catch (err) {
      // Error is handled in the hook
    }
  };

  const handleQuickAction = async (action) => {
    try {
      if (action === 'improve') {
        await chat.improveContent();
      } else if (action === 'image') {
        await chat.generateImage();
      } else if (action === 'layout') {
        await chat.suggestLayout();
      }
    } catch (err) {
      // Error is handled in the hook
    }
  };

  return (
    <div className="w-96 h-full bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI Assistant</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <p className="text-xs text-gray-600 mb-2 font-medium">Quick Actions</p>
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickAction('improve')}
            disabled={!currentSlide || chat.sending}
            className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Improve
          </button>
          <button
            onClick={() => handleQuickAction('image')}
            disabled={!currentSlide || chat.sending}
            className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
          >
            <Image className="h-3.5 w-3.5" />
            Image
          </button>
          <button
            onClick={() => handleQuickAction('layout')}
            disabled={!currentSlide || chat.sending}
            className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1.5"
          >
            <Layout className="h-3.5 w-3.5" />
            Layout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chat.loading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
          </div>
        )}

        {!chat.loading && chat.messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Start a conversation!</p>
            <p className="text-xs text-gray-400 mt-1">Ask for suggestions to improve your presentation</p>
          </div>
        )}

        {chat.messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.created_at).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}

        {chat.sending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
            </div>
          </div>
        )}

        {chat.error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{chat.error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for suggestions..."
            disabled={chat.sending}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!input.trim() || chat.sending}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {chat.sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
