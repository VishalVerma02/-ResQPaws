import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Info, Compass } from 'lucide-react';

export default function RescueMap({ reports = [], isDarkMode }) {
  const [selectedCity, setSelectedCity] = useState('All');
  const mapRef = useRef(null);
  const markersGroupRef = useRef(null);

  // Helper to extract city name from location string
  const extractCity = (locationStr) => {
    if (!locationStr) return 'Other';
    const parts = locationStr.split(',');
    if (parts.length >= 2) {
      const city = parts[1].trim().toLowerCase();
      if (city.includes('noida')) return 'Noida';
      if (city.includes('delhi')) return 'Delhi';
      if (city.includes('jaipur')) return 'Jaipur';
      if (city.includes('lucknow')) return 'Lucknow';
      return parts[1].trim();
    }
    const locLower = locationStr.toLowerCase();
    if (locLower.includes('noida')) return 'Noida';
    if (locLower.includes('delhi')) return 'Delhi';
    if (locLower.includes('jaipur')) return 'Jaipur';
    if (locLower.includes('lucknow')) return 'Lucknow';
    return 'Delhi'; // default fallback city
  };

  // Coordinates mapping for quick panning
  const cityCoordinates = {
    'Delhi': [28.6139, 77.2090],
    'Noida': [28.5706, 77.3272],
    'Jaipur': [26.9124, 75.7873],
    'Lucknow': [26.8467, 80.9462]
  };

  // Group stats by city
  const cityStats = { Delhi: 0, Noida: 0, Jaipur: 0, Lucknow: 0 };
  reports.forEach(r => {
    const city = extractCity(r.location);
    if (cityStats[city] !== undefined) {
      cityStats[city]++;
    } else {
      cityStats.Delhi++; // fallback group increment
    }
  });

  // Load Leaflet dynamically
  useEffect(() => {
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

  const renderMarkers = () => {
    if (!window.L || !mapRef.current || !markersGroupRef.current) return;
    
    // Clear old marker pins
    markersGroupRef.current.clearLayers();

    const filtered = reports.filter(r => {
      if (selectedCity === 'All') return true;
      const city = extractCity(r.location);
      return city.toLowerCase() === selectedCity.toLowerCase();
    });

    const markerPins = [];

    filtered.forEach(report => {
      let lat = report.latitude;
      let lng = report.longitude;

      // Fallback coordinates if report doesn't have lat/lng
      if (!lat || !lng) {
        const city = extractCity(report.location);
        const coords = cityCoordinates[city] || [28.6139, 77.2090];
        
        // Add tiny scatter to avoid overlapping pins
        const seed = report._id ? report._id.charCodeAt(report._id.length - 1) % 10 : 5;
        const scatter = (seed * 0.006) - 0.03;
        lat = coords[0] + scatter;
        lng = coords[1] + scatter;
      }

      // Pin color by priority
      let color = 'orange'; // fallback medium
      if (report.priority === 'high') color = 'red';
      else if (report.priority === 'low') color = 'green';

      const pinIcon = window.L.icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const popupHTML = `
        <div style="font-family: var(--font-sans); padding: 4px; min-width: 220px; text-align: left;">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <img src="${report.imageUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'}" 
                 style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;" 
                 onerror="this.src='https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400'"
            />
            <div>
              <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700; color: #1e293b;">${report.animalType}</h4>
              <span style="font-size: 0.72rem; color: #dc2626; font-weight: 600; text-transform: uppercase;">${report.condition}</span>
            </div>
          </div>
          <div style="font-size: 0.76rem; color: #475569; line-height: 1.4; margin-bottom: 8px; font-weight: 500;">
            📍 ${report.location}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 6px;">
            <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 12px; font-weight: 700; text-transform: capitalize; background-color: ${report.status === 'completed' ? '#dcfce7' : report.status === 'accepted' ? '#dbeafe' : '#fee2e2'}; color: ${report.status === 'completed' ? '#15803d' : report.status === 'accepted' ? '#1d4ed8' : '#b91c1c'};">
              Status: ${report.status}
            </span>
            <span style="font-size: 0.7rem; color: #64748b;">
              Priority: <strong style="color: ${report.priority === 'high' ? '#dc2626' : report.priority === 'medium' ? '#d97706' : '#16a34a'}; text-transform: capitalize;">${report.priority}</strong>
            </span>
          </div>
        </div>
      `;

      const marker = window.L.marker([lat, lng], { icon: pinIcon }).bindPopup(popupHTML);
      markersGroupRef.current.addLayer(marker);
      markerPins.push(marker);
    });

    if (markerPins.length > 0) {
      const group = new window.L.featureGroup(markerPins);
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  };

  const initMap = () => {
    if (!window.L) return;
    const canvas = document.getElementById('real-rescue-map-canvas');
    if (!canvas) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = window.L.map('real-rescue-map-canvas').setView([28.6139, 77.2090], 10);
    mapRef.current = map;

    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    markersGroupRef.current = window.L.layerGroup().addTo(map);
    renderMarkers();

    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  };

  // Re-initialize map if L changes or container rendered
  useEffect(() => {
    const timer = setTimeout(() => {
      initMap();
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Update markers when reports or selectedCity changes
  useEffect(() => {
    renderMarkers();
  }, [reports, selectedCity]);

  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
    if (!mapRef.current) return;

    if (cityName === 'All') {
      if (reports.length > 0) {
        renderMarkers();
      } else {
        mapRef.current.setView([28.6139, 77.2090], 10);
      }
    } else {
      const coords = cityCoordinates[cityName];
      if (coords) {
        mapRef.current.flyTo(coords, 12);
      }
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px', minHeight: '520px', alignItems: 'stretch' }}>
      
      {/* Sidebar Controls */}
      <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Live Rescue Map</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginTop: '4px' }}>Active incident monitoring regions</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          <button
            onClick={() => handleCityClick('All')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px',
              borderRadius: '8px',
              border: selectedCity === 'All' ? '2px solid #1E5F3F' : '1px solid var(--border-color)',
              backgroundColor: selectedCity === 'All' ? '#EBF5F0' : 'var(--white)',
              color: selectedCity === 'All' ? '#1E5F3F' : 'var(--text-dark)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            <span>🌍 All Cities</span>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
              {reports.length}
            </span>
          </button>

          {Object.keys(cityCoordinates).map(cityName => {
            const count = cityStats[cityName] || 0;
            const isSelected = selectedCity === cityName;
            return (
              <button
                key={cityName}
                onClick={() => handleCityClick(cityName)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px',
                  borderRadius: '8px',
                  border: isSelected ? '2px solid #1E5F3F' : '1px solid var(--border-color)',
                  backgroundColor: isSelected ? '#EBF5F0' : 'var(--white)',
                  color: isSelected ? '#1E5F3F' : 'var(--text-dark)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                <span>📍 {cityName}</span>
                <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(0,0,0,0.05)', padding: '2px 8px', borderRadius: '10px' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ backgroundColor: 'var(--light-gray)', padding: '12px', borderRadius: '8px', fontSize: '0.78rem', color: 'var(--text-light)' }}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontWeight: 600, color: 'var(--text-medium)', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.9rem' }}>ℹ️</span> Map Legend
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626', display: 'inline-block' }} /> 
              <span>High Priority Case</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#d97706', display: 'inline-block' }} /> 
              <span>Medium Priority Case</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} /> 
              <span>Low Priority Case</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Board */}
      <div className="card" style={{ position: 'relative', overflow: 'hidden', minHeight: '450px', padding: 0 }}>
        <div id="real-rescue-map-canvas" style={{ width: '100%', height: '100%', minHeight: '450px', zIndex: 1 }} />
      </div>

    </div>
  );
}
