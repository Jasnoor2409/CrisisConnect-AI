/**
 * ResponderDashboard.jsx — CrisisConnect AI
 *
 * Feature 11: Emergency Responder Dashboard
 * Feature 13: Incident Assignment (self-assign)
 * Feature 14: Status Updates (in_progress → resolved / dismissed)
 * Feature 17: Real-time incident list with live filtering
 *
 * CHO Lectures demonstrated:
 *   - 12: Array.filter(), Array.find()
 *   - 13: Array.map(), Array.reduce()
 *   - 15: Destructuring, spread, rest
 *   - 16: Optional chaining (?.), nullish coalescing (??)
 *   - 19: React useState
 *   - 20: React useEffect
 *   - 21: React useCallback / useMemo
 *   - 24: Template literals
 *   - 27: Promise.all, async/await
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getAllIncidents, assignIncident, updateIncidentStatus, getEvidenceUrl } from '../services/incidentService.js';

// ── Status metadata helper ─────────────────────────────────────────────────────
const STATUS_META = {
  reported:    { label: 'Reported',     color: '#d69e3d', bg: 'rgba(214,158,61,0.12)',   icon: '🔴' },
  assigned:    { label: 'Assigned',     color: '#4a90e2', bg: 'rgba(74,144,226,0.12)',   icon: '📋' },
  in_progress: { label: 'In Progress',  color: '#9bb09c', bg: 'rgba(155,176,156,0.15)',  icon: '🔧' },
  resolved:    { label: 'Resolved',     color: '#3d8b5a', bg: 'rgba(61,139,90,0.15)',    icon: '✅' },
  dismissed:   { label: 'Dismissed',    color: '#708372', bg: 'rgba(112,131,114,0.12)',  icon: '❌' },
};

const SEVERITY_META = {
  Critical: { color: '#b93b3b', bg: 'rgba(185,59,59,0.15)' },
  High:     { color: '#d69e3d', bg: 'rgba(214,158,61,0.12)' },
  Medium:   { color: '#4a90e2', bg: 'rgba(74,144,226,0.12)' },
  Low:      { color: '#3d8b5a', bg: 'rgba(61,139,90,0.12)' },
};

// ── Badge component (pure presentational) ────────────────────────────────────
const Badge = ({ label, color, bg }) => (
  <span style={{
    color, background: bg,
    border: `1px solid ${color}44`,
    padding: '2px 10px',
    borderRadius: 99,
    fontSize: '0.7rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  }}>
    {label}
  </span>
);

export default function ResponderDashboard() {
  const { user } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────
  const [incidents, setIncidents]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [actionLoading, setActionLoading] = useState({}); // { [incidentId]: 'assign'|'status'|false }
  const [actionMsg, setActionMsg]       = useState({});   // { [incidentId]: { type: 'success'|'error', text } }
  const [selectedNote, setSelectedNote] = useState({});   // { [incidentId]: string }
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm]     = useState('');
  const [expandedId, setExpandedId]     = useState(null);

  // ── Fetch all incidents ────────────────────────────────────────────────────
  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAllIncidents({ limit: 50 });
      setIncidents(data.incidents ?? []);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Failed to load incidents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncidents(); }, [fetchIncidents]);

  // ── CHO Lecture 12: filter() — client-side filtering ──────────────────────
  const filtered = useMemo(() => {
    let list = incidents;
    if (statusFilter !== 'all') {
      list = list.filter(i => i.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      list = list.filter(i =>
        i.title?.toLowerCase().includes(term) ||
        i.incidentId?.toLowerCase().includes(term) ||
        i.category?.toLowerCase().includes(term) ||
        i.location?.address?.toLowerCase().includes(term)
      );
    }
    return list;
  }, [incidents, statusFilter, searchTerm]);

  // ── CHO Lecture 13: reduce() — compute status counts ──────────────────────
  const statusCounts = useMemo(() =>
    incidents.reduce((acc, i) => {
      acc[i.status] = (acc[i.status] ?? 0) + 1;
      return acc;
    }, {}),
  [incidents]);

  // ── CHO Lecture 28: Set — deduplicate active responder IDs ─────────────────
  // Builds a Set of unique responder IDs who are assigned to open incidents.
  // Set guarantees no duplicates even if a responder has multiple incidents.
  const activeResponderIds = useMemo(() => {
    const ids = incidents
      .filter(i => i.assignedTo?._id && i.status !== 'resolved' && i.status !== 'dismissed')
      .map(i => i.assignedTo._id);
    return new Set(ids); // CHO Lecture 28: Set constructor from array
  }, [incidents]);

  // ── CHO Lecture 28: Map — O(1) lookup for action loading states ────────────
  // Maps incidentId → loading action string for fast render lookup.
  const actionLoadingMap = useMemo(() => {
    return new Map(Object.entries(actionLoading)); // CHO Lecture 28: Map from entries
  }, [actionLoading]);


  // ── Feature 13: Self-assign ────────────────────────────────────────────────
  const handleSelfAssign = async (incident) => {
    const id = incident._id;
    setActionLoading(prev => ({ ...prev, [id]: 'assign' }));
    setActionMsg(prev => ({ ...prev, [id]: null }));
    try {
      await assignIncident(id, null); // null = self-assign
      setActionMsg(prev => ({ ...prev, [id]: { type: 'success', text: 'Incident assigned to you!' } }));
      await fetchIncidents(); // refresh list
    } catch (err) {
      setActionMsg(prev => ({
        ...prev,
        [id]: { type: 'error', text: err.response?.data?.message ?? 'Assignment failed.' },
      }));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // ── Feature 14: Status update ─────────────────────────────────────────────
  const handleStatusUpdate = async (incident, newStatus) => {
    const id = incident._id;
    const note = selectedNote[id] ?? '';
    setActionLoading(prev => ({ ...prev, [id]: 'status' }));
    setActionMsg(prev => ({ ...prev, [id]: null }));
    try {
      await updateIncidentStatus(id, newStatus, note);
      setActionMsg(prev => ({
        ...prev,
        [id]: { type: 'success', text: `Status updated to "${newStatus}"` },
      }));
      setSelectedNote(prev => ({ ...prev, [id]: '' }));
      await fetchIncidents();
    } catch (err) {
      setActionMsg(prev => ({
        ...prev,
        [id]: { type: 'error', text: err.response?.data?.message ?? 'Status update failed.' },
      }));
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  // ── Determine valid next statuses for a responder ─────────────────────────
  const getNextStatuses = (incident) => {
    // If not assigned to current user, no transitions
    if (incident.assignedTo?._id !== user?.id && incident.assignedTo?._id !== user?._id) return [];
    const transitions = {
      assigned:    ['in_progress', 'dismissed'],
      in_progress: ['resolved', 'dismissed'],
    };
    return transitions[incident.status] ?? [];
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: 700,
          color: 'var(--color-primary)',
          marginBottom: '0.4rem',
        }}>
          🚑 Responder Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Welcome, <strong style={{ color: 'var(--color-sand)' }}>{user?.name}</strong> — manage and respond to active incidents.
        </p>
      </div>

      {/* ── Status Summary Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {Object.entries(STATUS_META).map(([key, meta]) => (
          <button
            key={key}
            onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)}
            style={{
              background: statusFilter === key ? meta.bg : 'var(--color-bg-elevated)',
              border: `1px solid ${statusFilter === key ? meta.color + '66' : 'var(--color-bg-border)'}`,
              borderRadius: 12,
              padding: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left',
            }}
          >
            <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>{meta.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: meta.color }}>
              {statusCounts[key] ?? 0}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
              {meta.label}
            </div>
          </button>
        ))}
        {/* CHO Lecture 28: Set.size — unique active responders */}
        <div style={{
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-bg-border)',
          borderRadius: 12, padding: '1rem',
          textAlign: 'left',
        }}>
          <div style={{ fontSize: '1.4rem', marginBottom: '0.3rem' }}>👥</div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#72be8c' }}>
            {activeResponderIds.size}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', marginTop: '0.1rem' }}>
            Active Responders
          </div>
        </div>
      </div>

      {/* ── Search + Filter Bar ── */}
      <div style={{
        display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center',
      }}>
        <input
          type="text"
          placeholder="🔍  Search by title, ID, category, location…"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            flex: 1, minWidth: 220,
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-bg-border)',
            borderRadius: 8, padding: '0.6rem 1rem',
            color: 'var(--color-text-primary)', fontSize: '0.9rem',
            outline: 'none',
          }}
        />
        <button
          onClick={fetchIncidents}
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-bg-border)',
            borderRadius: 8, padding: '0.6rem 1.2rem',
            color: 'var(--color-sand)', cursor: 'pointer',
            fontSize: '0.85rem', transition: 'background 0.2s',
          }}
        >
          ↺ Refresh
        </button>
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>
          {filtered.length} / {incidents.length} incidents
        </span>
      </div>

      {/* ── States: Loading / Error / Empty / List ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          Loading incidents…
        </div>
      ) : error ? (
        <div style={{
          background: 'rgba(185,59,59,0.12)', border: '1px solid rgba(185,59,59,0.4)',
          borderRadius: 10, padding: '1rem 1.5rem', color: '#d85454',
        }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem',
          color: 'var(--color-text-muted)', fontSize: '0.95rem',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📭</div>
          No incidents match your filters.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* CHO Lecture 13: map() over filtered incidents */}
          {filtered.map(incident => {
            const statusMeta   = STATUS_META[incident.status]   ?? STATUS_META.reported;
            const severityMeta = SEVERITY_META[incident.severity] ?? {};
            const isExpanded   = expandedId === incident._id;
            const isMine       = (incident.assignedTo?._id === user?.id) || (incident.assignedTo?._id === user?._id);
            const nextStatuses = getNextStatuses(incident);
            const busy         = actionLoading[incident._id];
            const msg          = actionMsg[incident._id];

            return (
              <div
                key={incident._id}
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: `1px solid ${isMine ? '#4a90e244' : 'var(--color-bg-border)'}`,
                  borderRadius: 14,
                  overflow: 'hidden',
                  transition: 'box-shadow 0.2s',
                  boxShadow: isMine ? '0 0 0 1px #4a90e222' : 'none',
                }}
              >
                {/* ── Incident Header ── */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : incident._id)}
                  style={{
                    width: '100%', background: 'none', border: 'none',
                    padding: '1.1rem 1.5rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.95rem' }}>
                        {incident.title}
                      </span>
                      <Badge label={incident.category} color="#9bb09c" bg="rgba(155,176,156,0.12)" />
                      <Badge label={severityMeta.label ?? incident.severity} color={severityMeta.color ?? '#d8c7a7'} bg={severityMeta.bg ?? 'rgba(216,199,167,0.1)'} />
                      <Badge label={statusMeta.label} color={statusMeta.color} bg={statusMeta.bg} />
                      {isMine && <Badge label="Assigned to you" color="#4a90e2" bg="rgba(74,144,226,0.15)" />}
                    </div>
                    <div style={{ marginTop: '0.3rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                      {incident.incidentId} · {incident.location?.address ?? 'Location provided'} ·{' '}
                      {new Date(incident.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>
                    {isExpanded ? '▲' : '▼'}
                  </span>
                </button>

                {/* ── Expanded Detail ── */}
                {isExpanded && (
                  <div style={{
                    padding: '0 1.5rem 1.5rem',
                    borderTop: '1px solid var(--color-bg-border)',
                  }}>
                    {/* Description */}
                    <p style={{ color: 'var(--color-text-secondary)', margin: '1rem 0', fontSize: '0.9rem', lineHeight: 1.6 }}>
                      {incident.description}
                    </p>

                    {/* Reporter Info */}
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                      Reported by: <strong style={{ color: 'var(--color-sand)' }}>
                        {incident.reportedBy?.name ?? 'Unknown'} ({incident.reportedBy?.email})
                      </strong>
                    </div>

                    {/* Assigned To */}
                    {incident.assignedTo && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        Assigned to: <strong style={{ color: '#4a90e2' }}>
                          {incident.assignedTo.name} ({incident.assignedTo.email})
                        </strong>
                        {incident.assignedAt && ` · ${new Date(incident.assignedAt).toLocaleString()}`}
                      </div>
                    )}

                    {/* AI Classification badge */}
                    {incident.aiClassification?.category && (
                      <div style={{
                        display: 'inline-block', background: 'rgba(155,176,156,0.1)',
                        border: '1px solid rgba(155,176,156,0.3)', borderRadius: 8,
                        padding: '0.4rem 0.9rem', marginBottom: '1rem', fontSize: '0.82rem',
                        color: 'var(--color-secondary)',
                      }}>
                        🤖 AI: {incident.aiClassification.category} · {incident.aiClassification.severity}
                        {' '} ({Math.round((incident.aiClassification.confidence ?? 0) * 100)}% confidence)
                      </div>
                    )}

                    {/* ── Action message ── */}
                    {msg && (
                      <div style={{
                        background: msg.type === 'success' ? 'rgba(61,139,90,0.15)' : 'rgba(185,59,59,0.15)',
                        border: `1px solid ${msg.type === 'success' ? 'rgba(61,139,90,0.4)' : 'rgba(185,59,59,0.4)'}`,
                        borderRadius: 8, padding: '0.5rem 1rem',
                        color: msg.type === 'success' ? '#72be8c' : '#d85454',
                        fontSize: '0.85rem', marginBottom: '1rem',
                      }}>
                        {msg.type === 'success' ? '✅ ' : '⚠️ '}{msg.text}
                      </div>
                    )}

                    {/* ── Actions Row ── */}
                    <div style={{ display: 'flex', gap: '0.7rem', flexWrap: 'wrap', alignItems: 'center' }}>
                      {/* Self-Assign button */}
                      {!isMine && ['reported', 'assigned'].includes(incident.status) && (
                        <button
                          onClick={() => handleSelfAssign(incident)}
                          disabled={busy === 'assign'}
                          style={{
                            background: 'rgba(74,144,226,0.15)', border: '1px solid rgba(74,144,226,0.5)',
                            color: '#4a90e2', borderRadius: 8, padding: '0.5rem 1.2rem',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                            opacity: busy === 'assign' ? 0.7 : 1,
                          }}
                        >
                          {busy === 'assign' ? 'Assigning…' : '📋 Take Assignment'}
                        </button>
                      )}

                      {/* Status update buttons */}
                      {isMine && nextStatuses.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(incident, status)}
                          disabled={busy === 'status'}
                          style={{
                            background: STATUS_META[status]?.bg ?? 'rgba(155,176,156,0.12)',
                            border: `1px solid ${STATUS_META[status]?.color ?? '#9bb09c'}55`,
                            color: STATUS_META[status]?.color ?? '#9bb09c',
                            borderRadius: 8, padding: '0.5rem 1.2rem',
                            cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                            opacity: busy === 'status' ? 0.7 : 1,
                          }}
                        >
                          {busy === 'status' ? 'Updating…' : `→ ${STATUS_META[status]?.label ?? status}`}
                        </button>
                      ))}

                      {/* Note input for status update */}
                      {isMine && nextStatuses.length > 0 && (
                        <input
                          type="text"
                          placeholder="Add a note (optional)…"
                          value={selectedNote[incident._id] ?? ''}
                          onChange={e => setSelectedNote(prev => ({ ...prev, [incident._id]: e.target.value }))}
                          style={{
                            flex: 1, minWidth: 180,
                            background: 'var(--color-bg-surface)',
                            border: '1px solid var(--color-bg-border)', borderRadius: 8,
                            padding: '0.5rem 0.8rem', color: 'var(--color-text-primary)',
                            fontSize: '0.85rem', outline: 'none',
                          }}
                        />
                      )}
                    </div>

                    {/* ── Status Timeline ── */}
                    {incident.statusHistory?.length > 0 && (
                      <div style={{ marginTop: '1.2rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                          STATUS TIMELINE
                        </div>
                        {[...incident.statusHistory].reverse().map((entry, idx) => (
                          <div key={idx} style={{
                            display: 'flex', gap: '0.8rem', marginBottom: '0.4rem',
                            fontSize: '0.8rem', color: 'var(--color-text-secondary)',
                          }}>
                            <span style={{ color: STATUS_META[entry.status]?.color ?? '#9bb09c', fontWeight: 600 }}>
                              {STATUS_META[entry.status]?.icon} {entry.status}
                            </span>
                            <span style={{ color: 'var(--color-text-muted)' }}>
                              {new Date(entry.changedAt).toLocaleString()}
                            </span>
                            {entry.note && <span>— {entry.note}</span>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* ── Feature 15: Evidence Files ── */}
                    {incident.evidence?.length > 0 && (
                      <div style={{ marginTop: '1.2rem' }}>
                        <div style={{
                          fontSize: '0.8rem', fontWeight: 600,
                          color: 'var(--color-text-muted)', marginBottom: '0.6rem',
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                          INCIDENT EVIDENCE
                          <span style={{
                            background: 'rgba(216,199,167,0.15)',
                            border: '1px solid rgba(216,199,167,0.3)',
                            borderRadius: 99, padding: '1px 8px',
                            fontSize: '0.72rem', fontWeight: 700,
                            color: 'var(--color-sand)',
                          }}>
                            {incident.evidence.length} file{incident.evidence.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                          {incident.evidence.map((ev) => {
                            const isImage = ev.mimetype?.startsWith('image/');
                            const evidenceUrl = getEvidenceUrl(incident._id, ev.filename);
                            return (
                              <a
                                key={ev._id || ev.filename}
                                href={evidenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '0.7rem',
                                  padding: '0.4rem 0.7rem', borderRadius: 8,
                                  background: 'var(--color-bg-surface)',
                                  border: '1px solid var(--color-bg-border)',
                                  textDecoration: 'none',
                                  transition: 'border-color 0.15s',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(216,199,167,0.4)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-bg-border)'; }}
                              >
                                {/* Thumbnail */}
                                <div style={{
                                  width: 36, height: 36, borderRadius: 6, overflow: 'hidden',
                                  flexShrink: 0, background: 'var(--color-bg-elevated)',
                                  border: '1px solid var(--color-bg-border)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                  {isImage ? (
                                    <img
                                      src={evidenceUrl}
                                      alt={ev.originalName}
                                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <span style={{ fontSize: '1.1rem' }}>📄</span>
                                  )}
                                </div>
                                {/* File info */}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{
                                    fontSize: '0.8rem', fontWeight: 600,
                                    color: 'var(--color-text-primary)',
                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                  }} title={ev.originalName}>
                                    {ev.originalName}
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
                                    {(ev.size / 1024 / 1024).toFixed(2)} MB · {ev.mimetype?.split('/')[1]?.toUpperCase()}
                                    {ev.uploadedAt && ` · ${new Date(ev.uploadedAt).toLocaleDateString()}`}
                                  </div>
                                </div>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-sand)' }}>↗</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
