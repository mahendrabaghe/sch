import { useState } from 'react'
import { CalendarDays, Check, ChevronRight, MapPin, Plus, Sparkles, Users } from 'lucide-react'
import type { ActivityItem, Role } from '../types'

interface ActivitiesPageProps {
  activities: ActivityItem[]
  setActivities: React.Dispatch<React.SetStateAction<ActivityItem[]>>
  role: Role
  onToast: (msg: string) => void
}

export default function ActivitiesPage({
  activities,
  setActivities,
  role,
  onToast,
}: ActivitiesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const isStudent = role === 'Student'

  const categories = ['All', 'STEM & INNOVATION', 'CREATIVE ARTS', 'ATHLETICS & SPORTS', 'ENVIRONMENT CLUB']

  const filtered = selectedCategory === 'All'
    ? activities
    : activities.filter((act) => act.category === selectedCategory)

  function toggleRegistration(id: string) {
    setActivities((prev) =>
      prev.map((act) => {
        if (act.id === id) {
          const nextState = !act.registered
          onToast(
            nextState
              ? `Registered for "${act.title}"!`
              : `Withdrawn registration for "${act.title}".`
          )
          return { ...act, registered: nextState }
        }
        return act
      })
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">COMMUNITY & CLUBS</span>
          <h1 className="page-title">School Activities & Events</h1>
          <p className="page-subtitle">
            Explore sports, robotics, creative arts, and leadership activities at New Ellinium School.
          </p>
        </div>

        {!isStudent && (
          <button
            className="btn-primary"
            onClick={() => onToast('Activity creation form opened.')}
          >
            <Plus size={18} />
            <span>Post New Activity</span>
          </button>
        )}
      </div>

      {/* Featured Big Activity Banner */}
      <div
        className="welcome-hero"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
          marginBottom: '32px',
        }}
      >
        <div className="welcome-hero-content">
          <span className="welcome-tag" style={{ color: '#93c5fd' }}>
            <Sparkles size={14} />
            <span>ANNUAL INTER-SCHOOL COMPETITION</span>
          </span>
          <h2>Young Innovators & STEM Science Fair 2026</h2>
          <p>
            Build your prototypes, automate real-world solutions, and present before distinguished
            scientists and innovators. Open to all students from Classes 6 to 10.
          </p>
          <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#bfdbfe', margin: '4px 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CalendarDays size={16} /> Saturday, Oct 18 · 9:00 AM
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} /> New Ellinium School Main Auditorium
            </span>
          </div>
          <button
            className="hero-action-btn"
            style={{ color: '#1e3a8a' }}
            onClick={() => toggleRegistration('act-1')}
          >
            {activities.find((a) => a.id === 'act-1')?.registered ? (
              <>
                <Check size={16} />
                <span>You Are Registered</span>
              </>
            ) : (
              <>
                <span>Register for Science Fair</span>
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="toolbar-wrap" style={{ marginBottom: '24px' }}>
        <div className="segmented-control">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`segment-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      <div className="activities-grid">
        {filtered.map((item) => (
          <article className="activity-card-large" key={item.id}>
            <div className={`activity-card-banner ${item.color}`}>
              <span className="activity-banner-icon">{item.icon}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(4px)',
                }}
              >
                {item.eligibility}
              </span>
            </div>

            <div className="activity-card-body">
              <span className="activity-category-tag">{item.category}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>

              <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <CalendarDays size={14} />
                  {item.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} />
                  {item.venue}
                </span>
              </div>

              <div className="activity-card-footer">
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} />
                  {item.registered ? '1 Student Registered (You)' : 'Open for Registration'}
                </span>

                <button
                  className={item.registered ? 'btn-secondary' : 'btn-primary'}
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => toggleRegistration(item.id)}
                >
                  {item.registered ? (
                    <>
                      <Check size={14} />
                      <span>Registered</span>
                    </>
                  ) : (
                    <>
                      <span>Join Activity</span>
                      <ChevronRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
