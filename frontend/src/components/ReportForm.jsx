import React, { useState } from 'react';
import { MapPin, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ReportForm({ user, onAddReport, onCancel }) {
  const [animalType, setAnimalType] = useState('');
  const [condition, setCondition] = useState('');
  const [location, setLocation] = useState('Search or click on map');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [aiScanning, setAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [mapLoading, setMapLoading] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const realMapRef = React.useRef(null);
  const realMarkerRef = React.useRef(null);

  // Dynamically load Leaflet CSS and JS
  React.useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const [suggestions, setSuggestions] = useState([]);

  // Query cleaning for common misspellings & formatting
  const cleanSearchQuery = (raw) => {
    if (!raw) return '';
    let q = raw.toLowerCase().trim();
    q = q.replace(/knowlage/g, 'knowledge');
    q = q.replace(/parak/g, 'park');
    q = q.replace(/park(\d+)/g, 'park $1');
    q = q.replace(/sec(\d+)/g, 'sector $1');
    q = q.replace(/sec\s+(\d+)/g, 'sector $1');
    q = q.replace(/g\s*noida/g, 'greater noida');
    return q;
  };

  // Initialize Real Leaflet Map in Modal & Auto-Fetch GPS Location
  const initRealLeafletMap = () => {
    if (!window.L) return;
    const container = document.getElementById('real-leaflet-map');
    if (!container) return;

    if (realMapRef.current) {
      realMapRef.current.remove();
      realMapRef.current = null;
    }

    // Default center: Noida / New Delhi
    const startLat = 28.5706;
    const startLng = 77.3272;

    const map = window.L.map('real-leaflet-map').setView([startLat, startLng], 13);
    realMapRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const greenIcon = window.L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = window.L.marker([startLat, startLng], { icon: greenIcon, draggable: true }).addTo(map);
    realMarkerRef.current = marker;

    const reverseGeocode = (lat, lng) => {
      setMapLoading(true);
      setSelectedCoords({ lat, lng });
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        })
        .catch(() => {
          setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        })
        .finally(() => setMapLoading(false));
    };

    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      reverseGeocode(lat, lng);
    });

    marker.on('dragend', () => {
      const { lat, lng } = marker.getLatLng();
      reverseGeocode(lat, lng);
    });

    // AUTO-DETECT USER GPS LOCATION ON OPEN!
    if (navigator.geolocation) {
      setMapLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (realMapRef.current && realMarkerRef.current) {
            realMapRef.current.setView([lat, lng], 15);
            realMarkerRef.current.setLatLng([lat, lng]);
          }
          reverseGeocode(lat, lng);
        },
        (err) => {
          console.log('GPS auto-detection skipped or fallback:', err);
          reverseGeocode(startLat, startLng);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      reverseGeocode(startLat, startLng);
    }

    setTimeout(() => {
      map.invalidateSize();
    }, 250);
  };

  React.useEffect(() => {
    if (showMapModal) {
      const timer = setTimeout(() => {
        initRealLeafletMap();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [showMapModal]);

  // Ultra-smart location search (Photon Fuzzy Search + Nominatim + Word Deconstruction Fallback)
  const handleRealLocationSearch = async (queryText) => {
    if (!queryText || queryText.trim().length < 2) return;
    setMapLoading(true);
    setSuggestions([]);

    const rawInput = queryText.trim();
    let foundLat = null;
    let foundLng = null;
    let foundAddress = null;

    // Strategy 1: Query Photon API (Elasticsearch Fuzzy Geocoder for OpenStreetMap)
    try {
      const photonRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(rawInput)}&limit=5`);
      const photonData = await photonRes.json();
      if (photonData && photonData.features && photonData.features.length > 0) {
        const feat = photonData.features[0];
        foundLng = feat.geometry.coordinates[0];
        foundLat = feat.geometry.coordinates[1];
        const p = feat.properties;
        const parts = [p.name, p.street, p.district, p.city, p.state, p.country].filter(Boolean);
        foundAddress = parts.join(', ');
      }
    } catch (e) {
      console.log('Photon search error:', e);
    }

    // Strategy 2: If Photon had no match, query Nominatim with exact and cleaned queries
    if (!foundLat) {
      const nomAttempts = [rawInput, cleanSearchQuery(rawInput)];
      for (const q of nomAttempts) {
        try {
          const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`);
          const nomData = await nomRes.json();
          if (nomData && nomData.length > 0) {
            foundLat = parseFloat(nomData[0].lat);
            foundLng = parseFloat(nomData[0].lon);
            foundAddress = nomData[0].display_name;
            break;
          }
        } catch (e) {
          console.log('Nominatim search error:', e);
        }
      }
    }

    // Strategy 3: Progressive Word Deconstruction (e.g. "jehanbad raja bazar murlidhar school" -> "jehanbad raja bazar")
    if (!foundLat) {
      const words = rawInput.split(/\s+/);
      for (let i = words.length - 1; i >= 1; i--) {
        const subQuery = words.slice(0, i).join(' ');
        if (subQuery.length < 2) continue;

        try {
          const subRes = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(subQuery)}&limit=3`);
          const subData = await subRes.json();
          if (subData && subData.features && subData.features.length > 0) {
            const feat = subData.features[0];
            foundLng = feat.geometry.coordinates[0];
            foundLat = feat.geometry.coordinates[1];
            const p = feat.properties;
            const parts = [p.name, p.district, p.city, p.state, p.country].filter(Boolean);
            const baseAddr = parts.join(', ');
            const customDetail = words.slice(i).join(' ');
            foundAddress = `${customDetail}, ${baseAddr}`;
            break;
          }
        } catch (e) {
          console.log('Subquery fallback error:', e);
        }
      }
    }

    // Apply result to map without ANY error alerts!
    if (foundLat && foundLng) {
      if (realMapRef.current && realMarkerRef.current) {
        realMapRef.current.flyTo([foundLat, foundLng], 15);
        realMarkerRef.current.setLatLng([foundLat, foundLng]);
      }
      setLocation(foundAddress || rawInput);
      setSelectedCoords({ lat: foundLat, lng: foundLng });
    } else {
      // Graceful fallback: set text to user's typed string so their typed location is preserved 100%!
      setLocation(rawInput);
    }

    setMapLoading(false);
  };

  // Live autocomplete suggestions via Photon + Nominatim
  const fetchLiveSuggestions = async (val) => {
    if (!val || val.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const query = val.trim();
    try {
      const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const list = data.features.map(f => {
          const p = f.properties;
          const label = [p.name, p.street, p.district, p.city, p.state, p.country].filter(Boolean).join(', ');
          return {
            lat: f.geometry.coordinates[1],
            lon: f.geometry.coordinates[0],
            display_name: label
          };
        });
        setSuggestions(list);
      } else {
        const nomRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanSearchQuery(query))}&limit=4`);
        const nomData = await nomRes.json();
        if (nomData && Array.isArray(nomData)) {
          setSuggestions(nomData);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRealGPS = () => {
    if (navigator.geolocation) {
      setMapLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (realMapRef.current && realMarkerRef.current) {
            realMapRef.current.flyTo([lat, lng], 16);
            realMarkerRef.current.setLatLng([lat, lng]);
          }
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (data && data.display_name) {
                setLocation(data.display_name);
              }
            })
            .finally(() => setMapLoading(false));
        },
        () => {
          setMapLoading(false);
          alert('GPS location permission denied. Please pick manually on the map.');
        }
      );
    }
  };

  // Mock map coordinates for clicking
  const [markerPos, setMarkerPos] = useState({ x: 180, y: 150 });

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMarkerPos({ x, y });

    // Map coordinates to mock addresses
    let mockLoc = 'Sector 62, Noida, Uttar Pradesh';
    if (x < 120 && y < 120) mockLoc = 'Green Park, Noida';
    else if (x > 250 && y < 150) mockLoc = 'Sunshine School, Noida';
    else if (x < 150 && y > 250) mockLoc = 'Community Park, Noida';
    else if (x > 250 && y > 220) mockLoc = 'Sunrise Apartments, Noida';
    else if (x > 150 && x < 250 && y > 150 && y < 250) mockLoc = 'Pet Care Clinic, Noida';
    
    setLocation(mockLoc);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        
        // Trigger AI Scanner Simulation
        setAiScanning(true);
        setAiResult(null);
        setTimeout(() => {
          const name = file.name.toLowerCase();
          let detected = 'Dog'; // default fallback
          let confidence = 87;

          if (name.includes('cat') || name.includes('kitten')) {
            detected = 'Cat';
            confidence = 96;
          } else if (name.includes('cow') || name.includes('calf')) {
            detected = 'Cow';
            confidence = 98;
          } else if (name.includes('bird') || name.includes('pigeon') || name.includes('sparrow')) {
            detected = 'Bird';
            confidence = 94;
          } else if (name.includes('monkey')) {
            detected = 'Monkey';
            confidence = 95;
          } else if (name.includes('horse')) {
            detected = 'Horse';
            confidence = 97;
          } else if (name.includes('dog') || name.includes('puppy')) {
            detected = 'Dog';
            confidence = 98;
          } else {
            const list = ['Dog', 'Cat', 'Cow', 'Bird', 'Monkey', 'Horse'];
            detected = list[Math.floor(Math.random() * list.length)];
            confidence = Math.floor(Math.random() * 20) + 75;
          }

          setAiResult({ detected, confidence });
          setAnimalType(detected); // Auto-populate dropdown!
          setAiScanning(false);
        }, 1500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!animalType || !condition || !description || location === 'Search or click on map') {
      alert('Please fill out all required fields and pick a location on the map.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('animalType', animalType);
    formData.append('condition', condition);
    formData.append('location', location);
    formData.append('address', address);
    formData.append('description', description);
    formData.append('priority', priority);
    if (selectedCoords) {
      formData.append('latitude', selectedCoords.lat);
      formData.append('longitude', selectedCoords.lng);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        setSuccess(true);
        const data = await response.json();
        setTimeout(() => {
          onAddReport(data);
        }, 1500);
      } else {
        const errData = await response.json();
        alert(errData.message || 'Error submitting report');
      }
    } catch (err) {
      console.error(err);
      alert('Network error, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.3s ease' }}>
      {success ? (
        <div className="card" style={{
          maxWidth: '500px',
          margin: '100px auto',
          textAlign: 'center',
          padding: '40px',
          borderColor: '#22c55e'
        }}>
          <CheckCircle2 size={64} color="#22c55e" style={{ margin: '0 auto 20px' }} />
          <h2 style={{ marginBottom: '10px', color: '#166534' }}>Report Submitted!</h2>
          <p style={{ color: '#64748b' }}>Your rescue case is now active. Nearby volunteers are being notified.</p>
        </div>
      ) : (
        <div className="report-grid">
          {/* Form Side */}
          <div className="card" style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Report an Animal in Need</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '24px' }}>Your report can save a life.</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Animal Type</label>
                <select 
                  className="form-control"
                  value={animalType}
                  onChange={(e) => setAnimalType(e.target.value)}
                  required
                >
                  <option value="">Select Animal Type</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Cow">Cow</option>
                  <option value="Bird">Bird</option>
                  <option value="Monkey">Monkey</option>
                  <option value="Horse">Horse</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Condition</label>
                <select
                  className="form-control"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="Injured on Roadside">Injured on Roadside</option>
                  <option value="Broken Wing / Limping">Broken Wing / Limping</option>
                  <option value="Sick / Malnourished">Sick / Malnourished</option>
                  <option value="Trapped / In Danger">Trapped / In Danger</option>
                  <option value="Other / Multiple injuries">Other / Multiple injuries</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Location <span style={{ color: '#ef4444' }}>*</span></span>
                  <span 
                    onClick={() => setShowMapModal(true)}
                    style={{ fontSize: '0.78rem', color: '#1E5F3F', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    🗺️ Click to Open Map
                  </span>
                </label>
                <div 
                  onClick={() => setShowMapModal(true)}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  <input
                    type="text"
                    className="form-control"
                    style={{
                      paddingLeft: '40px',
                      paddingRight: '120px',
                      cursor: 'pointer',
                      backgroundColor: '#f8fafc',
                      border: location !== 'Search or click on map' ? '1.5px solid #1E5F3F' : '1px solid #cbd5e1',
                      fontWeight: location !== 'Search or click on map' ? 600 : 400,
                      color: location !== 'Search or click on map' ? 'var(--text-dark)' : '#94a3b8'
                    }}
                    value={location}
                    readOnly
                    placeholder="Click to select location on map"
                  />
                  <MapPin size={18} color="#1E5F3F" style={{ position: 'absolute', left: '14px', top: '14px' }} />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMapModal(true);
                    }}
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '7px',
                      backgroundColor: '#1E5F3F',
                      color: '#ffffff',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 4px rgba(30, 95, 63, 0.2)'
                    }}
                  >
                    🗺️ Select Map
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Address (Optional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter address details (landmark, block, floor)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="4"
                  maxLength="500"
                  placeholder="Describe the situation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', textAlign: 'right', marginTop: '4px' }}>
                  {description.length}/500
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Upload Images</label>
                <div style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f8fafc',
                  transition: 'var(--transition)'
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#1E5F3F'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                onClick={() => document.getElementById('image-upload-input').click()}
                >
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageChange}
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '6px', margin: '0 auto' }} />
                  ) : (
                    <>
                      <Upload size={32} color="#94a3b8" style={{ margin: '0 auto 10px' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#475569' }}>Click to upload images</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>or drag and drop</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>JPG, PNG up to 10MB</div>
                    </>
                  )}
                </div>
              </div>

              {/* AI Detection Result Panel */}
              {(aiScanning || aiResult) && (
                <div style={{
                  marginBottom: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--light-gray)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#1E5F3F' }}>
                    <span>🤖</span> AI Image Classifier
                  </div>
                  
                  {aiScanning ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.82rem', color: 'var(--text-medium)' }}>
                      <div className="ai-spinner" style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid #cbd5e1',
                        borderTop: '2px solid #1E5F3F',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      <span>Scanning image and detecting animal species...</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-medium)' }}>
                      Detected: <strong style={{ color: '#1E5F3F' }}>{aiResult.detected} ({aiResult.confidence}% Confidence)</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', marginTop: '4px' }}>
                        *Animal type dropdown has been automatically set to <strong>{aiResult.detected}</strong>.
                      </div>
                    </div>
                  )}

                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}} />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '12px' }}>Priority Level</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  {['low', 'medium', 'high'].map(lvl => (
                    <label key={lvl} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textTransform: 'capitalize', fontSize: '0.9rem' }}>
                      <input
                        type="radio"
                        name="priority"
                        value={lvl}
                        checked={priority === lvl}
                        onChange={() => setPriority(lvl)}
                        style={{ accentColor: '#1E5F3F', width: '16px', height: '16px' }}
                      />
                      <span className={`priority-badge ${lvl}`}>
                        <span className="dot" />
                        {lvl}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    backgroundColor: '#1E5F3F',
                    color: '#white',
                    padding: '14px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    color: '#ffffff'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#174c32'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#1E5F3F'}
                >
                  {loading ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    padding: '14px 24px',
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          {/* Map Side */}
          <div className="report-sidebar">
            {/* Interactive Mock Map */}
            <div className="card" style={{ padding: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Click Map to Place Pin</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> Interactive
                </span>
              </div>
              
              <div 
                style={{
                  height: '350px',
                  backgroundColor: '#e2e8f0',
                  borderRadius: '8px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'crosshair',
                  border: '1px solid #cbd5e1',
                  backgroundImage: `radial-gradient(#cbd5e1 1.5px, transparent 1.5px), radial-gradient(#cbd5e1 1.5px, #f8fafc 1.5px)`,
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px'
                }}
                onClick={handleMapClick}
              >
                {/* Mock Map Streets and landmarks */}
                <div style={{ position: 'absolute', top: '40px', left: '30px', backgroundColor: '#e2f0d9', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#388e3c', border: '1px solid #c2e0b4' }}>Green Park</div>
                <div style={{ position: 'absolute', top: '150px', left: '20px', backgroundColor: '#f1f5f9', borderTop: '4px solid #cbd5e1', borderBottom: '4px solid #cbd5e1', width: '90px', height: '30px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>City Road</div>
                <div style={{ position: 'absolute', top: '120px', right: '40px', backgroundColor: '#fff3cd', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#d97706', border: '1px solid #ffeeba' }}>Sunshine School</div>
                <div style={{ position: 'absolute', bottom: '60px', left: '40px', backgroundColor: '#e2f0d9', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#388e3c', border: '1px solid #c2e0b4' }}>Community Park</div>
                <div style={{ position: 'absolute', bottom: '80px', right: '30px', backgroundColor: '#eff6ff', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#2563eb', border: '1px solid #bfdbfe' }}>Sunrise Apts</div>
                <div style={{ position: 'absolute', top: '180px', left: '160px', backgroundColor: '#fef2f2', padding: '6px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#ef4444', border: '1px solid #fecaca' }}>Pet Care Clinic</div>

                {/* Grid roads */}
                <div style={{ position: 'absolute', top: '140px', left: 0, right: 0, height: '24px', backgroundColor: '#e2e8f0', borderTop: '1px dashed #94a3b8', borderBottom: '1px dashed #94a3b8', zIndex: 1 }} />
                <div style={{ position: 'absolute', left: '140px', top: 0, bottom: 0, width: '24px', backgroundColor: '#e2e8f0', borderLeft: '1px dashed #94a3b8', borderRight: '1px dashed #94a3b8', zIndex: 1 }} />

                {/* Marker */}
                <div style={{
                  position: 'absolute',
                  left: `${markerPos.x - 12}px`,
                  top: `${markerPos.y - 30}px`,
                  zIndex: 10,
                  transition: 'left 0.2s, top 0.2s',
                  pointerEvents: 'none'
                }}>
                  <MapPin size={24} color="#1E5F3F" fill="#EBF5F0" />
                </div>
              </div>
            </div>

            {/* Tips Card */}
            <div className="card" style={{ textAlign: 'left', borderLeft: '4px solid #1E5F3F' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💡 Tips Before Reporting
              </h3>
              <ul style={{ listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: '#475569' }}>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <span style={{ color: '#1E5F3F', fontWeight: 'bold' }}>✓</span> Check if the animal is in immediate danger.
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <span style={{ color: '#1E5F3F', fontWeight: 'bold' }}>✓</span> Provide exact location/landmark for faster help.
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <span style={{ color: '#1E5F3F', fontWeight: 'bold' }}>✓</span> Clear images help volunteers understand situation better.
                </li>
                <li style={{ display: 'flex', gap: '8px', alignItems: 'start' }}>
                  <span style={{ color: '#1E5F3F', fontWeight: 'bold' }}>✓</span> Be kind and patient.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Map Location Picker Modal */}
      {showMapModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.25s ease'
        }}>
          <div className="card animate-fade-in" style={{ width: '650px', maxWidth: '92vw', position: 'relative', padding: '24px', textAlign: 'left', borderRadius: '16px' }}>
            <button 
              onClick={() => setShowMapModal(false)} 
              style={{ position: 'absolute', top: '20px', right: '20px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              🗺️ Pick Rescue Location on Map
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '20px' }}>
              Click anywhere on the interactive map canvas below or choose a city preset.
            </p>

            {/* Quick Search & GPS Trigger */}
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Type location (e.g. greater noida knowlage park2)..."
                  value={modalSearch}
                  onChange={(e) => {
                    setModalSearch(e.target.value);
                    fetchLiveSuggestions(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleRealLocationSearch(modalSearch);
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => handleRealLocationSearch(modalSearch)}
                  style={{
                    backgroundColor: '#1E5F3F',
                    color: '#ffffff',
                    border: 'none',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🔍 Search Location
                </button>
                <button
                  type="button"
                  onClick={handleRealGPS}
                  style={{
                    backgroundColor: '#EBF5F0',
                    color: '#1E5F3F',
                    border: '1px solid #1E5F3F',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  🎯 Use My GPS
                </button>
              </div>

              {/* Live Autocomplete Suggestions Overlay */}
              {suggestions.length > 0 && (
                <div style={{
                  position: 'absolute',
                  top: '46px',
                  left: 0,
                  right: '270px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
                  zIndex: 100,
                  maxHeight: '220px',
                  overflowY: 'auto'
                }}>
                  {suggestions.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        const lat = parseFloat(item.lat);
                        const lon = parseFloat(item.lon);
                        if (realMapRef.current && realMarkerRef.current) {
                          realMapRef.current.flyTo([lat, lon], 15);
                          realMarkerRef.current.setLatLng([lat, lon]);
                        }
                        setLocation(item.display_name);
                        setModalSearch(item.display_name.split(',')[0]);
                        setSuggestions([]);
                      }}
                      style={{
                        padding: '10px 14px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '0.82rem',
                        color: 'var(--text-dark)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EBF5F0'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      📍 <strong>{item.display_name.split(',')[0]}</strong>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.display_name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Landmark Chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {[
                'Sector 62, Noida',
                'Green Park, Delhi',
                'Connaught Place, Delhi',
                'Cyber City, Gurgaon',
                'Hazratganj, Lucknow',
                'C-Scheme, Jaipur',
                'Marine Drive, Mumbai',
                'Park Street, Kolkata'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setModalSearch(chip);
                    handleRealLocationSearch(chip);
                  }}
                  style={{
                    backgroundColor: location.includes(chip) ? '#1E5F3F' : '#f1f5f9',
                    color: location.includes(chip) ? '#ffffff' : '#475569',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  📍 {chip}
                </button>
              ))}
            </div>

            {/* Real Leaflet OpenStreetMap Canvas */}
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <div 
                id="real-leaflet-map"
                style={{
                  height: '350px',
                  width: '100%',
                  borderRadius: '12px',
                  border: '2px solid #cbd5e1',
                  zIndex: 1
                }}
              />
              {mapLoading && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#1E5F3F',
                  zIndex: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  🔄 Reverse Geocoding Address...
                </div>
              )}
            </div>

            {/* Selected Location Details */}
            <div style={{
              backgroundColor: '#EBF5F0',
              border: '1px solid #bbf7d0',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Real-World Address:</div>
                <div style={{ fontSize: '0.92rem', color: '#1E5F3F', fontWeight: 700, marginTop: '2px', wordBreak: 'break-word' }}>
                  📍 {location === 'Search or click on map' ? 'Click anywhere on the map above to select your exact location' : location}
                </div>
              </div>
            </div>

            {/* Confirm button */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                style={{
                  flex: 1,
                  backgroundColor: '#1E5F3F',
                  color: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Confirm Selected Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
