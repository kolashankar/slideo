import React, { useState } from 'react';
import { X, Command, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Delete as DeleteIcon } from 'lucide-react';

const KeyboardShortcuts = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'Editor',
      items: [
        { keys: ['Ctrl', 'Z'], action: 'Undo' },
        { keys: ['Ctrl', 'Y'], action: 'Redo' },
        { keys: ['Delete'], action: 'Delete selected element' },
        { keys: ['←', '→', '↑', '↓'], action: 'Move selected element' },
        { keys: ['Ctrl', 'S'], action: 'Save presentation' },
      ],
    },
    {
      category: 'Presentation Mode',
      items: [
        { keys: ['→', 'Space'], action: 'Next slide' },
        { keys: ['←'], action: 'Previous slide' },
        { keys: ['F'], action: 'Toggle fullscreen' },
        { keys: ['N'], action: 'Toggle speaker notes' },
        { keys: ['ESC'], action: 'Exit presentation' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { keys: ['Ctrl', 'N'], action: 'New presentation' },
        { keys: ['Ctrl', 'O'], action: 'Open presentation' },
        { keys: ['ESC'], action: 'Close modal/panel' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {shortcuts.map((section, idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {section.category}
              </h3>
              <div className="space-y-3">
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-gray-700">{item.action}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="px-3 py-1.5 bg-gray-100 border border-gray-300 rounded text-sm font-mono">
                            {key}
                          </kbd>
                          {keyIdx < item.keys.length - 1 && (
                            <span className="text-gray-400 mx-1">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600 text-center">
            Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">?</kbd> anytime to show this guide
          </p>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
