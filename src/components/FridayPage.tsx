import { useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock, Music, Sparkles, User, Volume2 } from 'lucide-react'
import type { Role } from '../types'

interface FridayPageProps {
  role: Role
  onToast: (msg: string) => void
}

export default function FridayPage({ role, onToast }: FridayPageProps) {
  const [selectedWeek, setSelectedWeek] = useState(17)

  const programTimeline = [
    {
      time: '08:00 AM',
      type: 'WELCOME & OPENING',
      title: 'Principal’s Address & Welcome Remarks',
      speaker: 'Head of School, New Ellinium',
      icon: Volume2,
    },
    {
      time: '08:05 AM',
      type: 'THOUGHT FOR THE DAY',
      title: 'Kindness Costs Nothing, Shares Everything',
      speaker: 'Aarav Rao, Class 8B',
      icon: Sparkles,
    },
    {
      time: '08:12 AM',
      type: 'CHORAL PRESENTATION',
      title: 'Harmony of Hope — New Ellinium Vocal Choir',
      speaker: 'Junior Choir (Classes 6–8)',
      icon: Music,
    },
    {
      time: '08:22 AM',
      type: 'CAMPUS SPOTLIGHT',
      title: 'Weekly Achievements, Sports Medals & Honor Roll',
      speaker: 'Student Prefect Council',
      icon: User,
    },
    {
      time: '08:32 AM',
      type: 'INTERACTIVE CHALLENGE',
      title: 'Thought-in-Action Weekly School Quiz',
      speaker: 'Open to All Houses',
      icon: Sparkles,
    },
  ]

  const pastAssemblies = [
    { day: 17, title: 'Kindness Costs Nothing', host: 'Class 8B', theme: 'Empathy & Community' },
    { day: 10, title: 'Courage to Explore', host: 'Class 9A', theme: 'Science & Discovery' },
    { day: 3, title: 'The Power of Small Habits', host: 'Class 7C', theme: 'Personal Growth' },
  ]

  const activeArchive = pastAssemblies.find((a) => a.day === selectedWeek) ?? pastAssemblies[0]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">COMMUNITY TRADITION</span>
          <h1 className="page-title">Friday Special Assembly</h1>
          <p className="page-subtitle">
            Every Friday morning, New Ellinium School gathers in the central courtyard to reflect, celebrate, and inspire.
          </p>
        </div>

        {role !== 'Student' && (
          <button
            className="btn-primary"
            onClick={() => onToast('Assembly planner editor opened.')}
          >
            <span>Plan Next Assembly</span>
          </button>
        )}
      </div>

      {/* Hero Presentation */}
      <div className="assembly-banner" style={{ padding: '36px', marginBottom: '32px' }}>
        <span className="assembly-tagline">
          SPECIAL MORNING THEME · FRIDAY, OCTOBER 17, 2026
        </span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800 }}>
          Kindness costs nothing, shares everything.
        </h2>
        <p style={{ maxWidth: '640px', fontSize: '15px' }}>
          One kind gesture creates ripples that transform classrooms, corridors, and lives.
          Let us celebrate empathy, collaboration, and mutual support across New Ellinium School.
        </p>

        <div style={{ display: 'flex', gap: '20px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <CalendarDays size={16} /> Friday, Oct 17 · 8:00 AM – 8:40 AM
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
            <Clock size={16} /> Central Courtyard & Amphitheatre
          </span>
        </div>
      </div>

      {/* Program Schedule & Past Assemblies */}
      <div className="dashboard-two-col">
        {/* Schedule */}
        <div className="content-panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <h2>Order of Morning Events</h2>
              <p>October 17 Schedule · Running time 40 minutes</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {programTimeline.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.title}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '14px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--brand-light)',
                      color: 'var(--brand-primary)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={20} />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)', letterSpacing: '0.04em' }}>
                      {item.type} · {item.time}
                    </span>
                    <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                      {item.title}
                    </strong>
                    <small style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      {item.speaker}
                    </small>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Past Assembly Archive */}
        <div className="content-panel">
          <div className="panel-header">
            <div className="panel-header-title">
              <h2>Assembly Archive</h2>
              <p>Revisit reflections from previous weeks</p>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                className="action-icon-btn"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setSelectedWeek(selectedWeek === 17 ? 10 : 3)}
                aria-label="Previous assembly"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="action-icon-btn"
                style={{ width: '32px', height: '32px' }}
                onClick={() => setSelectedWeek(selectedWeek === 3 ? 10 : 17)}
                aria-label="Next assembly"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div
            style={{
              padding: '24px',
              backgroundColor: 'var(--bg-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--brand-primary)' }}>
              OCTOBER {activeArchive.day}, 2026
            </span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800 }}>
              {activeArchive.title}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Core Theme: <strong>{activeArchive.theme}</strong>. Curated and presented by{' '}
              {activeArchive.host}.
            </p>

            <button
              className="btn-primary"
              style={{ width: 'fit-content', marginTop: '8px' }}
              onClick={() => onToast(`Opened archival footage & notes for Oct ${activeArchive.day}.`)}
            >
              <span>View Assembly Recording</span>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
