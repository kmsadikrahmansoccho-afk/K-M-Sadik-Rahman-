import React, { useState, useEffect } from 'react';
import { MinimalHomepage } from './components/home/MinimalHomepage';
import { StudentAuthModal } from './components/auth/StudentAuthModal';
import { ParentAuthModal } from './components/auth/ParentAuthModal';
import { AdminAuthModal } from './components/auth/AdminAuthModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { ParentDashboard } from './components/parent/ParentDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { getStoredSession, clearSession, api } from './services/api';
import type { User, AuthSession } from './types';
import { Loader2 } from 'lucide-react';

export function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSession, setCurrentSession] = useState<AuthSession | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Authentication Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isParentModalOpen, setIsParentModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Check stored session on initial mount
  useEffect(() => {
    const { token, user } = getStoredSession();
    if (token && user) {
      api.getMe()
        .then((res) => {
          setCurrentUser(res.user);
          setCurrentSession(res.session);
        })
        .catch(() => {
          clearSession();
          setCurrentUser(null);
          setCurrentSession(null);
        })
        .finally(() => {
          setIsInitializing(false);
        });
    } else {
      setIsInitializing(false);
    }
  }, []);

  const handleAuthenticated = (user: User, session: AuthSession) => {
    setCurrentUser(user);
    setCurrentSession(session);
    setIsStudentModalOpen(false);
    setIsParentModalOpen(false);
    setIsAdminModalOpen(false);
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setCurrentSession(null);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-emerald-400 font-mono text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Initializing Shikkhora Platform...</span>
        </div>
      </div>
    );
  }

  // Authenticated Views by Role
  if (currentUser && currentSession) {
    if (currentUser.role === 'admin') {
      return (
        <AdminDashboard
          user={currentUser}
          session={currentSession}
          onLogout={handleLogout}
        />
      );
    }

    if (currentUser.role === 'parent') {
      return (
        <ParentDashboard
          user={currentUser}
          session={currentSession}
          onLogout={handleLogout}
        />
      );
    }

    // Default to Student Role
    return (
      <StudentDashboard
        user={currentUser}
        session={currentSession}
        onLogout={handleLogout}
      />
    );
  }

  // Unauthenticated Minimal Homepage
  return (
    <>
      <MinimalHomepage
        onOpenStudentLogin={() => setIsStudentModalOpen(true)}
        onOpenParentLogin={() => setIsParentModalOpen(true)}
        onOpenAdminLogin={() => setIsAdminModalOpen(true)}
      />

      {/* Student Login & Registration Modal */}
      <StudentAuthModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Parent Login & Registration Modal */}
      <ParentAuthModal
        isOpen={isParentModalOpen}
        onClose={() => setIsParentModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

      {/* Dedicated Main Admin Auth Modal */}
      <AdminAuthModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
    </>
  );
}

export default App;
