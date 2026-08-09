import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Compass, CheckSquare, Trophy, Star, LogOut, Bell, Shield, User, Sun, Moon, Map, Award, Menu, X } from 'lucide-react';
import RescueMap from './RescueMap';
import SuccessStories from './SuccessStories';

export default function DashboardVolunteer({ user, onLogout, isDarkMode, onToggleTheme, onUpdateUser, onNavigate }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    availableCount: 0,
    acceptedCount: 0,
    completedCount: 0,
    rating: 4.8,
    profileCompletedCount: 0
  });

  const [availableCases, setAvailableCases] = useState([]);
  const [myRescues, setMyRescues] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'profile'
  const [profileForm, setProfileForm] = useState({ name: user.name || '', email: user.email || '', profilePicture: user.profilePicture || '' });
  const [profileSuccess, setProfileSuccess] = useState(false);

  const fetchVolunteerData = async () => {
    setLoading(true);
    try {
      // Fetch stats
      const statsRes = await fetch('/api/stats/dashboard', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch all reports
      const reportsRes = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setAllReports(reportsData);
        
        // Filter reports
        const available = reportsData.filter(r => r.status === 'reported');
        const accepted = reportsData.filter(r => r.volunteerId === user.id);

        setAvailableCases(available);
        setMyRescues(accepted);
      }
    } catch (err) {
      console.error('Error fetching volunteer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolunteerData();
  }, [user.id]);

  const handleClaimCase = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchVolunteerData();
      } else {
        alert('Could not claim case.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteCase = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action: 'complete' })
      });
      if (res.ok) {
        fetchVolunteerData();
      } else {
        alert('Could not complete case.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileForm(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateStr) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const renderSectionContent = () => {
    if (loading && activeSection !== 'profile') return <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>Loading cases...</p>;

    switch (activeSection) {
      case 'map':
        return (
          <RescueMap reports={allReports} isDarkMode={isDarkMode} />
        );

      case 'stories':
        return (
          <SuccessStories isDarkMode={isDarkMode} currentUser={user} />
        );

      case 'profile':
        return (
          <div className="card" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Volunteer Profile Settings</h2>
            {profileSuccess && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                Profile updated successfully!
              </div>
            )}
            <form onSubmit={handleProfileSubmit} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={profileForm.name} 
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={profileForm.email} 
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Profile Picture</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px', marginBottom: '15px' }}>
                  {profileForm.profilePicture && (
                    <img 
                      src={profileForm.profilePicture} 
                      alt="Preview" 
                      style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #1E5F3F' }} 
                    />
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{ fontSize: '0.82rem', color: 'var(--text-medium)' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Or Profile Picture URL</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="https://example.com/pic.jpg"
                  value={profileForm.profilePicture || ''} 
                  onChange={(e) => setProfileForm({ ...profileForm, profilePicture: e.target.value })}
                />
              </div>
              <button 
                type="submit" 
                style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Save Details
              </button>
            </form>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
            {/* Active Rescues */}
            <div>
              <div className="card" style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckSquare size={18} color="#1E5F3F" /> My Active Rescues
                </h3>

                {myRescues.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', padding: '10px 0', fontSize: '0.9rem' }}>No active cases. Check the available cases list to start a rescue.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {myRescues.map(rescue => (
                      <div key={rescue._id} className="rescue-card" style={{
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '16px',
                        backgroundColor: 'var(--white)',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <img 
                            src={rescue.imageUrl} 
                            alt={rescue.animalType} 
                            style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000';
                            }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>{rescue.animalType} ({rescue.condition})</h4>
                              <span className={`priority-badge ${rescue.priority}`}>
                                <span className="dot" />
                                {rescue.priority}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>📍 {rescue.location}</p>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-medium)', marginTop: '8px' }}>
                              Reported by: <strong>{rescue.reporterName}</strong> ({rescue.reporterPhone || 'No contact phone'})
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', justifyContext: 'flex-end', marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px', gap: '10px' }}>
                          <button 
                            onClick={() => handleCompleteCase(rescue._id)}
                            style={{
                              backgroundColor: '#1E5F3F',
                              color: '#ffffff',
                              padding: '8px 16px',
                              borderRadius: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Mark Rescue Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Available Cases in region */}
              <div className="card">
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Compass size={18} color="#1E5F3F" /> Available Cases in Region
                </h3>

                {availableCases.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', padding: '10px 0', fontSize: '0.9rem' }}>Great job! No reports are currently pending rescue.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {availableCases.map(caseItem => (
                      <div key={caseItem._id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--white)',
                        textAlign: 'left'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <img 
                            src={caseItem.imageUrl} 
                            alt={caseItem.animalType} 
                            style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000';
                            }}
                          />
                          <div>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>{caseItem.animalType} ({caseItem.condition})</h4>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '2px' }}>📍 {caseItem.location}</p>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>Reported: {formatDate(caseItem.reportedAt)}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                          <span className={`priority-badge ${caseItem.priority}`}>
                            <span className="dot" />
                            {caseItem.priority}
                          </span>
                          <button 
                            onClick={() => handleClaimCase(caseItem._id)}
                            style={{
                              backgroundColor: 'transparent',
                              border: '1px solid #1E5F3F',
                              color: '#1E5F3F',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            Accept Case
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Volunteer Leaderboard / Stats */}
            <div className="card" style={{ padding: '24px', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Trophy size={18} color="#eab308" /> Local ResQ Heroes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { name: 'Rahul Singh (You)', count: stats.profileCompletedCount, rating: stats.rating, isMe: true },
                  { name: 'Amit Sharma', count: 12, rating: 4.9, isMe: false },
                  { name: 'Priya Patel', count: 8, rating: 4.7, isMe: false }
                ].map((hero, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: hero.isMe ? '1px solid #1E5F3F' : '1px solid var(--border-color)',
                    backgroundColor: hero.isMe ? 'rgba(30, 95, 63, 0.05)' : 'var(--white)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: idx === 0 ? '#eab308' : (idx === 1 ? '#94a3b8' : '#b45309') }}>#{idx + 1}</span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-dark)' }}>{hero.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{hero.count} Rescues Completed</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308', fontWeight: 700, fontSize: '0.85rem' }}>
                      <Star size={14} fill="#eab308" /> {hero.rating}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--light-gray)' }}>
      {/* Mobile Drawer Overlay Backdrop */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999
          }}
        />
      )}

      {/* Sidebar - Dark theme */}
      <aside className={mobileSidebarOpen ? 'mobile-drawer-open' : ''} style={{
        width: '240px',
        backgroundColor: '#0F172A',
        color: '#ffffff',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 1000
      }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', cursor: 'pointer' }} onClick={() => { setActiveSection('dashboard'); setMobileSidebarOpen(false); }}>
          <div style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '6px', borderRadius: '8px', display: 'flex' }}>🐾</div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>ResQ Paws</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'map', name: 'Rescue Map', icon: <Map size={18} /> },
            { id: 'stories', name: 'Success Stories', icon: <Award size={18} /> },
            { id: 'profile', name: 'My Profile', icon: <User size={18} /> },
          ].map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileSidebarOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? '#1E5F3F' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  textAlign: 'left',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              </button>
            );
          })}
        </nav>

        <button 
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '8px',
            color: '#f87171',
            fontWeight: 600,
            textAlign: 'left'
          }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', marginLeft: '240px' }}>
        {/* Top Header */}
        <header style={{
          height: '70px',
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '16px'
        }}>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="mobile-menu-btn"
            style={{
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1E5F3F',
              color: '#ffffff',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            {mobileSidebarOpen ? <X size={18} /> : <Menu size={18} />}
            <span>Menu</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Theme Toggler */}
            <button 
              onClick={onToggleTheme} 
              style={{ 
                color: 'var(--text-medium)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--light-gray)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? <Sun size={18} color="#eab308" /> : <Moon size={18} />}
            </button>

          <button style={{ color: 'var(--text-medium)', position: 'relative' }}>
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
          </button>
          
          <div 
            onClick={() => setActiveSection('profile')} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div className="header-user-text" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{profileForm.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>Volunteer</div>
            </div>
            {user.profilePicture ? (
              <img 
                src={user.profilePicture} 
                alt="Profile" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1E5F3F',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem'
              }}>
                {profileForm.name ? profileForm.name.split(' ').map(n=>n[0]).join('') : 'V'}
              </div>
            )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div style={{ padding: '30px', textAlign: 'left', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Volunteer Rescue Station</h1>
              <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Accept and manage reports of injured stray animals in your city.</p>
            </div>
            
            {/* Quick Status Badges */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--white)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <Star size={16} fill="#eab308" color="#eab308" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{stats.rating} Rating</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--white)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <Trophy size={16} color="#1E5F3F" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-dark)' }}>{stats.profileCompletedCount} Rescues Done</span>
              </div>
            </div>
          </div>

          {/* Stats Summary cards */}
          {activeSection === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {[
                { label: 'Available Cases', count: stats.availableCount, border: '#1E5F3F', color: '#1E5F3F', icon: '🔍' },
                { label: 'My Active Cases', count: stats.acceptedCount, border: '#3b82f6', color: '#3b82f6', icon: '🚒' },
                { label: 'Cases Completed', count: stats.completedCount, border: '#22c55e', color: '#22c55e', icon: '✅' }
              ].map((stat, idx) => (
                <div key={idx} className="card" style={{
                  padding: '20px',
                  borderLeft: `4px solid ${stat.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'var(--transition)'
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>{stat.label}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, marginTop: '4px' }}>{stat.count}</div>
                  </div>
                  <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Content */}
          {renderSectionContent()}
        </div>
      </main>
    </div>
  );
}
