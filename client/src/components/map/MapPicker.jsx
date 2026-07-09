import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaLocationCrosshairs } from 'react-icons/fa6';
import toast from 'react-hot-toast';

// Fix for default Leaflet markers in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const createPickerIcon = () => L.divIcon({
  html: `
    <div style="width:2.25rem; height:2.25rem; border-radius:50%; background:linear-gradient(135deg,#2563eb,#3b82f6); border: 3px solid #ffffff; box-shadow:0 6px 20px rgba(37,99,235,0.35); display:flex; align-items:center; justify-content:center; color:#ffffff; font-size:1rem; font-weight:700;">
      ●
    </div>
    <div style="width:0; height:0; border-left:0.55rem solid transparent; border-right:0.55rem solid transparent; border-top:1rem solid #2563eb; margin:0 auto; transform:translateY(-0.15rem); filter:drop-shadow(0 3px 4px rgba(37,99,235,0.25));"></div>
  `,
  className: 'cityfix-picker-icon',
  iconSize: [36, 46],
  iconAnchor: [18, 46],
});

const LocationMarker = ({ position, setPosition, onLocationSelect, onAddressResolved }) => {
  const markerRef = useRef(null);

  const map = useMapEvents({
    click(e) {
      const newPos = { lat: e.latlng.lat, lng: e.latlng.lng };
      setPosition(newPos);
      if (onLocationSelect) onLocationSelect(newPos);
      reverseGeocode(newPos);
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], map.getZoom(), { duration: 0.8 });
    }
  }, [position, map]);

  const reverseGeocode = async (pos) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.lat}&lon=${pos.lng}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data.display_name && onAddressResolved) {
        onAddressResolved(data.display_name);
      }
    } catch {
      // Silently fail - address is optional enhancement
    }
  };

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const latlng = marker.getLatLng();
      const newPos = { lat: latlng.lat, lng: latlng.lng };
      setPosition(newPos);
      if (onLocationSelect) onLocationSelect(newPos);
      reverseGeocode(newPos);
    }
  };

  return position === null ? null : (
    <Marker
      ref={markerRef}
      position={[position.lat, position.lng]}
      icon={createPickerIcon()}
      draggable={true}
      eventHandlers={{ dragend: handleDragEnd }}
    />
  );
};

const MapPicker = ({ initialPosition, onLocationSelect, onAddressResolved, height = '400px' }) => {
  const [position, setPosition] = useState(initialPosition || null);
  const [locating, setLocating] = useState(false);
  const defaultCenter = [10.7905, 78.7047];

  useEffect(() => {
    if (initialPosition && (!position || initialPosition.lat !== position.lat || initialPosition.lng !== position.lng)) {
      setPosition(initialPosition);
    }
  }, [initialPosition, position]);

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPosition(newPos);
        if (onLocationSelect) onLocationSelect(newPos);
        // Reverse geocode the current location
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPos.lat}&lon=${newPos.lng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
          .then(r => r.json())
          .then(data => {
            if (data.display_name && onAddressResolved) {
              onAddressResolved(data.display_name);
            }
          })
          .catch(() => {});
        setLocating(false);
        toast.success('Location detected!');
      },
      (err) => {
        console.error('Error getting location:', err);
        toast.error('Could not get your current location. Please ensure location services are enabled.');
        setLocating(false);
      }
    );
  };

  const locationLabel = useMemo(() => {
    if (!position) return 'Click anywhere on the map to pin a location';
    return `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;
  }, [position]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200/60 shadow-sm" style={{ height }}>
      <MapContainer
        center={position ? [position.lat, position.lng] : defaultCenter}
        zoom={position ? 13 : 12}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> contributors &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <LocationMarker
          position={position}
          setPosition={setPosition}
          onLocationSelect={onLocationSelect}
          onAddressResolved={onAddressResolved}
        />
      </MapContainer>

      {/* Location info overlay */}
      <div className="absolute left-3 bottom-3 z-30 map-location-badge">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
          </span>
          <div>
            <p className="text-[0.6875rem] font-semibold text-slate-800">
              {position ? 'Pinned Location' : 'Select Location'}
            </p>
            <p className="text-[0.625rem] text-slate-500 font-medium">{locationLabel}</p>
          </div>
        </div>
      </div>

      {/* Current location button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={locating}
        className="absolute top-3 right-3 z-30 map-current-loc-btn"
      >
        <FaLocationCrosshairs className={locating ? 'animate-spin' : ''} />
        {locating ? 'Locating…' : 'My Location'}
      </button>
    </div>
  );
};

export default MapPicker;
