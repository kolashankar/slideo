import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useNavigate } from 'react-router-dom';

export const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await signup(email, password, name, workspaceName || 'My Workspace');
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="signup-form">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          data-testid="signup-name-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          data-testid="signup-email-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          data-testid="signup-password-input"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspace">Workspace Name (Optional)</Label>
        <Input
          id="workspace"
          type="text"
          placeholder="My Workspace"
          value={workspaceName}
          onChange={(e) => setWorkspaceName(e.target.value)}
          data-testid="signup-workspace-input"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600" data-testid="signup-error-message">
          {error}
        </p>
      )}
      <Button 
        type="submit" 
        className="w-full" 
        disabled={loading}
        data-testid="signup-submit-button"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </Button>
    </form>
  );
};