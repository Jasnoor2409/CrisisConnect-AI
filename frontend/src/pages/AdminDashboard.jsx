/**
 * AdminDashboard.jsx — CrisisConnect AI
 *
 * Feature 16: Admin Dashboard
 *   - Platform-wide statistics (incidents by status/severity/category, user counts)
 *   - Recent incidents table
 *   - User management with role update
 *
 * CHO Lectures demonstrated:
 *   - 13: map(), reduce(), Object.entries()
 *   - 15: Destructuring, rest/spread
 *   - 16: Optional chaining (?.), nullish coalescing (??)
 *   - 19: useState
 *   - 20: useEffect
 *   - 21: useCallback, useMemo
 *   - 27: Promise.all, async/await
 *   - 59: Mongoose populate() — data shown includes populated reporter/assignee
 */

import { useState, useEffect, useCallback } from 'react';
import { getAdminStats, getAllUsers, updateUserRole } from '../services/adminService.js';

// ── Severity color map ────────────────────────────────────────────────────────
const SEVERITY_COLOR = {
  Critical: '#b93b3b', High: '#d69e3d', Medium: '#4a90e2', Low: '#3d8b5a',
};
const STATUS_COLOR = {
  reported: '#d69e3d', assigned: '#4a90e2', in_progress: '#9bb09c',
  resolved: '#3d8b5a', dismissed: '#708372',
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, color = 'var(--color-primary)' }) => (
  <div style={{
    background: 'var(--color-bg-elevated)',
    border: '1px solid var(--color-bg-border)',
    borderRadius: 14, padding: '1.3rem 1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.3rem',
  }}>
    <div style={{ fontSize: '1.5rem' }}>{icon}</div>
    <div style={{ fontSize: '1.9rem', fontWeight: 800, color }}>{value ?? 0}</div>
    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)' }}>{label}</div>
    {sub && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{sub}</div>}
  </div>
);

// ── Mini Bar Chart ────────────────────────────────────────────────────────────
const BarChart = ({ data, colorMap, title }) => {
  const max = Math.max(1, ...Object.values(data));
  return (
    <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: 14, padding: '1.3rem 1.5rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '1rem', letterSpacing: '0.06em' }}>
        {title}
      </div>
      {/* CHO Lecture 13: Object.entries() + map() */}
      {Object.entries(data).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
        <div key={key} style={{ marginBottom: '0.7rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</span>
            <span style={{ fontWeight: 600, color: colorMap?.[key] ?? 'var(--color-primary)' }}>{count}</span>
          </div>
          <div style={{ background: 'var(--color-bg-border)', borderRadius: 99, height: 6 }}>
            <div style={{
              width: `${(count / max) * 100}%`,
              height: '100%',
              background: colorMap?.[key] ?? 'var(--color-secondary)',
              borderRadius: 99,
              transition: 'width 0.5s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Role badge colors ─────────────────────────────────────────────────────────
const ROLE_BADGE = {
  admin:     { color: '#e6b252', bg: 'rgba(214,158,61,0.18)'   },
  responder: { color: '#72be8c', bg: 'rgba(61,139,90,0.15)'    },
  citizen:   { color: 'var(--color-sand)', bg: 'rgba(216,199,167,0.12)' },
};

export default function AdminDashboard() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [stats, setStats]           = useState(null);
  const [users, setUsers]           = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [statsError, setStatsError] = useState('');
  const [activeTab, setActiveTab]   = useState('overview'); // 'overview' | 'users' | 'incidents'
  const [roleUpdating, setRoleUpdating] = useState({}); // { [userId]: bool }
  const [roleMsg, setRoleMsg]       = useState({});

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError('');
    try {
      const data = await getAdminStats();
      setStats(data.stats);
    } catch (err) {
      setStatsError(err.response?.data?.message ?? 'Failed to load statistics.');
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch users ───────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await getAllUsers({ limit: 50 });
      setUsers(data.users ?? []);
    } catch {
      // non-critical
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, [fetchStats, fetchUsers]);

  // ── Handle role change ────────────────────────────────────────────────────
  const handleRoleChange = async (userId, newRole) => {
    setRoleUpdating(prev => ({ ...prev, [userId]: true }));
    setRoleMsg(prev => ({ ...prev, [userId]: null }));
    try {
      await updateUserRole(userId, newRole);
      setRoleMsg(prev => ({ ...prev, [userId]: { type: 'success', text: `Role updated to ${newRole}` } }));
      fetchUsers(); // refresh
    } catch (err) {
      setRoleMsg(prev => ({
        ...prev,
        [userId]: { type: 'error', text: err.response?.data?.message ?? 'Update failed' },
      }));
    } finally {
      setRoleUpdating(prev => ({ ...prev, [userId]: false }));
    }
  };

  // ── Tab nav styles ────────────────────────────────────────────────────────
  const tabStyle = (tab) => ({
    background: activeTab === tab ? 'rgba(216,199,167,0.15)' : 'transparent',
    border: activeTab === tab ? '1px solid rgba(216,199,167,0.3)' : '1px solid transparent',
    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-muted)',
    borderRadius: 8, padding: '0.5rem 1.2rem',
    cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
    transition: 'all 0.2s',
  });

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '0.4rem' }}>
          🛡️ Admin Dashboard
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
          Platform-wide oversight — incidents, users, and system health.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>📊 Overview</button>
        <button style={tabStyle('incidents')} onClick={() => setActiveTab('incidents')}>🚨 Recent Incidents</button>
        <button style={tabStyle('users')} onClick={() => setActiveTab('users')}>👤 User Management</button>
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <>
          {statsLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-secondary)' }}>⏳ Loading statistics…</div>
          ) : statsError ? (
            <div style={{ background: 'rgba(185,59,59,0.12)', border: '1px solid rgba(185,59,59,0.4)', borderRadius: 10, padding: '1rem 1.5rem', color: '#d85454' }}>{statsError}</div>
          ) : stats ? (
            <>
              {/* KPI Cards — CHO Lecture 13: Object.entries → map() */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <StatCard icon="🚨" label="Total Incidents"  value={stats.incidents?.total}    color="var(--color-primary)" />
                <StatCard icon="✅" label="Resolved Today"   value={stats.incidents?.resolvedToday} color="#3d8b5a" />
                <StatCard icon="👤" label="Total Users"      value={stats.users?.total}         color="#4a90e2" />
                <StatCard icon="🚑" label="Responders"       value={stats.users?.byRole?.responder ?? 0} color="#72be8c" />
                <StatCard icon="🔴" label="Open Incidents"   value={(stats.incidents?.byStatus?.reported ?? 0) + (stats.incidents?.byStatus?.assigned ?? 0) + (stats.incidents?.byStatus?.in_progress ?? 0)} color="#d69e3d" />
              </div>

              {/* Charts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {Object.keys(stats.incidents?.byStatus ?? {}).length > 0 && (
                  <BarChart title="INCIDENTS BY STATUS"   data={stats.incidents.byStatus}   colorMap={STATUS_COLOR} />
                )}
                {Object.keys(stats.incidents?.bySeverity ?? {}).length > 0 && (
                  <BarChart title="INCIDENTS BY SEVERITY" data={stats.incidents.bySeverity} colorMap={SEVERITY_COLOR} />
                )}
                {Object.keys(stats.incidents?.byCategory ?? {}).length > 0 && (
                  <BarChart title="INCIDENTS BY CATEGORY" data={stats.incidents.byCategory} colorMap={{}} />
                )}
                {Object.keys(stats.users?.byRole ?? {}).length > 0 && (
                  <BarChart title="USERS BY ROLE"         data={stats.users.byRole}         colorMap={{ admin: '#e6b252', responder: '#72be8c', citizen: '#d8c7a7' }} />
                )}
              </div>
            </>
          ) : null}
        </>
      )}

      {/* ── RECENT INCIDENTS TAB ── */}
      {activeTab === 'incidents' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>10 Most Recent Incidents</h2>
            <button onClick={fetchStats} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: 8, padding: '0.4rem 1rem', color: 'var(--color-sand)', cursor: 'pointer', fontSize: '0.82rem' }}>↺ Refresh</button>
          </div>
          {statsLoading ? (
            <div style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>⏳ Loading…</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-bg-border)' }}>
                    {['Ref ID', 'Title', 'Category', 'Severity', 'Status', 'Reporter', 'Assigned To', 'Created'].map(h => (
                      <th key={h} style={{ padding: '0.6rem 0.8rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, letterSpacing: '0.04em', fontSize: '0.75rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* CHO Lecture 13: map() over recent incidents */}
                  {(stats?.recentIncidents ?? []).map((inc, idx) => (
                    <tr key={inc._id} style={{ borderBottom: '1px solid var(--color-bg-border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)' }}>
                      <td style={{ padding: '0.7rem 0.8rem', color: 'var(--color-text-muted)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{inc.incidentId}</td>
                      <td style={{ padding: '0.7rem 0.8rem', color: 'var(--color-primary)', fontWeight: 500, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{inc.title}</td>
                      <td style={{ padding: '0.7rem 0.8rem', color: 'var(--color-text-secondary)' }}>{inc.category}</td>
                      <td style={{ padding: '0.7rem 0.8rem' }}>
                        <span style={{ color: SEVERITY_COLOR[inc.severity], fontWeight: 600, fontSize: '0.78rem' }}>{inc.severity}</span>
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem' }}>
                        <span style={{ color: STATUS_COLOR[inc.status], fontWeight: 600, fontSize: '0.78rem', textTransform: 'capitalize' }}>{inc.status?.replace('_', ' ')}</span>
                      </td>
                      <td style={{ padding: '0.7rem 0.8rem', color: 'var(--color-text-secondary)', fontSize: '0.78rem' }}>{inc.reportedBy?.name ?? '—'}</td>
                      <td style={{ padding: '0.7rem 0.8rem', color: inc.assignedTo ? '#4a90e2' : 'var(--color-text-muted)', fontSize: '0.78rem' }}>{inc.assignedTo?.name ?? '—'}</td>
                      <td style={{ padding: '0.7rem 0.8rem', color: 'var(--color-text-muted)', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{new Date(inc.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── USER MANAGEMENT TAB ── */}
      {activeTab === 'users' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-primary)' }}>User Management</h2>
            <button onClick={fetchUsers} style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-bg-border)', borderRadius: 8, padding: '0.4rem 1rem', color: 'var(--color-sand)', cursor: 'pointer', fontSize: '0.82rem' }}>↺ Refresh</button>
          </div>
          {usersLoading ? (
            <div style={{ color: 'var(--color-text-secondary)', padding: '2rem' }}>⏳ Loading users…</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {users.map(u => {
                const rb = ROLE_BADGE[u.role] ?? ROLE_BADGE.citizen;
                const msg = roleMsg[u._id];
                return (
                  <div key={u._id} style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-bg-border)',
                    borderRadius: 12, padding: '0.9rem 1.3rem',
                    display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.9rem' }}>{u.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{u.email}</div>
                    </div>
                    <span style={{ color: rb.color, background: rb.bg, border: `1px solid ${rb.color}44`, padding: '3px 12px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase' }}>
                      {u.role}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {/* CHO Lecture 13: filter() to exclude current role */}
                      {['citizen', 'responder', 'admin'].filter(r => r !== u.role).map(newRole => (
                        <button
                          key={newRole}
                          onClick={() => handleRoleChange(u._id, newRole)}
                          disabled={roleUpdating[u._id]}
                          style={{
                            background: ROLE_BADGE[newRole]?.bg ?? 'rgba(155,176,156,0.12)',
                            border: `1px solid ${ROLE_BADGE[newRole]?.color ?? '#9bb09c'}44`,
                            color: ROLE_BADGE[newRole]?.color ?? '#9bb09c',
                            borderRadius: 8, padding: '0.35rem 0.8rem',
                            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                            opacity: roleUpdating[u._id] ? 0.6 : 1,
                          }}
                        >
                          → {newRole}
                        </button>
                      ))}
                    </div>
                    {msg && (
                      <span style={{ fontSize: '0.78rem', color: msg.type === 'success' ? '#72be8c' : '#d85454' }}>
                        {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
                      </span>
                    )}
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', marginLeft: 'auto' }}>
                      Joined {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
