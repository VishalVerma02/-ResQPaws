import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Shield, ShieldAlert, Award, LogOut, Bell, Compass, CheckSquare, Users, Sun, Moon, User, Map, Menu, X } from 'lucide-react';
import RescueMap from './RescueMap';
import SuccessStories from './SuccessStories';

export default function DashboardNGO({ user, onLogout, isDarkMode, onToggleTheme, onUpdateUser, onNavigate }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    availableCount: 0,
    activeCount: 0,
    completedCount: 0,
    volunteersCount: 0
  });
  const [reports, setReports] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'accepted', 'completed', 'profile'
  const [profileForm, setProfileForm] = useState({ name: user.name || '', email: user.email || '', profilePicture: user.profilePicture || '' });
  const [profileSuccess, setProfileSuccess] = useState(false);

  const fetchNGOData = async () => {
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

      // Fetch all reports for map
      const allRes = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (allRes.ok) {
        const allData = await allRes.json();
        setAllReports(allData);
      }

      // Fetch reports based on tab
      let filterParam = 'available';
      if (activeTab === 'accepted') filterParam = 'accepted';
      if (activeTab === 'completed') filterParam = 'completed';

      const reportsRes = await fetch(`/api/reports?ngoFilter=${filterParam}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }
    } catch (err) {
      console.error('Error fetching NGO dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'profile') {
      fetchNGOData();
    }
  }, [activeTab]);

  const handleClaimCase = async (reportId) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/claim`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchNGOData();
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
        fetchNGOData();
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

  const renderTabContent = () => {
    if (activeTab === 'map') {
      return <RescueMap reports={allReports} isDarkMode={isDarkMode} />;
    }

    if (activeTab === 'stories') {
      return <SuccessStories isDarkMode={isDarkMode} currentUser={user} />;
    }

    if (activeTab === 'profile') {
      return (
        <div className="card" style={{ maxWidth: '500px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>NGO Profile Settings</h2>
          {profileSuccess && (
            <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
              NGO Profile saved successfully!
            </div>
          )}
          <form onSubmit={handleProfileSubmit} style={{ textAlign: 'left' }}>
            <div className="form-group">
              <label className="form-label">NGO Representative Name</label>
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
    }

    if (loading) {
      return <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '30px' }}>Loading cases...</p>;
    }

    if (reports.length === 0) {
      return (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-light)' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--text-light)' }} />
          <p>No cases found in this section.</p>
        </div>
      );
    }

    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {reports.map((report) => (
          <div key={report._id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden' }}>
              <img 
                src={report.imageUrl} 
                alt={report.animalType} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000';
                }}
              />
              <span className={`priority-badge ${report.priority}`} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <span className="dot" />
                {report.priority}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>{report.animalType} ({report.condition})</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '4px' }}>📍 {report.location}</p>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-medium)', marginTop: '10px' }}>
                Reported by: <strong>{report.reporterName}</strong> ({report.reporterPhone || 'No contact phone'})
              </p>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', display: 'block', marginTop: '6px' }}>
                Date: {formatDate(report.reportedAt)}
              </span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', display: 'flex', gap: '10px' }}>
              {activeTab === 'available' && (
                <button 
                  onClick={() => handleClaimCase(report._id)}
                  style={{
                    backgroundColor: '#1E5F3F',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Claim for NGO
                </button>
              )}
              {activeTab === 'accepted' && (
                <button 
                  onClick={() => handleCompleteCase(report._id)}
                  style={{
                    backgroundColor: '#166534',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  Mark Rescue Done
                </button>
              )}
              {activeTab === 'completed' && (
                <span className="status-badge completed" style={{ width: '100%', textAlign: 'center', padding: '8px 0' }}>
                  ✓ Rescue Mission Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
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

      {/* Sidebar */}
      <aside className={mobileSidebarOpen ? 'mobile-drawer-open' : ''} style={{
        width: '240px',
        backgroundColor: 'var(--white)',
        borderRight: '1px solid var(--border-color)',
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
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', cursor: 'pointer' }} onClick={() => { setActiveTab('available'); setMobileSidebarOpen(false); }}>
          <div style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '6px', borderRadius: '8px', display: 'flex' }}>🐾</div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1E5F3F', fontFamily: 'var(--font-heading)' }}>ResQ Paws</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {[
            { id: 'available', name: 'Available Cases', icon: <Compass size={18} /> },
            { id: 'map', name: 'Rescue Map', icon: <Map size={18} /> },
            { id: 'stories', name: 'Success Stories', icon: <Award size={18} /> },
            { id: 'accepted', name: 'NGO Active Cases', icon: <LayoutDashboard size={18} /> },
            { id: 'completed', name: 'NGO Completed Cases', icon: <CheckSquare size={18} /> },
            { id: 'profile', name: 'NGO Profile', icon: <User size={18} /> },
          ].map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: isActive ? '#1E5F3F' : 'var(--text-medium)',
                  backgroundColor: isActive ? '#EBF5F0' : 'transparent',
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
            color: '#ef4444',
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

          <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

            <div 
              onClick={() => setActiveTab('profile')} 
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
            >
              <div className="header-user-text" style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{profileForm.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>NGO Partner</div>
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
                NP
              </div>
            )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div style={{ padding: '30px', textAlign: 'left', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '4px', color: 'var(--text-dark)' }}>NGO Portal</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Welcome, {profileForm.name} 🏢</p>
          </div>

          {/* Stats Grid */}
          {activeTab !== 'profile' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {[
                { label: 'Cases In Region', count: stats.availableCount, border: '#cbd5e1', color: 'var(--text-dark)', icon: <Compass />, id: 'available' },
                { label: 'NGO Active Rescues', count: stats.activeCount, border: '#2563eb', color: '#2563eb', icon: <LayoutDashboard />, id: 'accepted' },
                { label: 'NGO Completed Rescues', count: stats.completedCount, border: '#166534', color: '#166534', icon: <Award />, id: 'completed' },
                { label: 'Associated Volunteers', count: stats.volunteersCount, border: '#eab308', color: '#eab308', icon: <Users />, id: 'available' }
              ].map((stat, idx) => (
                <div key={idx} onClick={() => setActiveTab(stat.id)} className="card" style={{
                  padding: '20px',
                  borderLeft: `4px solid ${stat.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 500 }}>{stat.label}</div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: stat.color, marginTop: '4px' }}>{stat.count}</div>
                  </div>
                  <span style={{ fontSize: '1.5rem', color: 'var(--text-medium)' }}>{stat.icon}</span>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Content */}
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
