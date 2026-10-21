import { useState } from 'react'
import { 
  Bell, 
  Check, 
  Languages, 
  LogOut, 
  Settings, 
  ShieldCheck 
} from 'lucide-react'
import type { Role } from '../types'

interface ProfilePageProps {
  role: Role
  signOut: () => void
  onToast: (msg: string) => void
}

export default function ProfilePage({ role, signOut, onToast }: ProfilePageProps) {
  const isStudent = role === 'Student'
  const isTeacher = role === 'Teacher'

  const [name, setName] = useState(
    isStudent ? 'Aarav Rao' : isTeacher ? 'Ms. Maya Kapoor' : 'School Administrator'
  )
  const [email, setEmail] = useState(
    isStudent
      ? 'aarav.rao@ellinium.edu'
      : isTeacher
      ? 'maya.kapoor@ellinium.edu'
      : 'admin@ellinium.edu'
  )
  const [phone, setPhone] = useState('+91 98201 44520')
  const [isEditing, setIsEditing] = useState(false)

  const schoolId = isStudent
    ? 'NES-2026-0842'
    : isTeacher
    ? 'TCH-2026-0017'
    : 'ADM-2026-0001'

  const userInitials = role === 'Student' ? 'AR' : role === 'Teacher' ? 'MK' : 'AD'

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setIsEditing(false)
    onToast('Profile records updated successfully!')
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">STUDENT & FACULTY DOSSIER</span>
          <h1 className="page-title">Profile & School Identity</h1>
          <p className="page-subtitle">
            Verified institutional identity, academic section details, and account preferences.
          </p>
        </div>
      </div>

      <div className="profile-grid-layout">
        {/* Left Side: School ID Card */}
        <div className="profile-id-card">
          <div className="profile-id-banner">
            <div>
              <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#bce3cb' }}>
                OFFICIAL IDENTITY CARD · 2026–27
              </span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
                New Ellinium School
              </h2>
            </div>
          </div>

          <div className="profile-id-content">
            <div className="profile-avatar-big">{userInitials}</div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    color: 'var(--brand-primary)',
                    textTransform: 'uppercase',
                  }}
                >
                  {role} ACCOUNT
                </span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 800 }}>
                  {name}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {isStudent
                    ? 'Class 8 · Section B · Roll No. 08'
                    : isTeacher
                    ? 'Department of Mathematics & Science'
                    : 'Institutional Leadership & Oversight'}
                </p>
              </div>

              <button
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '13px' }}
                onClick={() => setIsEditing(!isEditing)}
              >
                <Settings size={15} />
                <span>{isEditing ? 'Cancel' : 'Edit Info'}</span>
              </button>
            </div>

            {/* Profile Fields */}
            {isEditing ? (
              <form onSubmit={handleSave} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>School Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Guardian Contact Phone</label>
                  <input
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                  <Check size={16} />
                  <span>Save Changes</span>
                </button>
              </form>
            ) : (
              <div className="profile-fields-grid">
                <div className="profile-field-item">
                  <label>Institutional ID</label>
                  <strong>{schoolId}</strong>
                </div>

                <div className="profile-field-item">
                  <label>Academic Year</label>
                  <strong>2026–2027</strong>
                </div>

                <div className="profile-field-item">
                  <label>School Email</label>
                  <strong>{email}</strong>
                </div>

                <div className="profile-field-item">
                  <label>Contact Number</label>
                  <strong>{phone}</strong>
                </div>

                <div className="profile-field-item">
                  <label>Class Teacher</label>
                  <strong>Ms. Maya Kapoor</strong>
                </div>

                <div className="profile-field-item">
                  <label>Campus House</label>
                  <strong style={{ color: 'var(--brand-primary)' }}>Emerald House</strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Account Preferences & Sign Out */}
        <div className="content-panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <h2>Account Preferences</h2>
              <p>Manage security and communication channels</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="support-banner"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => onToast('Language preference set.')}
            >
              <div className="support-icon">
                <Languages size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong>Preferred Language</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>English (US) / हिन्दी</p>
              </div>
            </button>

            <button
              className="support-banner"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => onToast('Notification channels active.')}
            >
              <div className="support-icon">
                <Bell size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong>Notification Channels</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Homework, circulars, exam datesheets</p>
              </div>
            </button>

            <button
              className="support-banner"
              style={{ width: '100%', justifyContent: 'flex-start' }}
              onClick={() => onToast('Password security is up to date.')}
            >
              <div className="support-icon">
                <ShieldCheck size={18} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <strong>Security & Privacy</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>End-to-end encrypted school sessions</p>
              </div>
            </button>

            <button
              onClick={signOut}
              className="btn-secondary"
              style={{
                marginTop: '16px',
                color: 'var(--accent-rose)',
                borderColor: 'var(--accent-rose-light)',
                fontWeight: 700,
              }}
            >
              <LogOut size={16} />
              <span>Sign Out of New Ellinium School</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
