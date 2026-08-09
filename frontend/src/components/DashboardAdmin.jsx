import React, { useEffect, useState } from 'react';
import { LayoutDashboard, Users, UserCheck, Heart, Map, LineChart, Settings, LogOut, Bell, FileText, Trash2, ShieldAlert, Sun, Moon, Award, BarChart, Menu, X } from 'lucide-react';
import RescueMap from './RescueMap';
import SuccessStories from './SuccessStories';

export default function DashboardAdmin({ user, onLogout, isDarkMode, onToggleTheme, onUpdateUser, onNavigate }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    volunteers: 0,
    ngos: 0,
    cities: 0,
    reportsOverview: [],
    animalTypesData: []
  });
  
  const [reports, setReports] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard'); // 'dashboard', 'users', 'volunteers', 'ngos', 'reports', 'analytics', 'settings'
  const [settingsForm, setSettingsForm] = useState({ name: user.name || '', email: user.email || '', profilePicture: user.profilePicture || '' });
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [showCitiesModal, setShowCitiesModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalRole, setAddModalRole] = useState('volunteer');
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', registrationId: '', contactPhone: '' });
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchAdminData = async () => {
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
        setReports(reportsData);
      }

      // Fetch all users
      const usersRes = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setAllUsers(usersData);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Could not delete user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this rescue case?')) return;
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Could not delete case.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Could not approve user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyReport = async (reportId, status) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAdminData();
      } else {
        alert('Could not verify report.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        localStorage.setItem('user', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    try {
      const bodyPayload = {
        name: addForm.name,
        email: addForm.email,
        password: addForm.password,
        role: addModalRole,
        ngoDetails: addModalRole === 'ngo' ? {
          registrationId: addForm.registrationId || 'N/A',
          contactPhone: addForm.contactPhone || 'N/A'
        } : undefined
      };
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(bodyPayload)
      });
      if (res.ok) {
        setShowAddModal(false);
        setAddForm({ name: '', email: '', password: '', registrationId: '', contactPhone: '' });
        fetchAdminData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Could not add user.');
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
        setSettingsForm(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (dateStr) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const getNotifications = () => {
    const list = [];
    reports.forEach(r => {
      if (!r.verificationStatus || r.verificationStatus === 'pending') {
        list.push({
          id: `report-${r._id}`,
          type: 'report',
          title: '🚨 New Incident Case',
          text: `A ${r.animalType} (${r.condition}) reported at ${r.location}.`,
          time: r.reportedAt,
          section: 'reports'
        });
      }
    });
    allUsers.forEach(u => {
      if (!u.isApproved && (u.role === 'volunteer' || u.role === 'ngo')) {
        const roleLabel = u.role === 'volunteer' ? 'Volunteer' : 'NGO Partner';
        list.push({
          id: `approve-${u._id}`,
          type: 'approval',
          title: `👤 Pending ${roleLabel}`,
          text: `${u.name} is waiting for approval to join.`,
          time: u.createdAt,
          section: u.role === 'volunteer' ? 'volunteers' : 'ngos'
        });
      }
    });
    return list.sort((a, b) => new Date(b.time) - new Date(a.time));
  };

  const notifications = getNotifications();

  // SVG Line Chart
  const renderLineChart = (width = 500, height = 180) => {
    const data = stats.reportsOverview || [];
    if (data.length === 0) return null;

    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...data.map(d => d.reports)) * 1.1 || 100;
    const points = data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - (d.reports / maxVal) * chartHeight;
      return { x, y, label: d.month, val: d.reports };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const p0 = points[i - 1];
      const p = points[i];
      const cpX1 = p0.x + (p.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p.x - p0.x) / 2;
      const cpY2 = p.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p.x} ${p.y}`;
    }

    const areaD = `${pathD} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E5F3F" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1E5F3F" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = paddingTop + chartHeight * ratio;
          return (
            <g key={i}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="var(--border-color)" strokeWidth="1" />
              <text x={paddingLeft - 8} y={y + 4} fill="var(--text-light)" fontSize="10" textAnchor="end">
                {Math.round(maxVal * (1 - ratio))}
              </text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#chartGradient)" />
        <path d={pathD} fill="none" stroke="#1E5F3F" strokeWidth="3" strokeLinecap="round" />

        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="5" fill="var(--white)" stroke="#1E5F3F" strokeWidth="2.5" />
            <text x={p.x} y={p.y - 10} fill="var(--text-dark)" fontSize="9" fontWeight="600" textAnchor="middle">
              {p.val}
            </text>
            <text x={p.x} y={height - 8} fill="var(--text-light)" fontSize="10" fontWeight="500" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // SVG Donut Chart
  const renderDonutChart = () => {
    const data = stats.animalTypesData || [];
    if (data.length === 0) return null;

    const colors = ['#1E5F3F', '#a855f7', '#3b82f6', '#f59e0b', '#64748b'];
    let accumulatedPercent = 0;

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <svg viewBox="0 0 150 150" style={{ width: '130px', height: '130px' }}>
          <circle cx="75" cy="75" r="50" fill="none" stroke="var(--light-gray)" strokeWidth="20" />
          {data.map((item, idx) => {
            const color = colors[idx % colors.length];
            const percent = item.value;
            const circumference = 314.159;
            const strokeDashArray = `${(percent / 100) * circumference} ${circumference}`;
            const strokeDashOffset = -((accumulatedPercent / 100) * circumference) + (circumference / 4);
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx="75"
                cy="75"
                r="50"
                fill="none"
                stroke={color}
                strokeWidth="20"
                strokeDasharray={strokeDashArray}
                strokeDashoffset={strokeDashOffset}
              />
            );
          })}
          <circle cx="75" cy="75" r="40" fill="var(--white)" />
          <text x="75" y="72" textAnchor="middle" fill="var(--text-dark)" fontSize="18" fontWeight="800">
            {reports.length}
          </text>
          <text x="75" y="87" textAnchor="middle" fill="var(--text-light)" fontSize="8" fontWeight="600" letterSpacing="0.5">
            TOTAL CASES
          </text>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minWidth: '120px', textAlign: 'left' }}>
          {data.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: colors[idx % colors.length] }} />
                <span style={{ color: 'var(--text-medium)', fontWeight: 500 }}>{item.name}</span>
              </div>
              <span style={{ color: 'var(--text-dark)', fontWeight: 700 }}>{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Table / Lists based on Active Section
  const renderSectionContent = () => {
    if (loading) return <p style={{ textAlign: 'center', color: 'var(--text-light)', padding: '40px' }}>Loading statistics...</p>;

    switch (activeSection) {
      case 'users':
        const reporters = allUsers.filter(u => u.role === 'reporter');
        return (
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Registered Users (Reporters)</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Registered Date</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reporters.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>{formatDate(u.createdAt)}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteUser(u._id)}
                          style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'volunteers':
        const volunteers = allUsers.filter(u => u.role === 'volunteer');
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>Rescue Volunteers</h2>
              <button 
                onClick={() => {
                  setAddModalRole('volunteer');
                  setShowAddModal(true);
                }}
                style={{ backgroundColor: '#1E5F3F', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add Volunteer
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Rating</th>
                    <th style={{ padding: '12px' }}>Completed Rescues</th>
                    <th style={{ padding: '12px' }}>Approval Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px', color: '#eab308', fontWeight: 700 }}>
                        ★ {u.volunteerDetails?.rating || '4.8'}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{u.volunteerDetails?.completedCount || 0}</td>
                      <td style={{ padding: '12px' }}>
                        {u.isApproved ? (
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>Approved</span>
                        ) : (
                          <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {!u.isApproved && (
                            <button 
                              onClick={() => handleApproveUser(u._id)}
                              style={{ backgroundColor: '#1E5F3F', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'ngos':
        const ngos = allUsers.filter(u => u.role === 'ngo');
        return (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-dark)', margin: 0 }}>NGO Partners</h2>
              <button 
                onClick={() => {
                  setAddModalRole('ngo');
                  setShowAddModal(true);
                }}
                style={{ backgroundColor: '#1E5F3F', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer' }}
              >
                + Add NGO Partner
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Reg ID</th>
                    <th style={{ padding: '12px' }}>Phone</th>
                    <th style={{ padding: '12px' }}>Approval Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '12px' }}>{u.email}</td>
                      <td style={{ padding: '12px' }}>{u.ngoDetails?.registrationId || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>{u.ngoDetails?.contactPhone || 'N/A'}</td>
                      <td style={{ padding: '12px' }}>
                        {u.isApproved ? (
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>Approved</span>
                        ) : (
                          <span style={{ backgroundColor: '#fef3c7', color: '#d97706', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                          {!u.isApproved && (
                            <button 
                              onClick={() => handleApproveUser(u._id)}
                              style={{ backgroundColor: '#1E5F3F', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Approve
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(u._id)}
                            style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'reports':
        return (
          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Incident Cases Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-light)' }}>
                    <th style={{ padding: '12px' }}>Animal / Condition</th>
                    <th style={{ padding: '12px' }}>Location</th>
                    <th style={{ padding: '12px' }}>Reporter</th>
                    <th style={{ padding: '12px' }}>Priority</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px' }}>Verification</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr key={report._id} style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-dark)' }}>
                      <td style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={report.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 600 }}>{report.animalType}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{report.condition}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>{report.location}</td>
                      <td style={{ padding: '12px' }}>{report.reporterName}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`priority-badge ${report.priority}`}>
                          <span className="dot" />
                          {report.priority}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span className={`status-badge ${report.status}`}>{report.status}</span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {report.verificationStatus === 'verified' && (
                          <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>✓ Verified</span>
                        )}
                        {report.verificationStatus === 'fake' && (
                          <span style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 600 }}>✗ Fake Report</span>
                        )}
                        {(!report.verificationStatus || report.verificationStatus === 'pending') && (
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleVerifyReport(report._id, 'verified')}
                              style={{ backgroundColor: '#166534', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Verify
                            </button>
                            <button 
                              onClick={() => handleVerifyReport(report._id, 'fake')}
                              style={{ backgroundColor: '#b91c1c', color: '#ffffff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                            >
                              Fake
                            </button>
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleDeleteReport(report._id)}
                          style={{ color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600, border: 'none', backgroundColor: 'transparent', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

      case 'monthly-reports': {
        const now = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        const monthlyReports = reports.filter(r => new Date(r.createdAt || Date.now()) >= thirtyDaysAgo);
        const totalCount = monthlyReports.length;

        const verifiedCount = monthlyReports.filter(r => r.verificationStatus === 'verified').length;
        const fakeCount = monthlyReports.filter(r => r.verificationStatus === 'fake').length;
        const pendingCount = monthlyReports.filter(r => !r.verificationStatus || r.verificationStatus === 'pending').length;

        const rescuedCount = monthlyReports.filter(r => r.status === 'completed' || r.status === 'rescued').length;
        const successRate = verifiedCount > 0 ? Math.round((rescuedCount / verifiedCount) * 100) : 100;

        const speciesList = ['Dog', 'Cat', 'Cow', 'Bird', 'Monkey', 'Horse'];
        const speciesCounts = speciesList.map(spec => {
          const count = monthlyReports.filter(r => r.animalType === spec).length;
          const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
          return { species: spec, count, percentage };
        });

        const citiesList = ['Delhi', 'Noida', 'Jaipur', 'Lucknow'];
        const cityCounts = citiesList.map(city => {
          const count = monthlyReports.filter(r => (r.location || '').toLowerCase().includes(city.toLowerCase())).length;
          return { city, count };
        });

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div style={{ textAlign: 'left' }}>
              <h2 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', fontWeight: 700 }}>Monthly Reports & Rescue Insights</h2>
              <p style={{ color: 'var(--text-medium)', fontSize: '0.88rem', marginTop: '4px' }}>Real-time statistics for all reports filed in the past 30 days.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="card" style={{ padding: '20px', borderLeft: '4px solid #3b82f6', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Monthly Reports</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', margin: '8px 0 4px' }}>{totalCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>Incoming cases this month</div>
              </div>

              <div className="card" style={{ padding: '20px', borderLeft: '4px solid #22c55e', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Verified Cases</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#22c55e', margin: '8px 0 4px' }}>{verifiedCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>{pendingCount} cases pending verification</div>
              </div>

              <div className="card" style={{ padding: '20px', borderLeft: '4px solid #ef4444', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Fake Reports</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', margin: '8px 0 4px' }}>{fakeCount}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>Identified & filtered out</div>
              </div>

              <div className="card" style={{ padding: '20px', borderLeft: '4px solid #eab308', textAlign: 'left' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-light)', textTransform: 'uppercase' }}>Rescue Success Rate</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#eab308', margin: '8px 0 4px' }}>{successRate}%</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-medium)' }}>{rescuedCount} rescued out of {verifiedCount} verified</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px' }}>
              <div className="card" style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 600, marginBottom: '20px' }}>Species Distribution (Monthly)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {speciesCounts.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 500 }}>
                        <span style={{ color: 'var(--text-dark)' }}>{s.species} ({s.count} cases)</span>
                        <span style={{ color: 'var(--text-medium)' }}>{s.percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${s.percentage}%`,
                          height: '100%',
                          backgroundColor: '#1E5F3F',
                          borderRadius: '6px',
                          transition: 'width 0.5s ease-out'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="card" style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 600, marginBottom: '20px' }}>Verification Ratio</h3>
                  <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '100px', height: '100px', flexShrink: 0 }}>
                      <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#22c55e"
                          strokeWidth="12"
                          strokeDasharray={`${(verifiedCount / (totalCount || 1)) * 251.2} 251.2`}
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          stroke="#ef4444"
                          strokeWidth="12"
                          strokeDasharray={`${(fakeCount / (totalCount || 1)) * 251.2} 251.2`}
                          strokeDashoffset={-((verifiedCount / (totalCount || 1)) * 251.2)}
                        />
                      </svg>
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                        color: 'var(--text-dark)'
                      }}>
                        {totalCount}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
                          <span>Verified ({verifiedCount})</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>{totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                          <span>Fake ({fakeCount})</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>{totalCount > 0 ? Math.round((fakeCount / totalCount) * 100) : 0}%</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#94a3b8' }} />
                          <span>Pending ({pendingCount})</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>{totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-dark)', fontWeight: 600, marginBottom: '16px' }}>Active Rescues By City</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                    {cityCounts.map((c, i) => (
                      <div key={i} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--light-gray)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-light)', fontWeight: 600 }}>{c.city}</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginTop: '4px' }}>{c.count} Cases</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case 'analytics':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Reports Trend Curve</h2>
              <div style={{ width: '100%', height: '240px' }}>
                {renderLineChart(650, 240)}
              </div>
            </div>
            <div className="card">
              <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>Animal Type Percentages</h2>
              {renderDonutChart()}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="card" style={{ maxWidth: '500px' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', color: 'var(--text-dark)' }}>System Profile Settings</h2>
            {settingsSuccess && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                Profile updated successfully!
              </div>
            )}
            <form onSubmit={handleSettingsSubmit} style={{ textAlign: 'left' }}>
              <div className="form-group">
                <label className="form-label">Admin Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={settingsForm.name} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={settingsForm.email} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Upload Profile Picture</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px', marginBottom: '15px' }}>
                  {settingsForm.profilePicture && (
                    <img 
                      src={settingsForm.profilePicture} 
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
                  value={settingsForm.profilePicture || ''} 
                  onChange={(e) => setSettingsForm({ ...settingsForm, profilePicture: e.target.value })}
                />
              </div>
              <button 
                type="submit" 
                style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, fontSize: '0.9rem' }}
              >
                Save Changes
              </button>
            </form>
          </div>
        );

      case 'dashboard':
      default:
        return (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '30px', marginBottom: '30px', alignItems: 'start' }}>
              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-dark)' }}>Reports Overview</h3>
                <div style={{ width: '100%', height: '180px' }}>
                  {renderLineChart()}
                </div>
              </div>

              <div className="card" style={{ padding: '24px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-dark)' }}>Top Animal Types</h3>
                {renderDonutChart()}
              </div>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Recent Reports</h3>
                <span onClick={() => setActiveSection('reports')} style={{ fontSize: '0.85rem', color: '#1E5F3F', fontWeight: 600, cursor: 'pointer' }}>View All</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {reports.slice(0, 5).map(report => (
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
                        style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000';
                        }}
                      />
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>{report.animalType} ({report.condition})</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>📍 {report.location}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-light)' }}>{formatDate(report.reportedAt)}</span>
                      <span className={`status-badge ${report.status}`}>{report.status}</span>
                    </div>
                  </div>
                ))}
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

      {/* Sidebar - Dark theme */}
      <aside className={mobileSidebarOpen ? 'mobile-drawer-open' : ''} style={{
        width: '240px',
        backgroundColor: '#1E293B',
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
            { id: 'users', name: 'Users', icon: <Users size={18} /> },
            { id: 'volunteers', name: 'Volunteers', icon: <UserCheck size={18} /> },
            { id: 'ngos', name: 'NGOs', icon: <Heart size={18} /> },
            { id: 'reports', name: 'Reports', icon: <FileText size={18} /> },
            { id: 'monthly-reports', name: 'Monthly Reports', icon: <BarChart size={18} /> },
            { id: 'analytics', name: 'Analytics', icon: <LineChart size={18} /> },
            { id: 'settings', name: 'Settings', icon: <Settings size={18} /> },
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
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-dark)' }}>System Tasks</span>
                  <span style={{ fontSize: '0.8rem', backgroundColor: '#EBF5F0', color: '#1E5F3F', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                    {notifications.length} Pending
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
                      🎉 All caught up! No pending tasks.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div 
            onClick={() => setActiveSection('settings')} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <div className="header-user-text" style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-dark)' }}>{settingsForm.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', textTransform: 'capitalize' }}>System Admin</div>
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
                backgroundColor: '#1E293B',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '1rem'
              }}>
                AD
              </div>
            )}
            </div>
          </div>
        </header>

        {/* Dashboard Body */}
        <div style={{ padding: '30px', textAlign: 'left', overflowY: 'auto', flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-dark)' }}>Admin Control Panel</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Overview of the ResQ Paws rescue ecosystem</p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {[
              { label: 'Total Reports', count: stats.totalReports.toLocaleString(), border: '#1E5F3F', color: '#1E5F3F', icon: '🐾', id: 'reports' },
              { label: 'Volunteers', count: stats.volunteers.toLocaleString(), border: '#3b82f6', color: '#3b82f6', icon: '👥', id: 'volunteers' },
              { label: 'NGOs', count: stats.ngos.toLocaleString(), border: '#a855f7', color: '#a855f7', icon: '🏢', id: 'ngos' },
              { label: 'Cities', count: stats.cities.toString(), border: '#f59e0b', color: '#f59e0b', icon: '📍', id: 'dashboard' }
            ].map((stat, idx) => (
              <div key={idx} onClick={() => {
                if (stat.label === 'Cities') {
                  setShowCitiesModal(true);
                } else {
                  setActiveSection(stat.id);
                }
              }} className="card" style={{
                padding: '20px',
                borderLeft: `4px solid ${stat.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'var(--transition)',
                cursor: 'pointer'
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

          {/* Dynamic Content */}
          {renderSectionContent()}

          {/* Cities List Modal */}
          {showCitiesModal && (
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
            }}>
              <div className="card" style={{ width: '450px', position: 'relative', padding: '30px', textAlign: 'left' }}>
                <button 
                  onClick={() => setShowCitiesModal(false)} 
                  style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-medium)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '15px' }}>📍 Active Rescue Cities</h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Cities where active incident cases have been submitted by reporters.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto', paddingRight: '5px' }}>
                  {stats.citiesList && stats.citiesList.length > 0 ? (
                    stats.citiesList.map((city, index) => (
                      <div 
                        key={index} 
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--light-gray)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          color: 'var(--text-dark)'
                        }}
                      >
                        <span style={{ fontSize: '1.2rem' }}>🏙️</span>
                        <span>{city}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-light)', textAlign: 'center', padding: '20px' }}>No active cities found.</div>
                  )}
                </div>
                <button 
                  onClick={() => setShowCitiesModal(false)}
                  style={{
                    marginTop: '20px',
                    width: '100%',
                    backgroundColor: '#1E5F3F',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          )}
          {showAddModal && (
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
            }}>
              <div className="card" style={{ width: '450px', position: 'relative', padding: '30px', textAlign: 'left' }}>
                <button 
                  onClick={() => setShowAddModal(false)} 
                  style={{ position: 'absolute', top: '20px', right: '20px', color: 'var(--text-medium)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                >
                  ✕
                </button>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '15px' }}>
                  ➕ Add New {addModalRole === 'ngo' ? 'NGO Partner' : 'Rescue Volunteer'}
                </h3>
                <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginBottom: '20px' }}>
                  Fill in the details to create a pre-approved {addModalRole} account.
                </p>
                <form onSubmit={handleAddUserSubmit}>
                  <div className="form-group">
                    <label className="form-label">{addModalRole === 'ngo' ? 'NGO Name' : 'Full Name'}</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Save Paws NGO"
                      value={addForm.name} 
                      onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      placeholder="e.g. contact@domain.com"
                      value={addForm.email} 
                      onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      placeholder="Min 6 characters"
                      value={addForm.password} 
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      required 
                    />
                  </div>

                  {addModalRole === 'ngo' && (
                    <>
                      <div className="form-group">
                        <label className="form-label">NGO Registration ID</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. NGO-998811"
                          value={addForm.registrationId} 
                          onChange={(e) => setAddForm({ ...addForm, registrationId: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Contact Phone</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. +91 9988776655"
                          value={addForm.contactPhone} 
                          onChange={(e) => setAddForm({ ...addForm, contactPhone: e.target.value })}
                          required 
                        />
                      </div>
                    </>
                  )}

                  <button 
                    type="submit"
                    style={{
                      marginTop: '15px',
                      width: '100%',
                      backgroundColor: '#1E5F3F',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Create Account
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
