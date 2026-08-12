import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Landmark, MapPin, PhoneCall, Play, Sun, Moon, Menu, X } from 'lucide-react';
import SuccessStories from './SuccessStories';

export default function LandingPage({ onNavigate, onOpenLogin, onOpenRegister, isLoggedIn, user, onLogout, isDarkMode, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [landingStats, setLandingStats] = useState({
    totalReports: 0,
    volunteers: 0,
    ngos: 0,
    cities: 0
  });

  React.useEffect(() => {
    fetch('/api/stats/public')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Error fetching stats');
      })
      .then(data => {
        setLandingStats(data);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="landing-page" style={{ backgroundColor: 'var(--white)', minHeight: '100vh', fontFamily: 'var(--font-sans)' }}>
      {/* Emergency Alert Banner */}
      <div style={{
        backgroundColor: '#dc2626',
        color: '#ffffff',
        padding: '12px 24px',
        fontSize: '0.9rem',
        fontWeight: 600,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 1001,
        position: 'relative'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>🚨</span>
          <span>Animal in immediate danger?</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <a href="tel:+919876543210" style={{
            backgroundColor: '#ffffff',
            color: '#dc2626',
            padding: '6px 14px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '0.8rem',
            fontWeight: 700,
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            📞 Call NGO (+91 98765 43210)
          </a>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>OR</span>
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate('report-animal');
              } else {
                alert('Please Login/Register first to report an animal.');
                onOpenLogin();
              }
            }}
            style={{
              backgroundColor: '#1E5F3F',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            📋 Report Now
          </button>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 5%',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--white)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        maxWidth: '100vw',
        boxSizing: 'border-box'
      }}>
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
          <div style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '6px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            🐾
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E5F3F', fontFamily: 'var(--font-heading)' }}>ResQ Paws</span>
        </div>

        {/* Desktop Nav */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '24px' }}>
          {['Home', 'About Us', 'How It Works', 'Services', 'Blog', 'Contact'].map(link => (
            <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} style={{
              color: 'var(--text-medium)',
              fontWeight: 500,
              fontSize: '0.92rem',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#1E5F3F'}
            onMouseOut={(e) => e.target.style.color = 'var(--text-medium)'}
            >
              {link}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
            {isDarkMode ? <Sun size={16} color="#eab308" /> : <Moon size={16} />}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: 'var(--light-gray)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-dark)',
              cursor: 'pointer'
            }}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {isLoggedIn ? (
            <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button 
                onClick={() => onNavigate('dashboard')}
                className="btn-dashboard"
                style={{
                  backgroundColor: '#EBF5F0',
                  color: '#1E5F3F',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Dashboard
              </button>
              <button 
                onClick={onLogout}
                style={{
                  color: '#ef4444',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="desktop-nav" style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={onOpenLogin}
                className="btn-login"
                style={{
                  backgroundColor: '#1E5F3F',
                  color: '#ffffff',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Login
              </button>
              <button 
                onClick={onOpenRegister}
                className="btn-register"
                style={{
                  border: '1px solid #1E5F3F',
                  color: '#1E5F3F',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Slide-Down Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--white)',
          borderBottom: '1px solid var(--border-color)',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          zIndex: 49,
          boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
        }}>
          {['Home', 'About Us', 'How It Works', 'Services', 'Blog', 'Contact'].map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                color: 'var(--text-dark)',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '6px 0',
                borderBottom: '1px solid var(--border-color)'
              }}
            >
              {link}
            </a>
          ))}
          {isLoggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigate('dashboard'); }}
                style={{ backgroundColor: '#1E5F3F', color: '#ffffff', padding: '12px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Dashboard
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                style={{ backgroundColor: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenLogin(); }}
                style={{ flex: 1, backgroundColor: '#1E5F3F', color: '#ffffff', padding: '10px', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
              >
                Login
              </button>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenRegister(); }}
                style={{ flex: 1, border: '1px solid #1E5F3F', color: '#1E5F3F', padding: '10px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}

      {/* Hero Section */}
      <section style={{
        padding: '50px 5%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Left Hero Content */}
        <div style={{ textAlign: 'left' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#EBF5F0',
            color: '#1E5F3F',
            padding: '8px 16px',
            borderRadius: '30px',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '20px'
          }}>
            💚 Every Life Matters
          </div>
          
          <h1 style={{
            fontSize: 'clamp(2.1rem, 5vw, 3.75rem)',
            lineHeight: 1.15,
            color: 'var(--text-dark)',
            fontWeight: 800,
            marginBottom: '16px',
            fontFamily: 'var(--font-heading)'
          }}>
            Together, We Can<br />
            <span style={{ color: '#1E5F3F' }}>Save More Lives</span>
          </h1>

          <p style={{
            color: 'var(--text-light)',
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '28px',
            maxWidth: '520px'
          }}>
            ResQ Paws is a platform that connects kind people with animals in need. Report, Rescue, and Restore — Because they deserve our help.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => isLoggedIn ? onNavigate('report-animal') : onOpenLogin()}
              style={{
                backgroundColor: '#1E5F3F',
                color: '#ffffff',
                padding: '14px 24px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(30, 95, 63, 0.2)'
              }}
            >
              🐾 Report an Animal
            </button>
            
            <a href="#how-it-works" style={{
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              padding: '14px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Play size={18} fill="#334155" /> Learn More
            </a>
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '12px',
            marginTop: '36px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #f1f5f9',
            padding: '16px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
          }}>
            {[
              { count: `${landingStats.totalReports}`, label: 'Animals Rescued', color: '#1E5F3F', icon: '🐾' },
              { count: `${landingStats.volunteers}`, label: 'Active Volunteers', color: '#3b82f6', icon: '👥' },
              { count: `${landingStats.ngos}`, label: 'NGO Partners', color: '#eab308', icon: '🏢' },
              { count: `${landingStats.cities}`, label: 'Cities Covered', color: '#ec4899', icon: '📍' }
            ].map((stat, idx) => (
              <div key={idx} style={{ 
                textAlign: 'left', 
                padding: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '1rem' }}>{stat.icon}</span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>{stat.count}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500, marginTop: '2px' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Hero Image */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', maxWidth: '100%' }}>
          <div style={{
            width: '100%',
            maxWidth: '420px',
            height: 'auto',
            aspectRatio: '1 / 1',
            borderRadius: '24px',
            backgroundImage: "url('https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=600')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
          }} />

          {/* Floating Help Card */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '10px',
            backgroundColor: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '16px',
            padding: '16px',
            maxWidth: 'calc(100% - 20px)',
            width: '220px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            textAlign: 'left',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b91c1c', marginBottom: '8px' }}>
              <div style={{ backgroundColor: '#fee2e2', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <PhoneCall size={16} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Emergency Help</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '10px', lineHeight: 1.4 }}>
              For urgent animal rescue support, call our helpline
            </p>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#b91c1c' }}>
              +91 98765 43210
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
              <span style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: 600 }}>Available 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{
        padding: '80px 8%',
        backgroundColor: 'var(--light-gray)',
        textAlign: 'center',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <h2 style={{ fontSize: '2.25rem', color: 'var(--text-dark)', fontWeight: 700, marginBottom: '12px' }}>
          How It Works
        </h2>
        <p style={{ color: 'var(--text-medium)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 48px' }}>
          Follow these 4 simple steps to report distress cases and coordinate live animal rescues.
        </p>

        <div className="landing-grid-4">
          {[
            {
              step: '1',
              title: 'Upload Photo',
              desc: 'Select or capture a photo showing the animal\'s health condition clearly.',
              icon: '📸',
              bg: '#EBF5F0',
              borderColor: '#1E5F3F'
            },
            {
              step: '2',
              title: 'Select Location',
              desc: 'Pin the exact street, landmark, or coordinates on our interactive map.',
              icon: '📍',
              bg: '#eff6ff',
              borderColor: '#3b82f6'
            },
            {
              step: '3',
              title: 'Volunteer Accepts',
              desc: 'Responders instantly get notified, accept the case, and head out to help.',
              icon: '🧑‍⚕️',
              bg: '#fcf2ff',
              borderColor: '#8b5cf6'
            },
            {
              step: '4',
              title: 'Animal Rescued',
              desc: 'ResQ Paws volunteer reaches the spot, provides aid, and secures the animal.',
              icon: '🐶',
              bg: '#fef3c7',
              borderColor: '#f59e0b'
            }
          ].map((item, idx) => (
            <div key={idx} style={{
              backgroundColor: 'var(--white)',
              border: '1px solid var(--border-color)',
              borderTop: `4px solid ${item.borderColor}`,
              borderRadius: '16px',
              padding: '30px 20px',
              textAlign: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{
                backgroundColor: item.bg,
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                marginBottom: '20px'
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '1px' }}>Step {item.step}</span>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-dark)', fontWeight: 700, margin: '8px 0 10px' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--text-medium)', fontSize: '0.82rem', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Pulsating Call to Action Box */}
        <div className="card" style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: '24px 30px',
          backgroundColor: '#1E5F3F',
          color: '#ffffff',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 10px 15px -3px rgba(30, 95, 63, 0.3)'
        }}>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>🚨 Spot an Animal in Distress?</h4>
            <p style={{ fontSize: '0.85rem', color: '#a7f3d0', marginTop: '4px' }}>It takes less than a minute to file a report and dispatch rescue teams.</p>
          </div>
          <button
            onClick={() => {
              if (isLoggedIn) {
                onNavigate('report-animal');
              } else {
                alert('Please Login/Register first to report an animal. Real-time updates will be sent to your account!');
                onOpenLogin();
              }
            }}
            style={{
              backgroundColor: '#ffffff',
              color: '#1E5F3F',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              animation: 'pulse 2s infinite'
            }}
          >
            Start Incident Report 🐾
          </button>
        </div>

        {/* Style tag for keyframes animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(255, 255, 255, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
            }
          }
        `}} />
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" style={{ padding: '60px 8%', backgroundColor: 'var(--white)', borderTop: '1px solid var(--border-color)' }}>
        <SuccessStories isDarkMode={isDarkMode} currentUser={user} />
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 8%',
        backgroundColor: '#1E5F3F',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        borderTop: '1px solid #174c32'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          🐾 <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#ffffff' }}>ResQ Paws</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#a7f3d0' }}>
          &copy; 2026 ResQ Paws Initiative. Saving our furry friends, one paws at a time.
        </p>
      </footer>
    </div>

  );
}
