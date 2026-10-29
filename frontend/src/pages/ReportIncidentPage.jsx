import { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createIncident, uploadEvidence } from '../services/incidentService.js';
import MapPicker from '../components/MapPicker.jsx';

const CATEGORIES = [
  'Accident',
  'Fire',
  'Medical Emergency',
  'Crime',
  'Natural Disaster',
  'Other',
];

const SEVERITIES = [
  { level: 'Low', color: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70', desc: 'Minor issue / non-life-threatening' },
  { level: 'Medium', color: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/70', desc: 'Moderate hazard / requires attention' },
  { level: 'High', color: 'bg-amber-950/60 text-amber-300 border-amber-800/70', desc: 'Serious situation / urgent response' },
  { level: 'Critical', color: 'bg-red-950/70 text-red-300 border-red-800/80 font-bold', desc: 'Life-threatening / immediate emergency' },
];

// CHO Syllabus Demonstration: Default parameters, for...of, push(), pop()
function prepareRecommendationsForDisplay(recommendations = [], maxLimit = 10) {
  const result = [];
  // for...of loop demonstration
  for (const item of recommendations) {
    if (typeof item === 'string' && item.trim().length > 0) {
      // push() demonstration
      result.push(item.trim());
    }
  }
  // pop() demonstration on a local working array copy
  const localCopy = [...result];
  if (localCopy.length > maxLimit) {
    localCopy.pop();
  }
  return result;
}

// Maximum file size: 10 MB (must match backend)
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
const ALLOWED_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

export default function ReportIncidentPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Accident',
    description: '',
    severity: 'Medium',
    location: {
      address: '',
      latitude: 37.7749,
      longitude: -122.4194,
    },
  });

  // ── Evidence Upload State ────────────────────────────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState([]);        // { file, preview, id } objects
  const [fileErrors, setFileErrors] = useState([]);              // validation error strings
  const [uploadProgress, setUploadProgress] = useState(null);   // 0-100 or null
  const [uploadedEvidence, setUploadedEvidence] = useState([]); // from API response
  const fileInputRef = useRef(null);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedIncident, setSubmittedIncident] = useState(null);

  // Field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  // ── Evidence file selection handler ──────────────────────────────────────────
  const handleFileSelect = useCallback((e) => {
    const incoming = Array.from(e.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const errors = [];
    const valid = [];

    incoming.forEach((file) => {
      const ext = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_TYPES.includes(file.type) || !ALLOWED_EXTS.includes(ext)) {
        errors.push(`"${file.name}" — invalid type. Allowed: JPEG, PNG, WebP, GIF, PDF.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`"${file.name}" — file too large (max ${MAX_FILE_SIZE_MB} MB).`);
        return;
      }
      valid.push(file);
    });

    setFileErrors(errors);
    setSelectedFiles((prev) => {
      const combined = [...prev, ...valid.map((file) => ({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      }))];
      // Enforce max files limit
      if (combined.length > MAX_FILES) {
        setFileErrors((e) => [...e, `Maximum ${MAX_FILES} files allowed. Extra files were dropped.`]);
        return combined.slice(0, MAX_FILES);
      }
      return combined;
    });
  }, []);

  // ── Remove a single selected file ────────────────────────────────────────────
  const handleRemoveFile = useCallback((fileId) => {
    setSelectedFiles((prev) => {
      const removed = prev.find((f) => f.id === fileId);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  // Location change handler from MapPicker
  const handleLocationChange = (newLocation) => {
    setFormData((prev) => ({ ...prev, location: newLocation }));
    if (fieldErrors.latitude || fieldErrors.longitude || fieldErrors.location) {
      setFieldErrors((prev) => ({ ...prev, latitude: '', longitude: '', location: '' }));
    }
  };

  // Client-side validation
  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Incident title is required';
    } else if (formData.title.trim().length < 3 || formData.title.trim().length > 100) {
      errors.title = 'Title must be between 3 and 100 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Detailed description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (formData.location.latitude === null || formData.location.latitude === undefined) {
      errors.location = 'Please select a location on the map';
    }

    return errors;
  };

  // Submit handler — 2-step: create incident, then upload evidence
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Step 1: Create the incident (JSON)
      const result = await createIncident(formData);
      if (!result.success || !result.incident) {
        setServerError(result.message || 'Failed to submit incident report.');
        return;
      }

      const createdIncident = result.incident;

      // Step 2: Upload evidence files if any were selected
      if (selectedFiles.length > 0) {
        setUploadProgress(0);
        try {
          const evidenceResult = await uploadEvidence(
            createdIncident.id,
            selectedFiles.map((f) => f.file),
            (pct) => setUploadProgress(pct)
          );
          if (evidenceResult.success) {
            setUploadedEvidence(evidenceResult.evidence || []);
          }
        } catch (uploadErr) {
          // Evidence upload failure is non-fatal — incident was created successfully
          console.warn('Evidence upload failed (non-fatal):', uploadErr.message);
          setServerError(
            `Incident reported successfully, but evidence upload failed: ${uploadErr.response?.data?.message || uploadErr.message}`
          );
        }
        setUploadProgress(null);
      }

      setSubmittedIncident(createdIncident);
    } catch (error) {
      if (error.response?.data?.errors) {
        setFieldErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError(error.message || 'An unexpected error occurred.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to report another incident
  const handleResetForm = () => {
    // Revoke any object URLs to avoid memory leaks
    selectedFiles.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setSubmittedIncident(null);
    setFormData({
      title: '',
      category: 'Accident',
      description: '',
      severity: 'Medium',
      location: {
        address: '',
        latitude: 37.7749,
        longitude: -122.4194,
      },
    });
    setFieldErrors({});
    setServerError('');
    setSelectedFiles([]);
    setFileErrors([]);
    setUploadProgress(null);
    setUploadedEvidence([]);
  };

  // Render Success Card State
  if (submittedIncident) {
    return (
      <main className="min-h-[calc(100vh-4rem)] w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        <div className="bg-[var(--color-bg-surface)] border border-emerald-800/60 rounded-xl p-6 sm:p-8 shadow-2xl space-y-6 text-center max-w-3xl mx-auto animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-600/60 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-bold">
            ✓
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
              Emergency Incident Reported
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              Your report has been received and stored in the CrisisConnect emergency system.
            </p>
          </div>

          {/* Reference Details */}
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] rounded-xl p-5 text-left space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--color-bg-border)]">
              <span className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">
                Incident Reference ID
              </span>
              <span className="font-mono text-base font-bold text-[var(--color-sand)] px-3 py-1 rounded bg-[var(--color-sand)]/10 border border-[var(--color-sand)]/30">
                {submittedIncident.incidentId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[var(--color-text-muted)] uppercase font-semibold block">Title</span>
                <span className="font-semibold text-sm text-[var(--color-text-primary)]">{submittedIncident.title}</span>
              </div>

              <div>
                <span className="text-[var(--color-text-muted)] uppercase font-semibold block">Selected Category</span>
                <span className="font-semibold text-sm text-[var(--color-text-primary)]">{submittedIncident.category}</span>
              </div>

              <div>
                <span className="text-[var(--color-text-muted)] uppercase font-semibold block">Severity</span>
                <span className="font-semibold text-sm capitalize text-[var(--color-text-primary)]">{submittedIncident.severity}</span>
              </div>

              <div>
                <span className="text-[var(--color-text-muted)] uppercase font-semibold block">Status</span>
                <span className="font-mono text-xs uppercase font-semibold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50 inline-block mt-0.5">
                  {submittedIncident.status}
                </span>
              </div>
            </div>

            {/* AI Emergency Analysis & Severity Box */}
            {submittedIncident.aiClassification && (
              <div className="bg-[var(--color-bg-surface)] border border-[var(--color-sand)]/40 rounded-xl p-4 space-y-3 mt-2">
                <div className="flex items-center justify-between border-b border-[var(--color-bg-border)] pb-2">
                  <span className="text-xs font-bold text-[var(--color-sand)] flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-[var(--color-sand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Incident & Severity Analysis
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[var(--color-sand)] bg-[var(--color-sand)]/10 px-2 py-0.5 rounded border border-[var(--color-sand)]/30">
                    Category: {Math.round((submittedIncident.aiClassification.confidence || 0) * 100)}% | Severity: {Math.round((submittedIncident.aiClassification.severityConfidence || 0) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-[var(--color-text-muted)] uppercase font-semibold text-[10px] block">
                      AI Predicted Category (vs Reported: {submittedIncident.category})
                    </span>
                    <span className="font-bold text-sm text-[var(--color-text-primary)]">
                      {submittedIncident.aiClassification.category}
                    </span>
                  </div>

                  <div>
                    <span className="text-[var(--color-text-muted)] uppercase font-semibold text-[10px] block">
                      AI Assessed Severity (vs Reported: {submittedIncident.severity})
                    </span>
                    <span className={`inline-block font-bold text-sm px-2.5 py-0.5 rounded border mt-0.5 ${submittedIncident.aiClassification.severity === 'Critical' ? 'bg-red-950/70 text-red-300 border-red-800' :
                        submittedIncident.aiClassification.severity === 'High' ? 'bg-amber-950/60 text-amber-300 border-amber-800' :
                          submittedIncident.aiClassification.severity === 'Medium' ? 'bg-yellow-950/60 text-yellow-300 border-yellow-800' :
                            'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      }`}>
                      {submittedIncident.aiClassification.severity || submittedIncident.severity} Priority
                    </span>
                  </div>
                </div>

                {submittedIncident.aiClassification.reasoning && (
                  <div className="pt-1">
                    <span className="text-[var(--color-text-muted)] uppercase font-semibold text-[10px] block">AI Reasoning & Assessment</span>
                    <p className="text-xs text-[var(--color-text-secondary)] italic bg-[var(--color-bg-elevated)] p-2.5 rounded-lg border border-[var(--color-bg-border)] mt-0.5">
                      "{submittedIncident.aiClassification.reasoning}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Feature 10: AI Safety Recommendations Box */}
            {submittedIncident.safetyRecommendations && (
              <div className="bg-[var(--color-bg-surface)] border border-amber-800/50 rounded-xl p-4 space-y-3 mt-2">
                <div className="flex items-center justify-between border-b border-[var(--color-bg-border)] pb-2">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Actionable Safety Recommendations
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-2 py-0.5 rounded bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)]">
                    {submittedIncident.safetyRecommendations.isFallback ? 'Deterministic Safety Guidance' : 'AI Safety Guidance'}
                  </span>
                </div>

                <ul className="space-y-1.5 text-xs text-[var(--color-text-primary)]">
                  {prepareRecommendationsForDisplay(submittedIncident.safetyRecommendations.recommendations).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-snug">{rec}</span>
                    </li>
                  ))}
                </ul>

                {submittedIncident.safetyRecommendations.warning && (
                  <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2.5 text-[11px] text-amber-200/95 flex items-start gap-2 mt-2">
                    <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{submittedIncident.safetyRecommendations.warning}</span>
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-[var(--color-bg-border)]">
              <span className="text-xs text-[var(--color-text-muted)] uppercase font-semibold block">Location</span>
              <p className="text-xs text-[var(--color-text-primary)] mt-0.5">{submittedIncident.location?.address}</p>
              <p className="text-[11px] font-mono text-[var(--color-sand)] mt-0.5">
                Coordinates: {submittedIncident.location?.latitude}, {submittedIncident.location?.longitude}
              </p>
            </div>

            {/* Uploaded Evidence Summary */}
            {uploadedEvidence.length > 0 && (
              <div className="pt-2 border-t border-[var(--color-bg-border)]">
                <span className="text-xs text-[var(--color-text-muted)] uppercase font-semibold block mb-2">Uploaded Evidence</span>
                <div className="flex flex-wrap gap-2">
                  {uploadedEvidence.map((ev, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[11px]">
                      <svg className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-[var(--color-text-primary)] truncate max-w-[160px]" title={ev.originalName}>{ev.originalName}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-emerald-400 mt-1.5">
                  ✓ {uploadedEvidence.length} file{uploadedEvidence.length !== 1 ? 's' : ''} uploaded and attached to this incident.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-bold bg-[var(--color-sand)] text-[#0c1612] hover:bg-[var(--color-primary-hover)] transition-all cursor-pointer shadow-sm"
            >
              Report Another Incident
            </button>
            <Link
              to="/my-reports"
              className="w-full sm:w-auto px-6 py-3 rounded-lg text-sm font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-sand)] border border-[var(--color-sand)]/40 hover:border-[var(--color-sand)] transition-all text-center"
            >
              View My Reports
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Render Full-Width Responsive Incident Form Page
  return (
    <main className="min-h-[calc(100vh-4rem)] w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-5 flex flex-col gap-4">
      {/* Header */}
      <div className="border-b border-[var(--color-bg-border)] pb-3">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 text-[var(--color-sand)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report Emergency Incident
        </h1>
        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
          Submit critical incident details and location coordinates for immediate emergency dispatch.
        </p>
      </div>

      {serverError && (
        <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/70 text-red-200 text-xs flex items-start gap-3">
          <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <span className="font-semibold block">Submission Error</span>
            <span className="opacity-90">{serverError}</span>
          </div>
        </div>
      )}

      {/* Main 2-Column Responsive Layout: Left Form Details | Right Interactive Map */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Incident Form Details */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-xl p-5 sm:p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-bg-border)] pb-2">
                <span className="w-2 h-2 rounded-full bg-[var(--color-sand)]"></span>
                Incident Details
              </h2>

              {/* Title Field */}
              <div className="space-y-1">
                <label htmlFor="incident-title" className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">
                  Incident Title <span className="text-red-400">*</span>
                </label>
                <input
                  id="incident-title"
                  name="title"
                  type="text"
                  placeholder="e.g., Structure Fire near Main Street Market"
                  value={formData.title}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm bg-[var(--color-bg-elevated)] border text-[var(--color-text-primary)] focus:outline-none transition-all ${fieldErrors.title ? 'border-red-700 focus:border-red-500' : 'border-[var(--color-bg-border)] focus:border-[var(--color-sand)]'
                    }`}
                />
                {fieldErrors.title && <p className="text-xs text-red-400">{fieldErrors.title}</p>}
              </div>

              {/* Category & Severity Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Selector */}
                <div className="space-y-1">
                  <label htmlFor="incident-category" className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">
                    Category <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="incident-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    className="w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-sand)] transition-all cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.category && <p className="text-xs text-red-400">{fieldErrors.category}</p>}
                </div>

                {/* Severity Selector */}
                <div className="space-y-1">
                  <label className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">
                    Severity Level <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {SEVERITIES.map((s) => {
                      const isSelected = formData.severity === s.level;
                      return (
                        <button
                          key={s.level}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, severity: s.level }));
                            if (fieldErrors.severity) setFieldErrors((prev) => ({ ...prev, severity: '' }));
                          }}
                          disabled={isSubmitting}
                          className={`py-2 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer text-center ${isSelected
                              ? `${s.color} ring-2 ring-offset-1 ring-offset-[var(--color-bg-surface)] ring-[var(--color-sand)]`
                              : 'bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-bg-border)] hover:border-[var(--color-sand)]/50'
                            }`}
                        >
                          {s.level}
                        </button>
                      );
                    })}
                  </div>
                  {fieldErrors.severity && <p className="text-xs text-red-400">{fieldErrors.severity}</p>}
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-1">
                <label htmlFor="incident-description" className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-secondary)]">
                  Detailed Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  id="incident-description"
                  name="description"
                  rows={3}
                  placeholder="Provide accurate emergency details: casualties, hazards, trapped individuals, observed smoke, etc."
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className={`w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm bg-[var(--color-bg-elevated)] border text-[var(--color-text-primary)] focus:outline-none transition-all ${fieldErrors.description ? 'border-red-700 focus:border-red-500' : 'border-[var(--color-bg-border)] focus:border-[var(--color-sand)]'
                    }`}
                />
                {fieldErrors.description && <p className="text-xs text-red-400">{fieldErrors.description}</p>}
              </div>

              {/* ── Feature 15: Evidence Upload Section ────────────────────────── */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2 border-b border-[var(--color-bg-border)] pb-2">
                  <svg className="w-4 h-4 text-[var(--color-sand)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Upload Incident Photos / Evidence
                    <span className="ml-1 text-[var(--color-text-muted)] font-normal normal-case tracking-normal">
                      (optional · up to {MAX_FILES} files · max {MAX_FILE_SIZE_MB} MB each)
                    </span>
                  </span>
                </div>

                {/* Drop-zone / file picker button */}
                <div
                  className={`relative border-2 border-dashed rounded-xl transition-all ${isSubmitting
                      ? 'opacity-50 pointer-events-none border-[var(--color-bg-border)]'
                      : 'border-[var(--color-bg-border)] hover:border-[var(--color-sand)]/60 cursor-pointer'
                    } bg-[var(--color-bg-elevated)] p-4`}
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload evidence files"
                >
                  <input
                    id="evidence-upload"
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.jpg,.jpeg,.png,.webp,.gif,.pdf"
                    className="sr-only"
                    onChange={handleFileSelect}
                    disabled={isSubmitting}
                  />
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-sand)]/10 border border-[var(--color-sand)]/30 flex items-center justify-center">
                      <svg className="w-5 h-5 text-[var(--color-sand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Click to select photos or evidence files
                      </p>
                      <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                        JPEG, PNG, WebP, GIF, PDF · Max {MAX_FILE_SIZE_MB} MB per file · Up to {MAX_FILES} files
                      </p>
                    </div>
                    {selectedFiles.length < MAX_FILES && (
                      <span className="text-[11px] px-3 py-1 rounded-full bg-[var(--color-sand)]/10 border border-[var(--color-sand)]/30 text-[var(--color-sand)] font-semibold">
                        {selectedFiles.length === 0 ? 'No files selected' : `${selectedFiles.length} of ${MAX_FILES} files selected — click to add more`}
                      </span>
                    )}
                    {selectedFiles.length >= MAX_FILES && (
                      <span className="text-[11px] px-3 py-1 rounded-full bg-amber-950/50 border border-amber-800/50 text-amber-300 font-semibold">
                        Maximum {MAX_FILES} files reached
                      </span>
                    )}
                  </div>
                </div>

                {/* File validation errors */}
                {fileErrors.length > 0 && (
                  <div className="space-y-1">
                    {fileErrors.map((err, i) => (
                      <p key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                        <span className="flex-shrink-0 mt-0.5">⚠</span>
                        <span>{err}</span>
                      </p>
                    ))}
                  </div>
                )}

                {/* Selected file list with previews and remove buttons */}
                {selectedFiles.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedFiles.map((sf) => (
                      <div
                        key={sf.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] group"
                      >
                        {/* Thumbnail or file icon */}
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] flex items-center justify-center">
                          {sf.preview ? (
                            <img src={sf.preview} alt={sf.file.name} className="w-full h-full object-cover" />
                          ) : (
                            <svg className="w-5 h-5 text-[var(--color-sand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>

                        {/* File info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--color-text-primary)] truncate" title={sf.file.name}>
                            {sf.file.name}
                          </p>
                          <p className="text-[11px] text-[var(--color-text-muted)]">
                            {(sf.file.size / 1024 / 1024).toFixed(2)} MB · {sf.file.type.split('/')[1]?.toUpperCase()}
                          </p>
                        </div>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(sf.id)}
                          disabled={isSubmitting}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-400 hover:bg-red-950/40 border border-transparent hover:border-red-800/50 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
                          aria-label={`Remove ${sf.file.name}`}
                          title="Remove file"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload progress bar (shown during submission) */}
                {uploadProgress !== null && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[var(--color-text-muted)]">Uploading evidence…</span>
                      <span className="font-bold text-[var(--color-sand)]">{uploadProgress}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--color-sand)] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Protocol Guidance Note */}
            <div className="pt-2">
              <div className="p-3 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] flex items-start gap-2.5">
                <svg className="w-4 h-4 text-[var(--color-sand)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                  <span className="font-semibold text-[var(--color-text-primary)] block">Dispatch Protocol Notice</span>
                  Reports are routed immediately to local dispatchers. Ensure location accuracy on the interactive map for faster responder arrival.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Map Picker */}
          <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-xl p-5 sm:p-6 shadow-xl flex flex-col justify-between space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-primary)] flex items-center gap-2 border-b border-[var(--color-bg-border)] pb-2">
              <span className="w-2 h-2 rounded-full bg-[var(--color-sand)]"></span>
              Emergency Map & Location
            </h2>

            <MapPicker location={formData.location} onChange={handleLocationChange} />
            {fieldErrors.location && <p className="text-xs text-red-400">{fieldErrors.location}</p>}
          </div>
        </div>

        {/* Bottom Prominent Action Row with Large Buttons */}
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-1">
          <button
            type="button"
            onClick={handleResetForm}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-bg-border)] hover:border-[var(--color-sand)] transition-all text-center cursor-pointer"
          >
            Cancel / Clear Form
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-10 py-3.5 rounded-xl text-sm font-bold bg-[var(--color-sand)] text-[#0c1612] hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2.5"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-[#0c1612] border-t-transparent animate-spin"></div>
                Submitting Report...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 text-[#0c1612]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Submit Emergency Report</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
