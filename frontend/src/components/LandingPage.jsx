import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, Landmark, MapPin, PhoneCall, Play, Sun, Moon, Menu, X, Mail, MessageSquare, Send, CheckCircle2, HeartHandshake, Stethoscope, Sparkles } from 'lucide-react';
import SuccessStories from './SuccessStories';

export default function LandingPage({ onNavigate, onOpenLogin, onOpenRegister, isLoggedIn, user, onLogout, isDarkMode, onToggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [landingStats, setLandingStats] = useState({
    totalReports: 0,
    volunteers: 0,
    ngos: 0,
    cities: 0
  });

  const navItems = [
    { label: 'Home', target: 'home' },
    { label: 'About Us', target: 'about-us' },
    { label: 'How It Works', target: 'how-it-works' },
    { label: 'Services', target: 'services' },
    { label: 'Blog', target: 'success-stories' },
    { label: 'Contact', target: 'contact' }
  ];

  const handleNavClick = (e, targetId) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    if (targetId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const elem = document.getElementById(targetId);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      setContactSent(true);
      setContactForm({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 800);
  };

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
          {navItems.map(item => (
            <a
              key={item.label}
              href={`#${item.target}`}
              onClick={(e) => handleNavClick(e, item.target)}
              style={{
                color: 'var(--text-medium)',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                transition: 'color 0.2s',
                textDecoration: 'none'
              }}
              onMouseOver={(e) => e.target.style.color = '#1E5F3F'}
              onMouseOut={(e) => e.target.style.color = 'var(--text-medium)'}
            >
              {item.label}
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
          {navItems.map(item => (
            <a
              key={item.label}
              href={`#${item.target}`}
              onClick={(e) => handleNavClick(e, item.target)}
              style={{
                color: 'var(--text-dark)',
                fontWeight: 600,
                fontSize: '0.95rem',
                padding: '8px 0',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textDecoration: 'none'
              }}
            >
              <span>{item.label}</span>
              <span style={{ fontSize: '0.8rem', color: '#1E5F3F' }}>→</span>
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
      <section id="home" style={{
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
            
            <a href="#how-it-works" onClick={(e) => handleNavClick(e, 'how-it-works')} style={{
              border: '1px solid #cbd5e1',
              backgroundColor: '#ffffff',
              color: '#334155',
              padding: '14px 24px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none'
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

      {/* About Us Section */}
      <section id="about-us" style={{
        padding: '70px 8%',
        backgroundColor: 'var(--white)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#EBF5F0',
            color: '#1E5F3F',
            padding: '6px 16px',
            borderRadius: '30px',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            💚 About ResQ Paws Initiative
          </div>
          <h2 style={{ fontSize: '2.25rem', color: 'var(--text-dark)', fontWeight: 800, marginBottom: '16px' }}>
            Saving Stray & Injured Animals Together
          </h2>
          <p style={{ color: 'var(--text-medium)', fontSize: '1rem', maxWidth: '750px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            ResQ Paws is a unified digital platform built to connect animal welfare advocates, emergency reporters, active volunteers, and local NGOs to streamline live animal rescue operations across India.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            <div className="card" style={{ padding: '28px', textAlign: 'left', borderTop: '4px solid #1E5F3F', backgroundColor: 'var(--white)' }}>
              <div style={{ backgroundColor: '#EBF5F0', color: '#1E5F3F', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                🎯
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '10px' }}>Our Mission</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', lineHeight: 1.6 }}>
                To reduce animal suffering by providing an instant, transparent reporting mechanism that dispatches real-time alerts to nearby rescue teams within minutes.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', textAlign: 'left', borderTop: '4px solid #3b82f6', backgroundColor: 'var(--white)' }}>
              <div style={{ backgroundColor: '#eff6ff', color: '#3b82f6', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                👁️
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '10px' }}>Our Vision</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', lineHeight: 1.6 }}>
                Creating stray-friendly cities where every injured, abandoned, or sick animal gets timely medical care, shelter, and a chance to live a safe, dignified life.
              </p>
            </div>

            <div className="card" style={{ padding: '28px', textAlign: 'left', borderTop: '4px solid #eab308', backgroundColor: 'var(--white)' }}>
              <div style={{ backgroundColor: '#fefce8', color: '#ca8a04', width: '50px', height: '50px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', marginBottom: '16px' }}>
                🤝
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '10px' }}>Community Power</h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-medium)', lineHeight: 1.6 }}>
                Bringing citizens, animal lovers, veterinarians, and registered shelters under one ecosystem to eliminate miscommunication and speed up rescue missions.
              </p>
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

      {/* Services Section */}
      <section id="services" style={{
        padding: '70px 8%',
        backgroundColor: 'var(--light-gray)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#EBF5F0',
            color: '#1E5F3F',
            padding: '6px 16px',
            borderRadius: '30px',
            fontWeight: 600,
            fontSize: '0.85rem',
            marginBottom: '16px'
          }}>
            ⚡ What We Offer
          </div>
          <h2 style={{ fontSize: '2.25rem', color: 'var(--text-dark)', fontWeight: 800, marginBottom: '16px' }}>
            Our Rescue & Welfare Services
          </h2>
          <p style={{ color: 'var(--text-medium)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto 40px', lineHeight: 1.6 }}>
            Explore how ResQ Paws coordinates animal distress response, medical care, and adoption drives.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            {[
              {
                title: '24/7 Emergency Dispatch',
                desc: 'Instant GPS pin reporting sends immediate notifications to verified volunteers nearby.',
                icon: <PhoneCall size={24} color="#1E5F3F" />,
                badge: 'Fast Response'
              },
              {
                title: 'Medical & Shelter Aid',
                desc: 'Direct connection with veterinary doctors and registered NGO shelters for emergency treatment.',
                icon: <Stethoscope size={24} color="#2563eb" />,
                badge: 'Healthcare'
              },
              {
                title: 'Stray Adoption Drive',
                desc: 'Connecting rescued animals with loving families looking to foster or adopt permanently.',
                icon: <HeartHandshake size={24} color="#ec4899" />,
                badge: 'Adoptions'
              },
              {
                title: 'AI Animal Scan & Pin',
                desc: 'Smart AI detection identifies animal condition and auto-fetches precise OpenStreetMap coordinates.',
                icon: <Sparkles size={24} color="#ca8a04" />,
                badge: 'AI Smart Tech'
              }
            ].map((srv, idx) => (
              <div key={idx} className="card" style={{ padding: '24px', textAlign: 'left', backgroundColor: 'var(--white)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ backgroundColor: 'var(--light-gray)', padding: '10px', borderRadius: '10px', display: 'flex' }}>
                    {srv.icon}
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: '20px', backgroundColor: '#EBF5F0', color: '#1E5F3F' }}>
                    {srv.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>{srv.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.5 }}>{srv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories / Blog Section */}
      <section id="success-stories" style={{ padding: '60px 8%', backgroundColor: 'var(--white)', borderTop: '1px solid var(--border-color)' }}>
        <SuccessStories isDarkMode={isDarkMode} currentUser={user} />
      </section>

      {/* Contact Section */}
      <section id="contact" style={{
        padding: '80px 8%',
        backgroundColor: 'var(--light-gray)',
        borderTop: '1px solid var(--border-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EBF5F0',
              color: '#1E5F3F',
              padding: '6px 16px',
              borderRadius: '30px',
              fontWeight: 600,
              fontSize: '0.85rem',
              marginBottom: '16px'
            }}>
              📞 Get In Touch
            </div>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--text-dark)', fontWeight: 800, marginBottom: '12px' }}>
              Contact ResQ Paws Support
            </h2>
            <p style={{ color: 'var(--text-medium)', fontSize: '1rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
              Have a question, need emergency help, or want to partner with us? Connect instantly via WhatsApp, Email, or Helpline!
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'start' }}>
            
            {/* Quick Contact Method Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* WhatsApp Card */}
              <div className="card" style={{
                padding: '24px',
                borderLeft: '5px solid #25D366',
                textAlign: 'left',
                backgroundColor: 'var(--white)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)' }}>Chat on WhatsApp</h3>
                    <span style={{ fontSize: '0.78rem', color: '#16a34a', fontWeight: 600 }}>● Active & Instant Response</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '16px' }}>
                  Need fast emergency coordination or have a general inquiry? Chat directly with our support team on WhatsApp.
                </p>
                <a
                  href="https://wa.me/919876543210?text=Hi%20ResQ%20Paws%20Team%2C%20I%20need%20help%20or%20have%20an%20inquiry!"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: '#25D366',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)'
                  }}
                >
                  <MessageSquare size={18} /> Open WhatsApp Chat 💬
                </a>
              </div>

              {/* Direct Email Card */}
              <div className="card" style={{
                padding: '24px',
                borderLeft: '5px solid #1E5F3F',
                textAlign: 'left',
                backgroundColor: 'var(--white)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ backgroundColor: '#EBF5F0', color: '#1E5F3F', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Mail size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)' }}>Send Us an Email</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>support@resqpaws.org</span>
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '16px' }}>
                  For official inquiries, NGO partnerships, or volunteer verification support.
                </p>
                <a
                  href="mailto:support@resqpaws.org?subject=ResQ%20Paws%20Website%20Inquiry"
                  style={{
                    backgroundColor: '#1E5F3F',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                >
                  <Mail size={18} /> Send Direct Email ✉️
                </a>
              </div>

              {/* 24/7 Helpline & Address Card */}
              <div className="card" style={{
                padding: '24px',
                borderLeft: '5px solid #dc2626',
                textAlign: 'left',
                backgroundColor: 'var(--white)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PhoneCall size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)' }}>24/7 Rescue Helpline</h3>
                    <span style={{ fontSize: '0.9rem', color: '#dc2626', fontWeight: 800 }}>+91 98765 43210</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  <MapPin size={16} color="#1E5F3F" />
                  <span>Sector 62, Noida, NCR, Uttar Pradesh, India - 201309</span>
                </div>
              </div>

            </div>

            {/* Interactive Email & Message Form */}
            <div className="card" style={{ padding: '30px', textAlign: 'left', backgroundColor: 'var(--white)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '8px' }}>
                Send a Direct Message
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '24px' }}>
                Fill out the form below and our team will get back to you via Email or WhatsApp.
              </p>

              {contactSent ? (
                <div style={{
                  backgroundColor: '#dcfce7',
                  border: '1px solid #86efac',
                  color: '#15803d',
                  padding: '20px',
                  borderRadius: '12px',
                  textAlign: 'center',
                  animation: 'fadeIn 0.3s ease-out'
                }}>
                  <CheckCircle2 size={40} style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Message Sent Successfully!</h4>
                  <p style={{ fontSize: '0.85rem' }}>
                    Thank you for reaching out to ResQ Paws. Our team will contact you on your Email or WhatsApp shortly!
                  </p>
                  <button
                    onClick={() => setContactSent(false)}
                    style={{
                      marginTop: '16px',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vishal Kumar"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--light-gray)',
                        color: 'var(--text-dark)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--light-gray)',
                          color: 'var(--text-dark)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>Phone / WhatsApp</label>
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--light-gray)',
                          color: 'var(--text-dark)',
                          fontSize: '0.9rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Volunteer Inquiry / Rescue Support"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--light-gray)',
                        color: 'var(--text-dark)',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '6px' }}>Message</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Write your message details here..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--light-gray)',
                        color: 'var(--text-dark)',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    style={{
                      backgroundColor: '#1E5F3F',
                      color: '#ffffff',
                      padding: '14px',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(30, 95, 63, 0.2)'
                    }}
                  >
                    <Send size={18} /> {contactLoading ? 'Sending Message...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
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
