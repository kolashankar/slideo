import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { TemplateSelector } from './TemplateSelector';
import { Sparkles } from 'lucide-react';

export const CreateNew = ({ open, onOpenChange, onCreate }) => {
  const [step, setStep] = useState(1); // 1: Details, 2: Template
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      // Reset form when dialog closes
      setTimeout(() => {
        setStep(1);
        setTitle('');
        setDescription('');
        setSelectedTemplate(null);
        setError('');
      }, 200);
    }
  }, [open]);

  const handleNext = () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    setLoading(true);
    setError('');

    const result = await onCreate(
      title,
      description,
      selectedTemplate?.id || null
    );

    setLoading(false);

    if (result.success) {
      onOpenChange(false);
    } else {
      setError(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="create-presentation-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Create New Presentation
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Give your presentation a title and description'
              : 'Choose a template or start from scratch'}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Presentation Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Q4 Business Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="presentation-title-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your presentation"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                data-testid="presentation-description-input"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600" data-testid="create-error-message">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleNext} data-testid="next-to-template-button">
                Next: Choose Template
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <TemplateSelector
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
            />

            {error && (
              <p className="text-sm text-red-600 mt-4" data-testid="create-error-message">{error}</p>
            )}

            <div className="flex justify-between gap-2 pt-6">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreate}
                  disabled={loading}
                  data-testid="create-presentation-submit"
                >
                  {loading ? 'Creating...' : 'Create Presentation'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};