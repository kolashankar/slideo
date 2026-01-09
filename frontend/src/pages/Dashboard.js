import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePresentation } from '../hooks/usePresentation';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Plus, Search, Grid3x3, List, Loader2, HelpCircle } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { PresentationCard } from '../components/dashboard/PresentationCard';
import { CreateNew } from '../components/dashboard/CreateNew';
import LoadingSkeleton from '../components/common/LoadingSkeleton';
import OnboardingTutorial from '../components/common/OnboardingTutorial';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    presentations,
    loading,
    fetchPresentations,
    createPresentation,
    deletePresentation,
  } = usePresentation();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    fetchPresentations();
    
    // Show onboarding for first-time users
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
      localStorage.setItem('hasSeenOnboarding', 'true');
    }
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    fetchPresentations(query);
  };

  const handleCreatePresentation = async (title, description, template_id) => {
    const result = await createPresentation(title, description, template_id);
    if (result.success) {
      // Optionally navigate to editor
      // navigate(`/editor/${result.data.id}`);
    }
    return result;
  };

  const handleDeletePresentation = async (presentationId) => {
    return await deletePresentation(presentationId);
  };

  const handlePresentationClick = (presentation) => {
    // Navigate to editor
    navigate(`/editor/${presentation.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-page">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Presentations</h2>
              <p className="text-gray-600 mt-1">
                {presentations.length} {presentations.length === 1 ? 'presentation' : 'presentations'}
              </p>
            </div>
            <Button 
              className="gap-2" 
              onClick={() => setShowCreateDialog(true)}
              data-testid="create-presentation-button"
            >
              <Plus className="w-5 h-5" />
              Create New
            </Button>
            <Button 
              variant="outline"
              className="gap-2" 
              onClick={() => setShowOnboarding(true)}
            >
              <HelpCircle className="w-5 h-5" />
              Tutorial
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search presentations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                data-testid="search-presentations-input"
              />
            </div>
            <Tabs value={viewMode} onValueChange={setViewMode}>
              <TabsList>
                <TabsTrigger value="grid" data-testid="grid-view-button">
                  <Grid3x3 className="w-4 h-4" />
                </TabsTrigger>
                <TabsTrigger value="list" data-testid="list-view-button">
                  <List className="w-4 h-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Loading State */}
        {loading && presentations.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!loading && presentations.length === 0 && !searchQuery && (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center" data-testid="empty-state">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No presentations yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first AI-powered presentation. Describe your topic and let AI do the work.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              data-testid="empty-state-create-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Presentation
            </Button>
          </div>
        )}

        {/* No Search Results */}
        {!loading && presentations.length === 0 && searchQuery && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              No presentations match "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => handleSearch('')}
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Presentations Grid */}
        {!loading && presentations.length > 0 && (
          <div 
            className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'}
            data-testid="presentations-grid"
          >
            {presentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                onDelete={handleDeletePresentation}
                onClick={handlePresentationClick}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create New Dialog */}
      <CreateNew
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreatePresentation}
      />
    </div>
  );
};