import React, { useEffect, useState } from 'react';
import { Heart, Plus, Sparkles, Image, ShieldAlert, ArrowDown } from 'lucide-react';

export default function SuccessStories({ isDarkMode, currentUser }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Story Form State
  const [form, setForm] = useState({
    animalName: '',
    description: '',
    beforeImage: '',
    afterImage: '',
    status: 'Adopted ❤️'
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // Can this user write stories? (NGO, Volunteer, Admin)
  const canWriteStory = currentUser && ['ngo', 'volunteer', 'admin'].includes(currentUser.role);

  const defaultStories = [
    {
      _id: '645f9a23f12a3b001c900021',
      animalName: 'Bruno',
      beforeImage: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=400',
      description: 'Bruno was found on Noida Expressway with severe dehydration and leg fracture. NGO and volunteers rescued him, operated, and he has now been adopted by a loving family!',
      status: 'Adopted ❤️',
      authorName: 'Happy Paws NGO'
    },
    {
      _id: '645f9a23f12a3b001c900022',
      animalName: 'Bella',
      beforeImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&q=80&w=400',
      description: 'Bella the kitten was trapped in a deep storm pipe for 2 days. Volunteers retrieved her and nurtured her. She is now healthy and adopted.',
      status: 'Adopted ❤️',
      authorName: 'Rahul Singh (Volunteer)'
    },
    {
      _id: '645f9a23f12a3b001c900023',
      animalName: 'Rocky',
      beforeImage: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&q=80&w=400',
      description: 'Rocky was spotted near a construction site with severe heatstroke. ResQ Paws team arrived promptly, provided IV fluids, and placed him in foster care.',
      status: 'Adopted ❤️',
      authorName: 'ResQ Paws Team'
    },
    {
      _id: '645f9a23f12a3b001c900024',
      animalName: 'Milo',
      beforeImage: 'https://images.unsplash.com/photo-1522441815192-d9f04eb0615c?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&q=80&w=400',
      description: 'Milo the parrot was rescued from tangled kite string in Sector 15. After wing rehabilitation by avian specialists, Milo was safely released back into nature.',
      status: 'Healthy & Released 🐾',
      authorName: 'Happy Paws NGO'
    },
    {
      _id: '645f9a23f12a3b001c900025',
      animalName: 'Charlie',
      beforeImage: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=400',
      description: 'Charlie was found shivering during monsoon rains in Greater Noida with a high fever. ResQ Paws volunteers sheltered him, completed treatment & vaccination, and he is now adopted!',
      status: 'Adopted ❤️',
      authorName: 'ResQ Paws Team'
    },
    {
      _id: '645f9a23f12a3b001c900026',
      animalName: 'Coco',
      beforeImage: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400',
      afterImage: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=400',
      description: 'Coco the Persian cat was rescued from an abandoned warehouse with an eye injury. After emergency surgery by our partner vet clinic, Coco made a 100% recovery!',
      status: 'Adopted ❤️',
      authorName: 'Paws Welfare NGO'
    }
  ];

  const fetchStories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stories');
      if (res.ok) {
        const data = await res.json();
        let merged = Array.isArray(data) && data.length > 0 ? [...data] : [];
        if (merged.length < 6) {
          defaultStories.forEach(ds => {
            if (merged.length < 6 && !merged.some(s => s._id === ds._id || s.animalName === ds.animalName)) {
              merged.push(ds);
            }
          });
        }
        setStories(merged);
      } else {
        setStories(defaultStories);
      }
    } catch (err) {
      console.error(err);
      setStories(defaultStories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.animalName || !form.beforeImage || !form.afterImage || !form.description) {
      alert('Please fill out all fields and upload both before & after images.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setMessage('Story posted successfully! 🐾');
        setForm({
          animalName: '',
          description: '',
          beforeImage: '',
          afterImage: '',
          status: 'Adopted ❤️'
        });
        fetchStories();
        setTimeout(() => {
          setShowAddForm(false);
          setMessage('');
        }, 1500);
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to post success story.');
      }
    } catch (err) {
      console.error(err);
      alert('Error posting story.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this success story?')) return;
    try {
      const res = await fetch(`/api/stories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        fetchStories();
      } else {
        alert('Could not delete story.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '4px' }}>
      
      {/* Title & Add Action Row (Restored to original left-aligned layout) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎉 Success Stories <Sparkles size={20} color="#eab308" />
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-light)', marginTop: '4px' }}>
            Inspiring rescue operations and happy endings that motivate our community.
          </p>
        </div>

        {canWriteStory && (
          <button
            onClick={() => setShowAddForm(true)}
            style={{
              backgroundColor: '#1E5F3F',
              color: '#ffffff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(30, 95, 63, 0.2)'
            }}
          >
            <Plus size={16} /> Share Story
          </button>
        )}
      </div>

      {/* Grid of Stories */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>Loading stories...</p>
      ) : stories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-light)' }}>
          <Heart size={36} style={{ display: 'block', margin: '0 auto 12px', color: '#f43f5e' }} />
          <p style={{ fontSize: '0.9rem' }}>No success stories shared yet. Be the first to share a rescue story!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '30px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {stories.map(story => (
            <div
              key={story._id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                padding: '20px',
                backgroundColor: 'var(--white)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                position: 'relative',
                textAlign: 'left'
              }}
            >
              {/* Header: Animal Name & Status Badge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🐾 {story.animalName}
                </h3>
                <span style={{
                  fontSize: '0.78rem',
                  backgroundColor: '#fee2e2',
                  color: '#991b1b',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {story.status}
                </span>
              </div>

              {/* Before & After Rescue Comparison */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {/* Before Stage */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={story.beforeImage}
                    alt="Before rescue"
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px' }}
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>
                    Before Rescue
                  </span>
                </div>

                {/* After Stage */}
                <div style={{ position: 'relative' }}>
                  <img
                    src={story.afterImage}
                    alt="After rescue"
                    style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '10px' }}
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=400'}
                  />
                  <span style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '8px',
                    backgroundColor: 'rgba(30, 95, 63, 0.85)',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 600
                  }}>
                    After Rescue
                  </span>
                </div>
              </div>

              {/* Description Body */}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-medium)', lineHeight: '1.5', flex: 1, marginBottom: '16px' }}>
                {story.description}
              </p>

              {/* Footer: Author Info & Delete (Admin only) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                <span>Shared by: <strong>{story.authorName}</strong></span>
                {currentUser && currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleDelete(story._id)}
                    style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Share Story Call-To-Action Banner */}
      <div className="card" style={{
        maxWidth: '1200px',
        margin: '40px auto 0',
        padding: '28px 32px',
        backgroundColor: '#EBF5F0',
        border: '2px dashed #1E5F3F',
        borderRadius: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        textAlign: 'left'
      }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1E5F3F', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🐾 Have a Life-Saving Rescue Story to Share?
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#334155', marginTop: '6px', maxWidth: '650px', lineHeight: 1.5 }}>
            Every before & after transformation story gives hope to thousands of animal lovers. Share your rescue journey, foster story, or adoption update with the ResQ Paws community!
          </p>
        </div>
        <button
          onClick={() => {
            if (canWriteStory) {
              setShowAddForm(true);
            } else if (currentUser) {
              alert('Rescue stories can be shared by NGO accounts, Volunteers, and Admins. If you are a reporter, send your story via our Contact Form!');
            } else {
              alert('Please Login/Register to post your success story!');
            }
          }}
          style={{
            backgroundColor: '#1E5F3F',
            color: '#ffffff',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '0.9rem',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(30, 95, 63, 0.25)'
          }}
        >
          <Plus size={18} /> Share Your Rescue Story
        </button>
      </div>

      {/* Share Success Story Modal */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            backgroundColor: 'var(--white)',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-dark)' }}>Share a Success Story</h3>
              <button
                onClick={() => setShowAddForm(false)}
                style={{ border: 'none', background: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-medium)' }}
              >
                ✕
              </button>
            </div>

            {message && (
              <div style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '10px 14px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem' }}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Animal's Name (e.g. Bruno)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter dog/cat's name"
                  value={form.animalName}
                  onChange={(e) => setForm({ ...form, animalName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Before Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'beforeImage')}
                    required
                  />
                  {form.beforeImage && (
                    <img src={form.beforeImage} alt="before preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">After Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'afterImage')}
                    required
                  />
                  {form.afterImage && (
                    <img src={form.afterImage} alt="after preview" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '6px', marginTop: '8px' }} />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Rescue Details / Story</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Explain how the animal was found, saved, treated, and adopted..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  style={{ resize: 'none' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Status</label>
                <select
                  className="form-control"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="Adopted ❤️">Adopted ❤️</option>
                  <option value="Healthy & Released 🐾">Healthy & Released 🐾</option>
                  <option value="Fostered 🏠">Fostered 🏠</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: '#1E5F3F',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  border: 'none',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  marginTop: '10px'
                }}
              >
                {submitting ? 'Sharing...' : 'Share Success Story'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
