import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import DashboardUser from './components/DashboardUser';
import DashboardVolunteer from './components/DashboardVolunteer';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardNGO from './components/DashboardNGO';
import ReportForm from './components/ReportForm';
import ResQChatbot from './components/ResQChatbot';
import { X, LogOut, ArrowRight, Shield } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState(localStorage.getItem('token') ? 'dashboard' : 'home'); // 'home', 'dashboard', 'report-animal'
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('theme') === 'dark');

  // Authentication Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('reporter');
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('user'); // 'user', 'admin'

  // Dark Mode Sync Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const handleToggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  // Validate Token on startup
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Invalid token');
      })
      .then(data => {
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        setIsLoggedIn(true);
        setCurrentView('dashboard');
      })
      .catch(err => {
        console.error(err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        setUser(null);
        setCurrentView('home');
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentView('home');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        setShowLogin(false);
        setCurrentView('dashboard');
        
        // Reset fields
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection refused. Please start the backend server.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        setShowRegister(false);
        setCurrentView('dashboard');
        
        // Reset fields
        setName('');
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection refused. Please start the backend server.');
    }
  };

  // Quick roles login helper
  const handleQuickLogin = (selectedRole) => {
    setError('');
    let quickEmail = '';
    if (selectedRole === 'reporter') quickEmail = 'vishal@resqpaws.org';
    if (selectedRole === 'volunteer') quickEmail = 'rahul@resqpaws.org';
    if (selectedRole === 'admin') quickEmail = 'admin@resqpaws.org';
    if (selectedRole === 'ngo') quickEmail = 'ngo@resqpaws.org';

    setEmail(quickEmail);
    setPassword('123456');

    // Submit instantly
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: quickEmail, password: '123456' })
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        setIsLoggedIn(true);
        setShowLogin(false);
        setCurrentView('dashboard');
      } else {
        setError(data.message || 'Quick login failed');
      }
    })
    .catch(() => setError('Backend server offline. Please start it.'));
  };

  // Navigation Logic
  const handleNavigate = (view) => {
    if (view === 'report-animal' && !isLoggedIn) {
      setShowLogin(true);
      return;
    }
    setCurrentView(view);
  };

  // Main Render Logic
  const renderBody = () => {
    if (currentView === 'home') {
      return (
        <LandingPage
          onNavigate={handleNavigate}
          onOpenLogin={() => setShowLogin(true)}
          onOpenRegister={() => setShowRegister(true)}
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          onToggleTheme={handleToggleTheme}
        />
      );
    }

    if (isLoggedIn && user) {
      // Handle Report form embedded within dashboard context
      if (currentView === 'report-animal') {
        return (
          <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--light-gray)' }}>
            {/* User Sidebar wrapper */}
            <aside style={{
              width: '260px',
              backgroundColor: 'var(--white)',
              borderRight: '1px solid var(--border-color)',
              padding: '24px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '30px',
              position: 'sticky',
              top: 0,
              height: '100vh'
            }}>
              <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px' }}>
                <div style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '6px', borderRadius: '8px', display: 'flex' }}>🐾</div>
                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E5F3F', fontFamily: 'var(--font-heading)' }}>ResQ Paws</span>
              </div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <button onClick={() => handleNavigate('dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: 'var(--text-medium)', fontWeight: 500 }}>
                  📂 Dashboard
                </button>
                <button onClick={() => handleNavigate('report-animal')} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '8px', color: '#1E5F3F', backgroundColor: '#EBF5F0', fontWeight: 600 }}>
                  ➕ Report Animal
                </button>
              </nav>
              <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', color: '#ef4444', fontWeight: 600 }}>
                🚪 Logout
              </button>
            </aside>

            <main style={{ flex: 1, overflowY: 'auto' }}>
              <ReportForm 
                user={user} 
                onAddReport={() => setCurrentView('dashboard')} 
                onCancel={() => setCurrentView('dashboard')} 
                isDarkMode={isDarkMode}
                onToggleTheme={handleToggleTheme}
              />
            </main>
          </div>
        );
      }

      // Check user role to serve correct dashboard
      if (user.role === 'reporter') {
        return <DashboardUser user={user} onUpdateUser={setUser} onNavigate={handleNavigate} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />;
      }
      if (user.role === 'volunteer') {
        return <DashboardVolunteer user={user} onUpdateUser={setUser} onNavigate={handleNavigate} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />;
      }
      if (user.role === 'ngo') {
        return <DashboardNGO user={user} onUpdateUser={setUser} onNavigate={handleNavigate} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />;
      }
      if (user.role === 'admin') {
        return <DashboardAdmin user={user} onUpdateUser={setUser} onNavigate={handleNavigate} onLogout={handleLogout} isDarkMode={isDarkMode} onToggleTheme={handleToggleTheme} />;
      }
    }

    return (
      <LandingPage 
        onNavigate={handleNavigate} 
        onOpenLogin={() => setShowLogin(true)} 
        onOpenRegister={() => setShowRegister(true)} 
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
      />
    );
  };

  return (
    <>
      {renderBody()}

      {/* Login Modal */}
      {showLogin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div className="card animate-fade-in" style={{ width: '420px', position: 'relative', padding: '40px 30px 30px' }}>
            <button 
              onClick={() => setShowLogin(false)} 
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: '#1E5F3F',
                backgroundColor: '#EBF5F0',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#1E5F3F'; e.target.style.color = '#ffffff'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#EBF5F0'; e.target.style.color = '#1E5F3F'; }}
            >
              ← Back to Home
            </button>
            <button 
              onClick={() => setShowLogin(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'center' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', textAlign: 'center', marginBottom: '24px' }}>
              Login to access your animal rescue dashboard
            </p>

            {/* Login Type Tabs */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--light-gray)',
              padding: '4px',
              borderRadius: '30px',
              marginBottom: '24px',
              border: '1px solid var(--border-color)'
            }}>
              <button
                onClick={() => {
                  setLoginType('user');
                  setEmail('vishal@resqpaws.org');
                  setPassword('123456');
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '25px',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  backgroundColor: loginType === 'user' ? '#1E5F3F' : 'transparent',
                  color: loginType === 'user' ? '#ffffff' : 'var(--text-medium)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                👤 User Login
              </button>
              <button
                onClick={() => {
                  setLoginType('admin');
                  setEmail('admin@resqpaws.org');
                  setPassword('123456');
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  borderRadius: '25px',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  backgroundColor: loginType === 'admin' ? '#1E5F3F' : 'transparent',
                  color: loginType === 'admin' ? '#ffffff' : 'var(--text-medium)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                👑 Admin Login
              </button>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  backgroundColor: '#1E5F3F',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  marginTop: '10px',
                  color: '#ffffff'
                }}
              >
                Sign In
              </button>
            </form>


            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '24px', textAlign: 'center' }}>
              Don't have an account?{' '}
              <button 
                onClick={() => { setShowLogin(false); setShowRegister(true); }}
                style={{ color: '#1E5F3F', fontWeight: 600 }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div className="card animate-fade-in" style={{ width: '420px', position: 'relative', padding: '40px 30px 30px' }}>
            <button 
              onClick={() => setShowRegister(false)} 
              style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: '#1E5F3F',
                backgroundColor: '#EBF5F0',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { e.target.style.backgroundColor = '#1E5F3F'; e.target.style.color = '#ffffff'; }}
              onMouseOut={(e) => { e.target.style.backgroundColor = '#EBF5F0'; e.target.style.color = '#1E5F3F'; }}
            >
              ← Back to Home
            </button>
            <button 
              onClick={() => setShowRegister(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', textAlign: 'center' }}>Create Account</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', textAlign: 'center', marginBottom: '20px' }}>
              Join the ResQ Paws community today
            </p>

            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fee2e2',
                color: '#b91c1c',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '16px',
                textAlign: 'left'
              }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="John Doe" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

               <div className="form-group">
                <label className="form-label">Register As</label>
                <select 
                  className="form-control"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="reporter">Reporter (Submit cases)</option>
                  <option value="volunteer">Volunteer (Rescue animals)</option>
                  <option value="ngo">NGO (Coordinate & Rescue)</option>
                </select>
              </div>

              <button 
                type="submit" 
                style={{
                  width: '100%',
                  backgroundColor: '#1E5F3F',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  marginTop: '10px',
                  color: '#ffffff'
                }}
              >
                Get Started
              </button>
            </form>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '20px', textAlign: 'center' }}>
              Already have an account?{' '}
              <button 
                onClick={() => { setShowRegister(false); setShowLogin(true); }}
                style={{ color: '#1E5F3F', fontWeight: 600 }}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      )}
      <ResQChatbot isDarkMode={isDarkMode} />
    </>
  );
}

export default App;
