import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { LogOut, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-page">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Slideo</h1>
              <p className="text-sm text-gray-600">{user?.workspace_name || 'My Workspace'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600" data-testid="user-name">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} data-testid="logout-button">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Your Presentations</h2>
            <p className="text-gray-600 mt-1">Create and manage your AI-powered presentations</p>
          </div>
          <Button className="gap-2" data-testid="create-presentation-button">
            <Plus className="w-5 h-5" />
            Create New
          </Button>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center" data-testid="empty-state">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No presentations yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get started by creating your first AI-powered presentation. Describe your topic and let AI do the work.
          </p>
          <Button data-testid="empty-state-create-button">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Presentation
          </Button>
        </div>
      </main>
    </div>
  );
};