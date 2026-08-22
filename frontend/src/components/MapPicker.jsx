import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons in Vite bundler
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Default fallback coordinates (e.g. San Francisco / Central Emergency Hub)
const DEFAULT_LAT = 37.7749;
const DEFAULT_LNG = -122.4194;

export default function MapPicker({ location, onChange }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geoError, setGeoError] = useState('');

  const currentLat = location?.latitude ?? DEFAULT_LAT;
  const currentLng = location?.longitude ?? DEFAULT_LNG;

  /**
   * Reverse Geocoding helper via OpenStreetMap Nominatim API
   */
  const reverseGeocode = async (lat, lng) => {
    setIsGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'CrisisConnect-AI-EmergencyApp/1.0',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          return data.display_name;
        }
      }
    } catch {
      // Graceful fallback if reverse geocoding fails
    } finally {
      setIsGeocoding(false);
    }
    return `Location coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  /**
   * Handle map click or marker move
   */
  const handleLocationUpdate = async (lat, lng) => {
    const roundedLat = parseFloat(lat.toFixed(6));
    const roundedLng = parseFloat(lng.toFixed(6));

    // Instant update with existing address or loading placeholder
    onChange({
      ...location,
      latitude: roundedLat,
      longitude: roundedLng,
    });

    // Fetch readable address asynchronously
    const fetchedAddress = await reverseGeocode(roundedLat, roundedLng);
    onChange({
      address: fetchedAddress,
      latitude: roundedLat,
      longitude: roundedLng,
    });
  };

  // Initialize Leaflet Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [currentLat, currentLng],
        zoom: 13,
        zoomControl: true,
      });

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Create draggable marker
      const marker = L.marker([currentLat, currentLng], { draggable: true }).addTo(map);

      // Handle marker dragend
      marker.on('dragend', (e) => {
        const position = e.target.getLatLng();
        handleLocationUpdate(position.lat, position.lng);
      });

      // Handle map click
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleLocationUpdate(lat, lng);
      });

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when location prop changes externally (e.g. Geolocation click)
  useEffect(() => {
    if (mapInstanceRef.current && markerInstanceRef.current) {
      markerInstanceRef.current.setLatLng([currentLat, currentLng]);
      mapInstanceRef.current.setView([currentLat, currentLng], 14, { animate: true });
    }
  }, [currentLat, currentLng]);

  /**
   * Browser Geolocation API helper
   */
  const handleUseCurrentLocation = () => {
    setGeoError('');
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsGeolocating(false);
        const { latitude, longitude } = position.coords;
        handleLocationUpdate(latitude, longitude);
      },
      (error) => {
        setIsGeolocating(false);
        setGeoError(`Unable to retrieve location: ${error.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <div className="space-y-3">
      {/* Action Header & Locate Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">
          Select Incident Location on Map <span className="text-red-400">*</span>
        </label>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={isGeolocating}
          className="self-start sm:self-auto px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--color-bg-surface)] text-[var(--color-sand)] border border-[var(--color-bg-border)] hover:border-[var(--color-sand)] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          {isGeolocating ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 border-[var(--color-sand)] border-t-transparent animate-spin"></div>
              Locating...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5 text-[var(--color-sand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Current GPS Location
            </>
          )}
        </button>
      </div>

      {geoError && (
        <p className="text-xs text-red-300 bg-red-950/40 p-2 rounded border border-red-800/60">
          {geoError}
        </p>
      )}

      {/* Leaflet Map Container */}
      <div className="relative w-full h-[290px] sm:h-[310px] rounded-xl overflow-hidden border border-[var(--color-bg-border)] shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div className="absolute bottom-2 left-2 z-[400] bg-[var(--color-bg-surface)]/95 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-[var(--color-text-secondary)] border border-[var(--color-bg-border)]">
          Click map or drag marker to set coordinates
        </div>
      </div>

      {/* Selected Coordinates & Address Preview */}
      <div className="p-3.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[var(--color-sand)]"></span>
            Selected Coordinates
          </span>
          <span className="text-xs font-mono text-[var(--color-sand)] bg-[var(--color-sand)]/10 px-2 py-0.5 rounded border border-[var(--color-sand)]/30 font-semibold">
            Lat: {currentLat.toFixed(5)}, Lng: {currentLng.toFixed(5)}
          </span>
        </div>

        {/* Address Input field for optional user customization */}
        <div>
          <label htmlFor="location-address" className="text-[11px] text-[var(--color-text-secondary)] font-medium">
            Readable Location / Address {isGeocoding && <span className="text-xs text-[var(--color-sand)]">(resolving address...)</span>}
          </label>
          <input
            id="location-address"
            type="text"
            value={location?.address || ''}
            onChange={(e) => onChange({ ...location, address: e.target.value })}
            placeholder="Address or landmark description..."
            className="w-full mt-1 px-3 py-2 rounded-lg text-xs bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-sand)] transition-all"
          />
        </div>
      </div>
    </div>
  );
}
