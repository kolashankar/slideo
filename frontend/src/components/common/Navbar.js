import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { LogOut, Sparkles, ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ presentation, saving }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <header className="bg-white border-b border-gray-200" data-testid="navbar">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {presentation ? (
            <>
              <button
                onClick={goToDashboard}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{presentation.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {saving ? (
                    <>
                      <Save className="h-3 w-3 animate-pulse" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-3 w-3" />
                      <span>All changes saved</span>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Slideo</h1>
                <p className="text-sm text-gray-600">{user?.workspace_name || 'My Workspace'}</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600" data-testid="navbar-user-name">{user?.name}</span>
          <Button variant="outline" size="sm" onClick={handleLogout} data-testid="navbar-logout-button">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};