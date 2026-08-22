import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyIncidents } from '../services/incidentService.js';

// Status badge configuration
const STATUS_CONFIG = {
  reported: {
    label: 'Reported',
    badgeClass: 'bg-blue-950/60 text-blue-300 border-blue-800/70',
    dotClass: 'bg-blue-400',
  },
  in_progress: {
    label: 'In Progress',
    badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800/70',
    dotClass: 'bg-amber-400 animate-pulse',
  },
  resolved: {
    label: 'Resolved',
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70',
    dotClass: 'bg-emerald-400',
  },
  dismissed: {
    label: 'Dismissed',
    badgeClass: 'bg-zinc-800/80 text-zinc-300 border-zinc-700/80',
    dotClass: 'bg-zinc-400',
  },
};

// Severity badge configuration
const SEVERITY_CONFIG = {
  Low: {
    badgeClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/70',
    icon: '🟢',
  },
  Medium: {
    badgeClass: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/70',
    icon: '🟡',
  },
  High: {
    badgeClass: 'bg-amber-950/60 text-amber-300 border-amber-800/70',
    icon: '🟠',
  },
  Critical: {
    badgeClass: 'bg-red-950/70 text-red-300 border-red-800/80 font-bold',
    icon: '🔴',
  },
};

export default function MyReportsPage() {
  const [incidents, setIncidents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchIncidents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyIncidents();
      if (data.success) {
        setIncidents(data.incidents || []);
      } else {
        setError(data.message || 'Failed to load incident history.');
      }
    } catch (err) {
      console.error('Fetch My Incidents error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while fetching reports.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchCat = filterCategory === 'ALL' || inc.category === filterCategory;
    const matchSev =
      filterSeverity === 'ALL' ||
      inc.severity === filterSeverity ||
      inc.aiClassification?.severity === filterSeverity;
    return matchCat && matchSev;
  });

  return (
    <main className="min-h-[calc(100vh-4rem)] w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 flex flex-col gap-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--color-bg-border)] pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-[var(--color-text-primary)] flex items-center gap-2.5">
              <svg className="w-7 h-7 text-[var(--color-sand)] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              My Emergency Reports
            </h1>
            {!isLoading && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-sand)]/20 text-[var(--color-sand)] border border-[var(--color-sand)]/40">
                {incidents.length} {incidents.length === 1 ? 'Report' : 'Reports'}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
            Track and review all emergency incidents, AI severity assessments, and safety guidance.
          </p>
        </div>

        {/* Action Controls: Refresh & Submit New Report */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchIncidents}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-bg-border)] hover:border-[var(--color-sand)] hover:text-[var(--color-sand)] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Refresh list"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>

          <Link
            to="/report-incident"
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[var(--color-sand)] text-[#0c1612] hover:bg-[var(--color-primary-hover)] transition-all shadow-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4 text-[#0c1612]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Report</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar: Category & Severity Filters */}
      {!isLoading && !error && incidents.length > 0 && (
        <div className="flex flex-col gap-2 border-b border-[var(--color-bg-border)]/50 pb-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[var(--color-text-muted)] font-semibold uppercase tracking-wider text-[11px] mr-1 whitespace-nowrap">
              Category:
            </span>
            {['ALL', 'Accident', 'Fire', 'Medical Emergency', 'Crime', 'Natural Disaster', 'Other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1 rounded-md font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  filterCategory === cat
                    ? 'bg-[var(--color-sand)] text-[#0c1612] border-[var(--color-sand)] font-bold'
                    : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-bg-border)] hover:border-[var(--color-sand)]/50 hover:text-[var(--color-text-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[var(--color-text-muted)] font-semibold uppercase tracking-wider text-[11px] mr-1 whitespace-nowrap">
              Severity:
            </span>
            {['ALL', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-3 py-1 rounded-md font-medium border transition-all cursor-pointer whitespace-nowrap ${
                  filterSeverity === sev
                    ? 'bg-[var(--color-sand)] text-[#0c1612] border-[var(--color-sand)] font-bold'
                    : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] border-[var(--color-bg-border)] hover:border-[var(--color-sand)]/50 hover:text-[var(--color-text-primary)]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading Skeleton / State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-xl p-5 h-64 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-[var(--color-bg-elevated)] rounded w-1/3"></div>
                <div className="h-6 bg-[var(--color-bg-elevated)] rounded w-3/4"></div>
                <div className="h-12 bg-[var(--color-bg-elevated)] rounded w-full"></div>
              </div>
              <div className="h-8 bg-[var(--color-bg-elevated)] rounded w-1/2 mt-4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="bg-red-950/40 border border-red-800/70 rounded-xl p-6 text-center max-w-xl mx-auto space-y-4 my-8">
          <div className="w-12 h-12 rounded-full bg-red-900/50 text-red-300 flex items-center justify-center mx-auto text-xl font-bold">
            !
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-red-200">Unable to Load Reports</h3>
            <p className="text-xs text-red-300/90">{error}</p>
          </div>
          <button
            onClick={fetchIncidents}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-red-800 text-white hover:bg-red-700 transition-all cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && incidents.length === 0 && (
        <div className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-xl p-10 text-center max-w-lg mx-auto space-y-5 my-8 shadow-xl">
          <div className="w-16 h-16 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[var(--color-sand)] flex items-center justify-center mx-auto text-2xl">
            📋
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">No Reports Submitted Yet</h3>
            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
              You haven't reported any emergency incidents from your account. When you submit a report, it will appear here with live AI assessment and safety guidance.
            </p>
          </div>
          <Link
            to="/report-incident"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold bg-[var(--color-sand)] text-[#0c1612] hover:bg-[var(--color-primary-hover)] transition-all shadow-md"
          >
            <svg className="w-4 h-4 text-[#0c1612]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Report an Emergency Now
          </Link>
        </div>
      )}

      {/* Incident Grid (Full Width, Responsive 1 -> 2 -> 3 columns) */}
      {!isLoading && !error && filteredIncidents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredIncidents.map((incident) => {
            const statusStyle = STATUS_CONFIG[incident.status] || STATUS_CONFIG.reported;
            const severityStyle = SEVERITY_CONFIG[incident.severity] || SEVERITY_CONFIG.Medium;
            const ai = incident.aiClassification;
            const aiSev = ai?.severity || incident.severity;
            const aiSevStyle = SEVERITY_CONFIG[aiSev] || SEVERITY_CONFIG.Medium;

            return (
              <div
                key={incident._id || incident.incidentId}
                onClick={() => setSelectedIncident(incident)}
                className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] hover:border-[var(--color-sand)]/60 rounded-xl p-5 shadow-lg transition-all duration-200 hover:shadow-2xl flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="space-y-3">
                  {/* Top Bar: Reference ID & Status Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-[var(--color-bg-border)] pb-2.5">
                    <span className="font-mono text-xs font-bold text-[var(--color-sand)] bg-[var(--color-sand)]/10 px-2.5 py-0.5 rounded border border-[var(--color-sand)]/30">
                      {incident.incidentId}
                    </span>
                    <div className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 ${statusStyle.badgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusStyle.dotClass}`}></span>
                      <span>{statusStyle.label}</span>
                    </div>
                  </div>

                  {/* Title & Category & Severities */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-base font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-sand)] transition-colors line-clamp-1">
                        {incident.title}
                      </h2>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${severityStyle.badgeClass}`}>
                        {severityStyle.icon} {incident.severity}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-sand)] mt-1 font-medium flex items-center gap-1">
                      <span>Category:</span>
                      <span className="text-[var(--color-text-primary)]">{incident.category}</span>
                    </p>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
                    {incident.description}
                  </p>

                  {/* AI Classification & Severity Callout Badge */}
                  {ai && (
                    <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-sand)]/30 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-[var(--color-sand)] flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          AI Assessment
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${aiSevStyle.badgeClass}`}>
                          AI Priority: {aiSev}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-[var(--color-text-primary)]">
                        Category: {ai.category}
                      </div>
                      {ai.reasoning && (
                        <p className="text-[11px] text-[var(--color-text-secondary)] italic line-clamp-1">
                          "{ai.reasoning}"
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Date & Location */}
                <div className="pt-3 border-t border-[var(--color-bg-border)]/60 mt-4 flex items-center justify-between text-[11px] text-[var(--color-text-muted)]">
                  <span className="truncate max-w-[170px]" title={incident.location?.address}>
                    📍 {incident.location?.address || 'Map coordinates'}
                  </span>
                  <span>{formatDate(incident.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal Panel */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)] rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[var(--color-bg-border)] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--color-sand)] bg-[var(--color-sand)]/15 px-2.5 py-0.5 rounded border border-[var(--color-sand)]/40">
                    {selectedIncident.incidentId}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selectedIncident.status]?.badgeClass}`}>
                    {STATUS_CONFIG[selectedIncident.status]?.label}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)] mt-2">
                  {selectedIncident.title}
                </h2>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="w-8 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-bg-border)] text-[var(--color-text-secondary)] hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs sm:text-sm">
              {/* Category & Severity Grid */}
              <div className="grid grid-cols-2 gap-3 bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-bg-border)]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block">
                    Citizen Selected Category
                  </span>
                  <span className="font-semibold text-[var(--color-text-primary)]">
                    {selectedIncident.category}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block">
                    Citizen Reported Severity
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold border mt-0.5 ${SEVERITY_CONFIG[selectedIncident.severity]?.badgeClass}`}>
                    {SEVERITY_CONFIG[selectedIncident.severity]?.icon} {selectedIncident.severity}
                  </span>
                </div>
              </div>

              {/* AI Emergency Assessment Section (Features 8 & 9) */}
              {selectedIncident.aiClassification && (
                <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-sand)]/40 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-bg-border)]">
                    <span className="text-xs font-bold text-[var(--color-sand)] flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-[var(--color-sand)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      AI Emergency Classification & Priority Assessment
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[var(--color-sand)] bg-[var(--color-sand)]/10 px-2 py-0.5 rounded border border-[var(--color-sand)]/30">
                      Category: {Math.round((selectedIncident.aiClassification.confidence || 0) * 100)}% | Severity: {Math.round((selectedIncident.aiClassification.severityConfidence || 0) * 100)}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] uppercase font-semibold block">
                        AI Predicted Category
                      </span>
                      <span className="font-bold text-sm text-[var(--color-text-primary)]">
                        {selectedIncident.aiClassification.category}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-[var(--color-text-muted)] uppercase font-semibold block">
                        AI Assessed Severity Priority
                      </span>
                      <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold border mt-0.5 ${
                        SEVERITY_CONFIG[selectedIncident.aiClassification.severity || selectedIncident.severity]?.badgeClass
                      }`}>
                        {SEVERITY_CONFIG[selectedIncident.aiClassification.severity || selectedIncident.severity]?.icon} {selectedIncident.aiClassification.severity || selectedIncident.severity}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <span className="text-[11px] text-[var(--color-text-muted)] uppercase font-semibold block">
                      AI Assessment Reasoning
                    </span>
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1 bg-[var(--color-bg-surface)] p-2.5 rounded-lg border border-[var(--color-bg-border)] italic">
                      "{selectedIncident.aiClassification.reasoning}"
                    </p>
                  </div>
                </div>
              )}

              {/* Feature 10: AI Safety Guidance & Recommendations */}
              {selectedIncident.safetyRecommendations && (
                <div className="bg-[var(--color-bg-elevated)] border border-amber-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-bg-border)]">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Emergency Safety Guidance
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] px-2 py-0.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-bg-border)]">
                      {selectedIncident.safetyRecommendations.isFallback ? 'Deterministic Fallback Guidance' : 'AI Safety Guidance'}
                    </span>
                  </div>

                  <ul className="space-y-1.5 text-xs text-[var(--color-text-primary)]">
                    {selectedIncident.safetyRecommendations.recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-amber-950/70 border border-amber-700/60 text-amber-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-snug">{rec}</span>
                      </li>
                    ))}
                  </ul>

                  {selectedIncident.safetyRecommendations.warning && (
                    <div className="bg-amber-950/40 border border-amber-800/60 rounded-lg p-2.5 text-[11px] text-amber-200/95 flex items-start gap-2 mt-2">
                      <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{selectedIncident.safetyRecommendations.warning}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Full Description */}
              <div className="space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block">
                  Detailed Description
                </span>
                <div className="bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-bg-border)] text-[var(--color-text-primary)] whitespace-pre-wrap leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              {/* Location & Coordinates */}
              <div className="bg-[var(--color-bg-elevated)] p-4 rounded-xl border border-[var(--color-bg-border)] space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-[var(--color-text-muted)] font-semibold block">
                  Emergency Location & Coordinates
                </span>
                <p className="font-semibold text-[var(--color-text-primary)]">
                  {selectedIncident.location?.address}
                </p>
                <p className="font-mono text-xs text-[var(--color-sand)]">
                  Latitude: {selectedIncident.location?.latitude}, Longitude: {selectedIncident.location?.longitude}
                </p>
              </div>

              {/* Report Metadata */}
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)] pt-2 border-t border-[var(--color-bg-border)]">
                <span>Reported On: {formatDate(selectedIncident.createdAt)}</span>
                <span>Last Updated: {formatDate(selectedIncident.updatedAt)}</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-[var(--color-bg-border)]">
              <button
                onClick={() => setSelectedIncident(null)}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border border-[var(--color-bg-border)] hover:border-[var(--color-sand)] transition-all cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
