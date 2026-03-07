import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/src/context/AuthContext';
import { Button } from '@/src/components/ui/button';
import { GraduationCap, LogOut } from 'lucide-react';

export function Navbar() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="border-b border-zinc-800 bg-zinc-950 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-zinc-50">
          <GraduationCap className="h-6 w-6 text-indigo-500" />
          <span className="text-xl font-semibold tracking-tight">Classroom Portal</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-zinc-400">
                Welcome, <strong className="text-zinc-200">{user.name}</strong> ({user.role})
              </span>
              <Button variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-zinc-50">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-zinc-400 hover:text-zinc-50">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
