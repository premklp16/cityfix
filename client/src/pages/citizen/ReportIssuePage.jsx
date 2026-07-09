import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaListUl, FaChartPie, FaHistory } from 'react-icons/fa';
import {
  FaPen,
  FaLayerGroup,
  FaLocationDot,
  FaCamera,
  FaCircleCheck,
  FaArrowRight,
  FaXmark,
  FaTriangleExclamation,
} from 'react-icons/fa6';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal from '../../components/common/Modal';
import ImageUpload from '../../components/common/ImageUpload';
import MapPicker from '../../components/map/MapPicker';
import { createReport } from '../../api/reportApi';
import { CATEGORIES, CATEGORY_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

/* ── Category metadata ── */
const CATEGORY_META = {
  'Road Damage':           { icon: '🛣️', color: CATEGORY_COLORS['Road Damage'] },
  'Street Light':          { icon: '💡', color: CATEGORY_COLORS['Street Light'] },
  'Water Leakage':         { icon: '🚰', color: CATEGORY_COLORS['Water Leakage'] },
  'Garbage':               { icon: '🗑️', color: CATEGORY_COLORS['Garbage'] },
  'Drainage':              { icon: '🌊', color: CATEGORY_COLORS['Drainage'] },
  'Traffic Signal':        { icon: '🚦', color: CATEGORY_COLORS['Traffic Signal'] },
  'Public Property Damage': { icon: '🏢', color: CATEGORY_COLORS['Public Property Damage'] },
  'Other':                 { icon: '❓', color: CATEGORY_COLORS['Other'] },
};

const SEVERITY_META = [
  { value: 'Low',      emoji: '🟢', color: '#10b981', bg: '#ecfdf5' },
  { value: 'Medium',   emoji: '🟡', color: '#f59e0b', bg: '#fffbeb' },
  { value: 'High',     emoji: '🟠', color: '#f97316', bg: '#fff7ed' },
  { value: 'Critical', emoji: '🔴', color: '#ef4444', bg: '#fef2f2' },
];

const MAX_DESCRIPTION = 2000;

/* ── Main Component ── */
const ReportIssuePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    severity: 'Medium',
    location: 'Tiruchirappalli, Tamil Nadu',
  });
  const [coordinates, setCoordinates] = useState({
    lat: 10.7905,
    lng: 78.7047,
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [duplicateModal, setDuplicateModal] = useState({ open: false, reports: [] });
  const descRef = useRef(null);

  /* Auto-resize textarea */
  useEffect(() => {
    const el = descRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
    }
  }, [formData.description]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCategorySelect = (cat) => {
    setFormData((prev) => ({ ...prev, category: cat }));
  };

  const handleSeveritySelect = (sev) => {
    setFormData((prev) => ({ ...prev, severity: sev }));
  };

  const handleLocationSelect = (pos) => {
    setCoordinates(pos);
  };

  const handleAddressResolved = (address) => {
    setFormData((prev) => ({ ...prev, location: address }));
  };

  /* ── Inline validation ── */
  const validateField = (name) => {
    const val = formData[name];
    const newErrors = { ...errors };

    switch (name) {
      case 'title':
        if (!val || !val.trim()) newErrors.title = 'Title is required';
        else if (val.trim().length < 5) newErrors.title = 'Title must be at least 5 characters';
        else delete newErrors.title;
        break;
      case 'description':
        if (!val || !val.trim()) newErrors.description = 'Description is required';
        else if (val.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
        else delete newErrors.description;
        break;
      case 'location':
        if (!val || !val.trim()) newErrors.location = 'Location address is required';
        else delete newErrors.location;
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  /* ── Build FormData helper ── */
  const buildFormData = (force = false) => {
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('severity', formData.severity);
    data.append('location', formData.location);
    data.append('lat', coordinates.lat);
    data.append('lng', coordinates.lng);
    if (force) data.append('force', 'true');

    images.forEach((image) => {
      data.append('images', image);
    });
    return data;
  };

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coordinates) {
      toast.error('Please select a location on the map');
      return;
    }

    if (!formData.location.trim()) {
      toast.error('Please provide a descriptive location address');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please provide a title for the issue');
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 10) {
      toast.error('Description must be at least 10 characters');
      return;
    }

    try {
      setLoading(true);
      await createReport(buildFormData(false));
      toast.success('Issue reported successfully!');
      navigate('/my-complaints');
    } catch (error) {
      // Handle duplicate detection (409 Conflict)
      if (error.response?.status === 409 && error.response?.data?.duplicateReports) {
        setDuplicateModal({
          open: true,
          reports: error.response.data.duplicateReports,
        });
      } else {
        toast.error(error.extractedMessage || 'Failed to report issue');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── Force-submit after duplicate warning ── */
  const handleForceSubmit = async () => {
    setDuplicateModal({ open: false, reports: [] });
    try {
      setLoading(true);
      await createReport(buildFormData(true));
      toast.success('Issue reported successfully!');
      navigate('/my-complaints');
    } catch (error) {
      toast.error(error.extractedMessage || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  /* ── Completion progress ── */
  const completion = useMemo(() => {
    let filled = 0;
    const total = 5;
    if (formData.title.trim()) filled++;
    if (formData.category) filled++;
    if (formData.description.trim().length >= 10) filled++;
    if (coordinates) filled++;
    if (formData.location.trim()) filled++;
    return Math.round((filled / total) * 100);
  }, [formData, coordinates]);

  /* ── Sidebar items (unchanged) ── */
  const sidebarItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <FaChartPie /> },
    { label: 'Report Issue', path: '/report', icon: <FaPlus /> },
    { label: 'My Complaints', path: '/my-complaints', icon: <FaListUl /> },
    { label: 'My Resolved Issues', path: '/my-history', icon: <FaHistory /> },
  ];

  return (
    <DashboardLayout sidebarItems={sidebarItems}>
      <div className="max-w-6xl mx-auto">
        {/* ─── Page Header ─── */}
        <div className="report-page-header mb-8">
          <div className="relative z-10">
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Report a Civic Issue
            </h1>
            <p className="text-blue-100 mt-2 text-sm md:text-base max-w-xl leading-relaxed">
              Your reports help improve the community. Provide clear details so
              authorities can respond quickly and resolve issues efficiently.
            </p>
          </div>
        </div>

        {/* ─── Two-column layout ─── */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
            {/* ═══ LEFT COLUMN — Form Sections ═══ */}
            <div className="space-y-6">
              {/* ── Section 1: Issue Details ── */}
              <div className="section-card delay-1">
                <div className="section-label">
                  <FaPen className="text-primary-400" />
                  <span>Step 1</span>
                </div>
                <h2 className="section-title">Issue Details</h2>

                {/* Title */}
                <div className="mb-5">
                  <label
                    htmlFor="report-title"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Issue Title <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <FaPen className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="report-title"
                      name="title"
                      type="text"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={() => validateField('title')}
                      placeholder="E.g., Large pothole on Main St."
                      required
                      maxLength={200}
                      className={`input pl-11 ${errors.title ? 'border-danger-400 ring-2 ring-danger-100' : ''}`}
                    />
                    <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs text-slate-400 font-medium">
                      {formData.title.length}/200
                    </span>
                  </div>
                  {errors.title && (
                    <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                      <FaXmark className="w-3 h-3" /> {errors.title}
                    </p>
                  )}
                </div>

                {/* Category Cards */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Category <span className="text-danger-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {CATEGORIES.map((cat) => {
                      const meta = CATEGORY_META[cat] || { icon: '❓', color: '#64748b' };
                      const isSelected = formData.category === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategorySelect(cat)}
                          className={`category-card ${isSelected ? 'category-card--selected' : ''}`}
                          style={
                            isSelected
                              ? {
                                  borderColor: meta.color,
                                  backgroundColor: `${meta.color}08`,
                                  color: meta.color,
                                }
                              : {}
                          }
                        >
                          <span className="cat-icon">{meta.icon}</span>
                          <span className="cat-label">{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Severity Pills */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Severity <span className="text-danger-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {SEVERITY_META.map((sev) => {
                      const isSelected = formData.severity === sev.value;
                      return (
                        <button
                          key={sev.value}
                          type="button"
                          onClick={() => handleSeveritySelect(sev.value)}
                          className={`severity-pill ${isSelected ? 'severity-pill--selected' : ''}`}
                          style={
                            isSelected
                              ? {
                                  backgroundColor: sev.color,
                                  boxShadow: `0 4px 16px ${sev.color}35`,
                                }
                              : {}
                          }
                        >
                          <span>{sev.emoji}</span>
                          <span>{sev.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="report-description"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Description <span className="text-danger-500">*</span>
                  </label>
                  <textarea
                    ref={descRef}
                    id="report-description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={() => validateField('description')}
                    className={`input textarea-auto w-full ${errors.description ? 'border-danger-400 ring-2 ring-danger-100' : ''}`}
                    placeholder="Describe the issue in detail — what you observed, the exact spot, how severe the problem looks, and any other information that could help resolve it faster..."
                    required
                    minLength={10}
                    maxLength={MAX_DESCRIPTION}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    <div>
                      {errors.description ? (
                        <p className="text-xs text-danger-600 flex items-center gap-1">
                          <FaXmark className="w-3 h-3" /> {errors.description}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Tip: Include the exact location, time of day, and how the issue affects daily life.
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-xs font-medium tabular-nums ${
                        formData.description.length > MAX_DESCRIPTION * 0.9
                          ? 'text-danger-500'
                          : 'text-slate-400'
                      }`}
                    >
                      {formData.description.length}/{MAX_DESCRIPTION}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Location ── */}
              <div className="section-card delay-2">
                <div className="section-label">
                  <FaLocationDot className="text-primary-400" />
                  <span>Step 2</span>
                </div>
                <h2 className="section-title">Location</h2>

                <div className="mb-4">
                  <MapPicker
                    initialPosition={coordinates}
                    onLocationSelect={handleLocationSelect}
                    onAddressResolved={handleAddressResolved}
                  />
                </div>

                {/* Coordinates display */}
                {coordinates && (
                  <div className="flex items-center gap-2 mb-4 px-1">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <FaLocationDot className="w-3 h-3" />
                    </span>
                    <span className="text-xs text-slate-500 font-medium tabular-nums">
                      {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                    </span>
                  </div>
                )}

                {/* Location address input */}
                <div>
                  <label
                    htmlFor="report-location"
                    className="block text-sm font-semibold text-slate-700 mb-2"
                  >
                    Address / Description <span className="text-danger-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <FaLocationDot className="w-3.5 h-3.5" />
                    </div>
                    <input
                      id="report-location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={() => validateField('location')}
                      placeholder="E.g., Near Central Park entrance, 5th Ave."
                      required
                      className={`input pl-11 ${errors.location ? 'border-danger-400 ring-2 ring-danger-100' : ''}`}
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1.5 text-xs text-danger-600 flex items-center gap-1">
                      <FaXmark className="w-3 h-3" /> {errors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Section 3: Upload Evidence ── */}
              <div className="section-card delay-3">
                <div className="section-label">
                  <FaCamera className="text-primary-400" />
                  <span>Step 3</span>
                </div>
                <h2 className="section-title">Upload Evidence</h2>
                <p className="text-sm text-slate-500 mb-4 -mt-2">
                  Adding photos helps authorities understand and resolve the issue faster.
                  Supports JPEG, PNG, WEBP up to 5 MB each.
                </p>
                <ImageUpload images={images} onChange={setImages} maxFiles={3} />
              </div>

              {/* ── Submit Area ── */}
              <div className="section-card delay-4">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="submit-btn-report"
                  >
                    {loading ? (
                      <>
                        <span className="spinner h-5 w-5 border-white/30 border-t-white" />
                        <span>Submitting…</span>
                      </>
                    ) : (
                      <>
                        <FaCircleCheck className="w-5 h-5" />
                        <span>Submit Report</span>
                        <FaArrowRight className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            {/* ═══ RIGHT COLUMN — Review Summary ═══ */}
            <div className="hidden lg:block">
              <div className="review-summary">
                <h3 className="text-sm font-bold text-slate-900 mb-4">Review Summary</h3>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500">Completion</span>
                    <span className="text-xs font-bold text-primary-600">{completion}%</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-4" />

                {/* Checklist */}
                <div className="space-y-0.5 mb-5">
                  <ChecklistItem label="Issue title" done={!!formData.title.trim()} />
                  <ChecklistItem label="Category selected" done={!!formData.category} />
                  <ChecklistItem label="Severity chosen" done={!!formData.severity} />
                  <ChecklistItem
                    label="Description (10+ chars)"
                    done={formData.description.trim().length >= 10}
                  />
                  <ChecklistItem label="Location pinned" done={!!coordinates} />
                  <ChecklistItem label="Address provided" done={!!formData.location.trim()} />
                </div>

                <div className="h-px bg-slate-100 my-4" />

                {/* Selected details */}
                <div className="space-y-3">
                  {/* Category */}
                  <div>
                    <span className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-wide">
                      Category
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-lg">
                        {(CATEGORY_META[formData.category] || {}).icon || '❓'}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {formData.category}
                      </span>
                    </div>
                  </div>

                  {/* Severity */}
                  <div>
                    <span className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-wide">
                      Severity
                    </span>
                    <div className="mt-1">
                      {(() => {
                        const sev = SEVERITY_META.find((s) => s.value === formData.severity);
                        return sev ? (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                            style={{ backgroundColor: sev.bg, color: sev.color }}
                          >
                            {sev.emoji} {sev.value}
                          </span>
                        ) : null;
                      })()}
                    </div>
                  </div>

                  {/* Location */}
                  {coordinates && (
                    <div>
                      <span className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-wide">
                        Location
                      </span>
                      <p className="mt-1 text-xs text-slate-600 font-medium tabular-nums">
                        {coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)}
                      </p>
                      {formData.location.trim() && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {formData.location}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Images */}
                  <div>
                    <span className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-wide">
                      Evidence
                    </span>
                    <p className="mt-1 text-xs text-slate-600 font-medium">
                      {images.length === 0
                        ? 'No photos uploaded'
                        : `${images.length} photo${images.length > 1 ? 's' : ''} attached`}
                    </p>
                    {images.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {images.slice(0, 3).map((img, idx) => (
                          <div
                            key={idx}
                            className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200"
                          >
                            <img
                              src={typeof img === 'string' ? img : URL.createObjectURL(img)}
                              alt={`Preview ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Description length */}
                  <div>
                    <span className="text-[0.6875rem] font-semibold text-slate-400 uppercase tracking-wide">
                      Description
                    </span>
                    <p className="mt-1 text-xs text-slate-600 font-medium">
                      {formData.description.length} / {MAX_DESCRIPTION} characters
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ─── Duplicate Warning Modal ─── */}
      <Modal
        isOpen={duplicateModal.open}
        onClose={() => setDuplicateModal({ open: false, reports: [] })}
        title="Potential Duplicates Found"
        size="md"
      >
        <div className="p-1">
          <div className="flex items-start gap-3 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200">
            <FaTriangleExclamation className="text-amber-500 mt-0.5 flex-shrink-0 text-lg" />
            <p className="text-sm text-amber-800">
              We found existing reports in the same area and category. Please review
              them to avoid submitting a duplicate.
            </p>
          </div>

          <div className="space-y-2.5 mb-5 max-h-60 overflow-y-auto">
            {duplicateModal.reports.map((report, idx) => (
              <div
                key={report._id || idx}
                className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {report.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {report.location}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold bg-primary-100 text-primary-700">
                      {report.status}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6875rem] font-semibold bg-slate-100 text-slate-600">
                      {report.severity}
                    </span>
                    {report.createdAt && (
                      <span className="text-[0.625rem] text-slate-400">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleForceSubmit}
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 text-white font-semibold text-sm hover:bg-amber-600 transition-colors disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="spinner h-4 w-4 border-white/30 border-t-white" />
                  Submitting…
                </>
              ) : (
                'Submit Anyway'
              )}
            </button>
            <button
              type="button"
              onClick={() => setDuplicateModal({ open: false, reports: [] })}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

/* ── Checklist Item Sub-component ── */
const ChecklistItem = ({ label, done }) => (
  <div className={`checklist-item ${done ? 'checklist-item--done' : ''}`}>
    <span className={`check-icon ${done ? 'check-icon--filled' : 'check-icon--empty'}`}>
      {done && '✓'}
    </span>
    <span>{label}</span>
  </div>
);

export default ReportIssuePage;
