import { useState, useEffect } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import DirectorDashboard from './components/DirectorDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import StudentDashboard from './components/StudentDashboard';

import { BookOpen, Clock, Shield, Sun, Moon, GraduationCap } from 'lucide-react';

import Login from './components/Login';

function AppContent() {
  const { currentUser, logoutUser } = useSchool();
  const [theme, setTheme] = useState(() => localStorage.getItem('oasis_theme') || 'dark');

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('oasis_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  if (!currentUser) {
    return (
      <div className="app-container login-layout" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <header style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
          <button 
            id="theme-toggle-btn"
            className="theme-toggle" 
            onClick={toggleTheme} 
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </header>
        <Login />
      </div>
    );
  }

  const role = currentUser.role;

  // Profiles based on selected role
  const getProfile = () => {
    switch(role) {
      case 'director':
        return { name: currentUser.name, sub: 'Academy Headmaster', initials: currentUser.initials || 'DA' };
      case 'teacher':
        return { name: currentUser.name, sub: `${currentUser.subject} Teacher`, initials: currentUser.initials || 'TCH' };
      case 'employee':
        return { name: currentUser.name, sub: currentUser.jobRole || 'Staff Member', initials: currentUser.initials || 'EMP' };
      case 'student':
        return { name: currentUser.name, sub: `${currentUser.class} Student`, initials: currentUser.initials || 'STD' };
      default:
        return { name: 'Guest User', sub: 'SpringOasis', initials: 'GU' };
    }
  };

  const profile = getProfile();

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="logo-container">
          <GraduationCap className="logo-icon" size={32} />
          <span className="logo-text">SpringOasis</span>
        </div>

        <nav aria-label="Main system sidebar navigation" style={{ marginTop: '20px' }}>
          <ul className="nav-links">
            {role === 'director' && (
              <li>
                <button 
                  id="nav-btn-director"
                  className="nav-link active"
                >
                  <Shield size={20} />
                  <span>Director Console</span>
                </button>
              </li>
            )}
            {role === 'teacher' && (
              <li>
                <button 
                  id="nav-btn-teacher"
                  className="nav-link active"
                >
                  <BookOpen size={20} />
                  <span>Teacher Desk</span>
                </button>
              </li>
            )}
            {role === 'employee' && (
              <li>
                <button 
                  id="nav-btn-employee"
                  className="nav-link active"
                >
                  <Clock size={20} />
                  <span>Employee Portal</span>
                </button>
              </li>
            )}
            {role === 'student' && (
              <li>
                <button 
                  id="nav-btn-student"
                  className="nav-link active"
                >
                  <GraduationCap size={20} />
                  <span>Student Hub</span>
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Sidebar Footer Info */}
        <div className="sidebar-footer">
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
            <span>Term: Spring 2026</span>
            <br />
            <span>User: {currentUser.username || currentUser.id}</span>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <div className="main-wrapper">
        <header className="top-navbar">
          <div className="header-title-container">
            <h1 id="main-view-title" style={{ fontSize: '1.4rem', textTransform: 'capitalize' }}>
              {role === 'director' && 'Director Administrative Console'}
              {role === 'teacher' && 'Teacher Classroom Hub'}
              {role === 'employee' && 'Employee Supply & Attendance Portal'}
              {role === 'student' && 'Student Academic Hub'}
            </h1>
          </div>

          <div className="header-controls">
            {/* Dark/Light mode toggle */}
            <button 
              id="theme-toggle-btn"
              className="theme-toggle" 
              onClick={toggleTheme} 
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Logout button */}
            <button 
              id="logout-btn"
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', borderColor: 'var(--color-border)' }}
              onClick={logoutUser}
            >
              <span>Sign Out</span>
            </button>

            {/* User Details Badge */}
            <div className="user-profile-badge">
              <div className="avatar">
                {profile.initials}
              </div>
              <div className="profile-info">
                <span className="profile-name">{profile.name}</span>
                <span className="profile-role">{profile.sub}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Dashboard */}
        <main className="page-content">
          {role === 'director' && <DirectorDashboard />}
          {role === 'teacher' && <TeacherDashboard overrideUser={currentUser} />}
          {role === 'employee' && <EmployeeDashboard overrideUser={{ id: currentUser.id, name: currentUser.name, role: currentUser.jobRole }} />}
          {role === 'student' && <StudentDashboard overrideStudentId={currentUser.id} />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SchoolProvider>
      <AppContent />
    </SchoolProvider>
  );
}
