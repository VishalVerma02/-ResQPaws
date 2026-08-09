import React, { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, Bell, MessageSquare, User, Settings, LogOut, PlusCircle, ArrowRight, ShieldAlert, Sun, Moon, Map, Award, Menu, X } from 'lucide-react';
import ReportForm from './ReportForm';
import RescueMap from './RescueMap';
import SuccessStories from './SuccessStories';

export default function DashboardUser({ user, onNavigate, onLogout, isDarkMode, onToggleTheme, onUpdateUser }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    myReportsCount: 0,
    inProgressCount: 0,
    completedCount: 0,
    cancelledCount: 0
  });

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'report', 'my-reports', 'notifications', 'messages', 'profile'
  const [profileForm, setProfileForm] = useState({ name: user.name || '', email: user.email || '', profilePicture: user.profilePicture || '' });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [chatSelectedAgent, setChatSelectedAgent] = useState('Rahul Singh (Volunteer)');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'agent', text: 'Hello! I am volunteer Rahul. I am heading to Sector 62 for the injured puppy case.' },
    { sender: 'user', text: 'Thank you! The puppy is near the block B grocery store under the tree.' },
    { sender: 'agent', text: 'Understood. I will arrive in 15 minutes and share updates.' }
  ]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);

        // Calculate statistics
        const myCases = data.filter(r => r.reporterId === user.id);
        const inProgress = myCases.filter(r => r.status === 'accepted');
        const completed = myCases.filter(r => r.status === 'completed');
        const cancelled = myCases.filter(r => r.status === 'cancelled');

        setStats({
          myReportsCount: myCases.length,
          inProgressCount: inProgress.length,
          completedCount: completed.length,
          cancelledCount: cancelled.length
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user.id]);

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

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: 'user', text: chatInput }]);
    setChatInput('');
    
    // Simulate auto-reply from volunteer/NGO after 1 second
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        sender: 'agent',
        text: `Got your message! We are actively checking the status. Thanks for reporting!`
      }]);
    }, 1000);
  };

  const formatDate = (dateStr) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const getNotifications = () => {
    const list = [];
    
    reports.forEach(r => {
      if (r.status === 'accepted') {
        list.push({
          id: `status-accepted-${r._id}`,
          title: '🐶 Rescue In Progress',
          text: `Your report for a ${r.animalType} has been accepted by ${r.volunteerName || r.ngoName || 'a responder'}.`,
          time: r.reportedAt,
          section: 'my-reports'
        });
      } else if (r.status === 'completed') {
        list.push({
          id: `status-completed-${r._id}`,
          title: '🎉 Rescue Completed',
          text: `Great news! The ${r.animalType} rescue mission is completed.`,
          time: r.reportedAt,
          section: 'my-reports'
        });
      }
    });

    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg.sender === 'agent') {
        list.push({
          id: 'chat-notification',
          title: '💬 New Message',
          text: `${chatSelectedAgent}: "${lastMsg.text}"`,
          time: new Date(),
          section: 'messages'
        });
      }
    }

    return list;
  };

  const notifications = getNotifications();

  const renderSectionContent = () => {
    if (loading && activeSection !== 'profile' && activeSection !== 'messages' && activeSection !== 'report') {
      return <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>Loading cases...</p>;
    }

    switch (activeSection) {
      case 'report':
        return (
          <div style={{ width: '100%', maxWidth: '1200px' }}>
            <ReportForm 
              onSuccess={() => {
                setActiveSection('my-reports');
                fetchUserData();
              }}
            />
          </div>
        );

      case 'my-reports':
        const userCases = reports.filter(r => r.reporterId === user.id);
        return (
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>My Reported Incident Cases</h2>
            {userCases.length === 0 ? (
              <p style={{ color: 'var(--text-light)', padding: '20px', textAlign: 'center' }}>No cases reported by you yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                      <th style={{ padding: '12px' }}>Incident Detail</th>
                      <th style={{ padding: '12px' }}>Location</th>
                      <th style={{ padding: '12px' }}>Date</th>
                      <th style={{ padding: '12px' }}>Priority</th>
                      <th style={{ padding: '12px' }}>Assigned Agent</th>
                      <th style={{ padding: '12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userCases.map(caseItem => (
                      <tr key={caseItem._id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                        <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img src={caseItem.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontWeight: 600 }}>{caseItem.animalType}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{caseItem.condition}</div>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>{caseItem.location}</td>
                        <td style={{ padding: '12px' }}>{formatDate(caseItem.reportedAt)}</td>
                        <td style={{ padding: '12px' }}>
                          <span className={`priority-badge ${caseItem.priority}`}>
                            <span className="dot" />
                            {caseItem.priority}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 500 }}>
                          {caseItem.volunteerId ? `Vol: ${caseItem.volunteerName}` : (caseItem.ngoId ? `NGO: ${caseItem.ngoName}` : 'Unassigned')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`status-badge ${caseItem.status}`}>{caseItem.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'notifications':
        return (
          <div className="card" style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Notifications Board</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { title: 'Case Accepted', desc: 'Volunteer Rahul Singh accepted your report "Stray Dog Injured".', date: 'Just now', read: false },
                { title: 'NGO Associated', desc: 'Happy Paws NGO has assigned a medical van for sector 71.', date: '2 hours ago', read: true },
                { title: 'Welcome to ResQ Paws', desc: 'Thank you for registering. You can report injured animals from your dashboard.', date: '1 day ago', read: true }
              ].map((n, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  backgroundColor: n.read ? 'var(--white)' : 'rgba(30, 95, 63, 0.05)',
                  textAlign: 'left',
                  position: 'relative'
                }}>
                  {!n.read && <span style={{ position: 'absolute', top: '16px', right: '16px', width: '8px', height: '8px', backgroundColor: '#1E5F3F', borderRadius: '50%' }} />}
                  <h4 style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{n.title}</h4>
                  <p style={{ color: 'var(--text-medium)', fontSize: '0.85rem', marginTop: '4px' }}>{n.desc}</p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '8px', display: 'block' }}>{n.date}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'messages':
        return (
          <div className="card" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', height: '500px', padding: 0, overflow: 'hidden' }}>
            {/* Agent Sidebar selection */}
            <div style={{ borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--light-gray)' }}>
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.9rem' }}>Active Chat Agents</div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {[
                  { name: 'Rahul Singh (Volunteer)', desc: 'Active on your Sector 62 case', online: true },
                  { name: 'Happy Paws NGO', desc: 'Medical vehicle dispatcher', online: true },
                  { name: 'ResQ Paws Support', desc: 'Help desk & General query', online: false }
                ].map(agent => (
                  <div 
                    key={agent.name} 
                    onClick={() => setChatSelectedAgent(agent.name)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      backgroundColor: chatSelectedAgent === agent.name ? 'var(--white)' : 'transparent',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifySpace: 'between', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: agent.online ? '#22c55e' : '#cbd5e1' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-dark)' }}>{agent.name}</div>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>{agent.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Box */}
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              {/* Chat Header */}
              <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', fontWeight: 700, color: 'var(--text-dark)', textAlign: 'left' }}>
                💬 Chat with {chatSelectedAgent}
              </div>

              {/* Chat Message Lists */}
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chatMessages.map((msg, i) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={i} style={{
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      backgroundColor: isUser ? '#1E5F3F' : 'var(--light-gray)',
                      color: isUser ? '#ffffff' : 'var(--text-dark)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      maxWidth: '70%',
                      textAlign: 'left',
                      fontSize: '0.85rem'
                    }}>
                      {msg.text}
                    </div>
                  );
                })}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Type your message here..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, borderRadius: '8px' }}
                />
                <button 
                  type="submit" 
                  style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem' }}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        );

      case 'map':
        return (
          <RescueMap reports={reports} isDarkMode={isDarkMode} />
        );

      case 'stories':
        return (
          <SuccessStories isDarkMode={isDarkMode} currentUser={user} />
        );

      case 'profile':
        return (
          <div className="card" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>User Profile Details</h2>
            {profileSuccess && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                Profile details saved successfully!
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
                Update Profile
              </button>
            </form>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <>
            {/* Stats Dashboard Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
              {[
                { label: 'My Total Reports', count: stats.myReportsCount, border: '#1E5F3F', color: '#1E5F3F', icon: '📝', id: 'my-reports' },
                { label: 'Active Rescues', count: stats.inProgressCount, border: '#3b82f6', color: '#3b82f6', icon: '🚑', id: 'my-reports' },
                { label: 'Cases Completed', count: stats.completedCount, border: '#22c55e', color: '#22c55e', icon: '✅', id: 'my-reports' },
                { label: 'Cancelled Reports', count: stats.cancelledCount, border: '#ef4444', color: '#ef4444', icon: '❌', id: 'my-reports' }
              ].map((stat, idx) => (
                <div key={idx} onClick={() => setActiveSection(stat.id)} className="card" style={{
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
                  <span style={{ fontSize: '1.5rem' }}>{stat.icon}</span>
                </div>
              ))}
            </div>

            {/* Quick Actions & Recent Incidents list */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', alignItems: 'start' }}>
              {/* Quick Actions */}
              <div className="card" style={{ padding: '24px', textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-dark)' }}>Quick Rescue Actions</h3>
                <button 
                  onClick={() => setActiveSection('report')}
                  style={{
                    width: '100%',
                    backgroundColor: '#1E5F3F',
                    color: '#ffffff',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                  }}
                >
                  <PlusCircle size={18} />
                  <span>Report Animal Case</span>
                </button>
                <button 
                  onClick={() => setActiveSection('messages')}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--light-gray)',
                    color: 'var(--text-dark)',
                    border: '1px solid var(--border-color)',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <MessageSquare size={18} />
                  <span>Chat with Volunteers</span>
                </button>
              </div>

              {/* Incidents listing */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Recent Public Incidents</h3>
                  <span onClick={() => setActiveSection('my-reports')} style={{ fontSize: '0.85rem', color: '#1E5F3F', fontWeight: 600, cursor: 'pointer' }}>View Mine</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {reports.slice(0, 4).map(report => (
                    <div key={report._id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      backgroundColor: 'var(--white)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                        <img 
                          src={report.imageUrl} 
                          alt={report.animalType} 
                          style={{ width: '45px', height: '45px', borderRadius: '6px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000';
                          }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-dark)' }}>{report.animalType} ({report.condition})</h4>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>📍 {report.location}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>{formatDate(report.reportedAt)}</span>
                        <span className={`status-badge ${report.status}`}>{report.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
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

      {/* Sidebar - Dark Theme */}
      <aside className={mobileSidebarOpen ? 'mobile-drawer-open' : ''} style={{
        width: '240px',
        backgroundColor: '#1E5F3F',
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
          <div style={{ backgroundColor: '#ffffff', color: '#1E5F3F', padding: '6px', borderRadius: '8px', display: 'flex' }}>🐾</div>
          <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-heading)' }}>ResQ Paws</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {[
            { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard size={18} /> },
            { id: 'map', name: 'Rescue Map', icon: <Map size={18} /> },
            { id: 'stories', name: 'Success Stories', icon: <Award size={18} /> },
            { id: 'my-reports', name: 'My Reports', icon: <FileText size={18} /> },
            { id: 'notifications', name: 'Notifications', icon: <Bell size={18} /> },
            { id: 'messages', name: 'Messages', icon: <MessageSquare size={18} /> },
            { id: 'profile', name: 'My Profile', icon: <User size={18} /> },
          ].map(item => {
            const isActive = activeSection === item.id || (item.id === 'my-reports' && activeSection === 'report');
            return (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); setMobileSidebarOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  color: isActive ? '#1E5F3F' : '#e2e8f0',
                  backgroundColor: isActive ? '#ffffff' : 'transparent',
                  fontWeight: isActive ? 700 : 500,
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
            color: '#fca5a5',
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

          <div className="header-controls">
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

          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              style={{ color: 'var(--text-medium)', position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '50%', backgroundColor: 'var(--light-gray)', border: '1px solid var(--border-color)' }}
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span style={{ position: 'absolute', top: '2px', right: '2px', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%' }} />
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                width: '320px',
                backgroundColor: 'var(--white)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                zIndex: 110,
                padding: '16px 0',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                <div style={{ padding: '0 16px 12px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>Rescue Updates</span>
                  <span style={{ fontSize: '0.8rem', backgroundColor: '#EBF5F0', color: '#1E5F3F', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {notifications.length} Alerts
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div 
                        key={n.id}
                        onClick={() => {
                          setActiveSection(n.section);
                          setShowNotifications(false);
                        }}
                        style={{
                          padding: '12px 16px',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--light-gray)'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-medium)', marginTop: '4px', lineHeight: '1.3' }}>
                          {n.text}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '6px' }}>
                          {new Date(n.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(n.time).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '30px 16px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
                      🎉 No updates or alerts right now.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div 
            onClick={() => setActiveSection('profile')} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div className="header-user-text" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{profileForm.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>Reporter</div>
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
                {profileForm.name ? profileForm.name.split(' ').map(n=>n[0]).join('') : 'U'}
              </div>
            )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div style={{ padding: '30px', textAlign: 'left', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Reporter Dashboard</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Thank you for helping animals. Monitor and report animal incidents.</p>
          </div>

          {/* Dynamic Content */}
          {renderSectionContent()}
        </div>
      </main>
    </div>
  );
}
