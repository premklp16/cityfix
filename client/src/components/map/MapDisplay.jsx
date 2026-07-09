import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import 'leaflet.heat';
import { CATEGORY_COLORS } from '../../utils/constants';

const SEVERITY_COLORS = {
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#ef4444',
  Critical: '#7c2d12'
};

const DEFAULT_PIN_COLOR = '#64748b';

const createMarkerIcon = (report) => {
  const categoryColor = CATEGORY_COLORS[report.category] || DEFAULT_PIN_COLOR;
  const severityColor = SEVERITY_COLORS[report.severity] || categoryColor;

  const html = `
    <div style="display:flex; align-items:center; justify-content:center; width:2.4rem; height:2.4rem; border-radius:50%; background: radial-gradient(circle at 35% 35%, ${severityColor} 0%, ${categoryColor} 60%); box-shadow: 0 10px 22px rgba(15,23,42,0.18); border: 2px solid #ffffff; color: #ffffff; font-size: 0.9rem; font-weight: 700; text-align: center;">
      ${report.severity?.charAt(0) || '!' }
    </div>
    <div style="width:0; height:0; border-left:0.65rem solid transparent; border-right:0.65rem solid transparent; border-top:1rem solid ${categoryColor}; margin:0 auto; transform: translateY(-0.2rem);"></div>
  `;

  return L.divIcon({
    html,
    className: 'cityfix-marker-icon',
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -36],
  });
};

const generatePopupHtml = (report) => {
  const imageUrl = report.images?.[0] || '';
  const safeTitle = String(report.title || 'Issue').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `
    <div style="min-width:220px; font-family:system-ui, sans-serif; color:#0f172a;">
      ${imageUrl ? `<div style="margin-bottom:0.75rem;"><img src="${imageUrl}" alt="${safeTitle}" style="width:100%; height:120px; object-fit:cover; border-radius:0.75rem;" /></div>` : ''}
      <div style="margin-bottom:0.5rem;"><strong style="display:block; font-size:0.95rem; line-height:1.2;">${safeTitle}</strong>
      <span style="display:block; font-size:0.8rem; color:#475569; margin-top:0.25rem;">${report.category} · ${report.location || 'Unknown location'}</span></div>
      <div style="display:flex; flex-wrap:wrap; gap:0.35rem; margin-bottom:0.75rem;">
        <span style="background:#eef2ff; color:#3730a3; border-radius:999px; padding:0.35rem 0.65rem; font-size:0.72rem;">${report.severity}</span>
        <span style="background:#f8fafc; color:#334155; border-radius:999px; padding:0.35rem 0.65rem; font-size:0.72rem;">${report.status}</span>
      </div>
      <a href="/complaints/${report._id}" style="display:inline-flex; width:100%; justify-content:center; text-decoration:none; background:#0284c7; color:#ffffff; border-radius:0.75rem; padding:0.7rem 0.8rem; font-size:0.88rem; font-weight:600;">View details</a>
    </div>
  `;
};

const clusterOptions = {
  chunkedLoading: true,
  maxClusterRadius: 60,
  showCoverageOnHover: false,
  spiderfyOnMaxZoom: true,
  disableClusteringAtZoom: 15,
};

const MapController = ({ reports, center }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (center?.lat && center?.lng) {
      map.setView([center.lat, center.lng], 13);
    } else if (reports.length > 1) {
      const bounds = L.latLngBounds(
        reports.map((report) => [report.coordinates.coordinates[1], report.coordinates.coordinates[0]])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (reports.length === 1) {
      const [lng, lat] = reports[0].coordinates.coordinates;
      map.setView([lat, lng], 13);
    }
  }, [map, reports, center]);

  return null;
};

const ClusterLayer = ({ reports }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const clusterGroup = L.markerClusterGroup(clusterOptions);

    reports.forEach((report) => {
      if (!report?.coordinates?.coordinates) return;
      const [lng, lat] = report.coordinates.coordinates;
      const marker = L.marker([lat, lng], { icon: createMarkerIcon(report) });
      marker.bindPopup(generatePopupHtml(report), { minWidth: 220, maxWidth: 300 });
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, reports]);

  return null;
};

const HeatmapLayer = ({ reports }) => {
  const map = useMap();
  const points = useMemo(() => {
    return reports
      .filter((report) => report?.coordinates?.coordinates)
      .map((report) => {
        const [lng, lat] = report.coordinates.coordinates;
        const intensity = report.severity === 'Critical'
          ? 0.85
          : report.severity === 'High'
            ? 0.65
            : report.severity === 'Medium'
              ? 0.45
              : 0.25;
        return [lat, lng, intensity];
      });
  }, [reports]);

  useEffect(() => {
    if (!map || points.length < 3) return;
    const heatLayer = L.heatLayer(points, {
      radius: 40,
      blur: 30,
      maxZoom: 16,
      max: 0.95,
      gradient: { 0.15: '#93c5fd', 0.35: '#facc15', 0.65: '#fb7185', 1: '#9333ea' }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
};

const buildSeveritySummary = (reports) => {
  return reports.reduce((summary, report) => {
    if (!report?.severity) return summary;
    summary[report.severity] = (summary[report.severity] || 0) + 1;
    return summary;
  }, {});
};

const MapDisplay = ({ reports = [], center, height = '400px', showLegend = true, showOverview = true }) => {
  // Debug log to verify reports received by the map (remove in production)
  try {
    // only log a compact summary to avoid huge console output
    // eslint-disable-next-line no-console
    console.log('MapDisplay received reports:', reports.map(r => ({ id: r._id, category: r.category, coords: r.coordinates && r.coordinates.coordinates })));
  } catch (e) {
    // noop
  }

  const validReports = reports.filter((report) => report?.coordinates?.coordinates);
  const defaultCenter = center || (validReports[0]
    ? { lat: validReports[0].coordinates.coordinates[1], lng: validReports[0].coordinates.coordinates[0] }
    : { lat: 20.5937, lng: 78.9629 });

  const severitySummary = buildSeveritySummary(validReports);

  const [showHeat, setShowHeat] = useState(true);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 shadow-lg" style={{ height }}>
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={validReports.length > 0 ? 13 : 5}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> contributors &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapController reports={validReports} center={center} />
        {validReports.length > 0 && <ClusterLayer reports={validReports} />}
        {validReports.length >= 3 && showHeat && <HeatmapLayer reports={validReports} />}
      </MapContainer>

      {showOverview && (
        <div className="absolute left-4 top-4 z-20 max-w-xs rounded-3xl border border-slate-200/70 bg-white/90 backdrop-blur-md p-4 shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500 uppercase tracking-[0.18em]">Map overview</p>
              <p className="text-lg font-semibold text-slate-900">{validReports.length} reports plotted</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => setShowHeat(s => !s)}
                className="mt-1 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {showHeat ? 'Heatmap: On' : 'Heatmap: Off'}
              </button>
            </div>
          </div>
          {Object.keys(severitySummary).length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {['Critical', 'High', 'Medium', 'Low'].map((level) => (
                severitySummary[level] ? (
                  <div key={level} className="rounded-2xl bg-slate-50 p-2">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{level}</p>
                    <p className="text-sm font-semibold text-slate-900">{severitySummary[level]}</p>
                  </div>
                ) : null
              ))}
            </div>
          )}
        </div>
      )}

      {showLegend && (
        <div className="absolute left-4 bottom-4 z-20 rounded-3xl border border-slate-200/70 bg-white/92 px-4 py-3 shadow-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Legend</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
              <span key={category} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                {category}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapDisplay;
