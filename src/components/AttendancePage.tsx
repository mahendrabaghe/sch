import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Role } from '../types'

interface AttendancePageProps {
  role: Role
}

export default function AttendancePage({ role }: AttendancePageProps) {
  const [selectedDay, setSelectedDay] = useState<number>(15)

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // October 2026 dates (starts on Thursday, Oct 1 = column index 3)
  const calendarCells = Array.from({ length: 35 }, (_, i) => {
    const dayNum = i - 2
    return dayNum > 0 && dayNum <= 31 ? dayNum : null
  })

  // Simulated status: 5 and 12 were absent, up to 15 is present, weekends off
  function getDayStatus(day: number | null, index: number) {
    if (!day) return 'empty'
    const col = index % 7
    if (col === 5 || col === 6) return 'weekend'
    if (day > 15) return 'upcoming'
    if (day === 5 || day === 12) return 'absent'
    return 'present'
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">RECORD OF PARTICIPATION</span>
          <h1 className="page-title">Daily Attendance Tracker</h1>
          <p className="page-subtitle">
            {role === 'Student'
              ? 'Track your monthly consistency, presence streaks, and verified class hours.'
              : 'Class 8-B attendance roster and term consistency overview.'}
          </p>
        </div>
      </div>

      {/* Top Metric Header Card */}
      <div className="attendance-header-card">
        <div className="attendance-metric-block">
          <div className="attendance-pie-badge">96%</div>
          <div>
            <strong style={{ fontSize: '18px', display: 'block', marginBottom: '2px' }}>
              Exceptional Presence Streak!
            </strong>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Aarav has been present for 48 of 50 school sessions this term.
            </span>
          </div>
        </div>

        <div className="attendance-breakdown">
          <div className="att-stat-item">
            <span>PRESENT DAYS</span>
            <strong style={{ color: 'var(--brand-primary)' }}>48</strong>
          </div>
          <div className="att-stat-item">
            <span>ABSENCES</span>
            <strong style={{ color: 'var(--accent-rose)' }}>2</strong>
          </div>
          <div className="att-stat-item">
            <span>LATE ARRIVALS</span>
            <strong style={{ color: 'var(--accent-amber)' }}>0</strong>
          </div>
        </div>
      </div>

      {/* Calendar Panel */}
      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-header-title">
            <h2>October 2026 Academic Calendar</h2>
            <p>Click any date to view lesson attendance and roll call details</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="action-icon-btn" style={{ width: '34px', height: '34px' }} aria-label="Previous month">
              <ChevronLeft size={16} />
            </button>
            <button className="action-icon-btn" style={{ width: '34px', height: '34px' }} aria-label="Next month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-month-grid">
          {weekdays.map((w) => (
            <div key={w} className="cal-weekday">
              {w}
            </div>
          ))}

          {calendarCells.map((day, idx) => {
            const status = getDayStatus(day, idx)
            const isToday = day === 15
            const isSelected = day === selectedDay

            if (!day) {
              return <div key={`empty-${idx}`} style={{ opacity: 0 }} />
            }

            return (
              <button
                key={`day-${day}`}
                className={`cal-day-cell ${status} ${isToday ? 'today' : ''}`}
                style={{
                  border: isSelected ? '2px solid var(--text-primary)' : undefined,
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedDay(day)}
              >
                <span>{day}</span>
                {status === 'present' && (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--brand-primary)',
                    }}
                  />
                )}
                {status === 'absent' && (
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-rose)',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected Day Details Card */}
        <div
          style={{
            marginTop: '18px',
            padding: '16px 20px',
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarDays size={20} color="var(--brand-primary)" />
            <div>
              <strong>Record for Wednesday, October {selectedDay}, 2026</strong>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {selectedDay === 15
                  ? 'Present · Clocked in at 07:48 AM · Attended morning prayer & 4 periods'
                  : selectedDay === 5 || selectedDay === 12
                  ? 'Absent · Medical leave excused by guardian'
                  : selectedDay > 15
                  ? 'Scheduled academic day'
                  : 'Present · 100% period attendance verified by Ms. Maya Kapoor'}
              </p>
            </div>
          </div>

          <span
            className={`badge-status ${
              selectedDay === 5 || selectedDay === 12
                ? 'todo'
                : selectedDay > 15
                ? 'graded'
                : 'submitted'
            }`}
          >
            {selectedDay === 5 || selectedDay === 12
              ? 'Medical Leave'
              : selectedDay > 15
              ? 'Scheduled'
              : 'Verified Present'}
          </span>
        </div>
      </div>
    </div>
  )
}
