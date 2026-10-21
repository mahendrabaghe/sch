import { 
  ArrowRight, 
  Bell, 
  BookOpen, 
  CalendarDays, 
  ChevronRight, 
  Clock, 
  Sparkles, 
  Trophy, 
  UserCheck 
} from 'lucide-react'
import type { HomeworkItem, Page, Role, TimetableLesson } from '../types'
import { translations } from '../data/translations'

interface DashboardProps {
  role: Role
  setPage: (p: Page) => void
  homework: HomeworkItem[]
  timetable: TimetableLesson[]
  hindi: boolean
}

export default function Dashboard({ role, setPage, homework, timetable, hindi }: DashboardProps) {
  const t = hindi ? translations.hi : translations.en
  const isStudent = role === 'Student'
  const isTeacher = role === 'Teacher'

  const pendingHomework = homework.filter((item) => item.status === 'To do')

  const greeting = isStudent
    ? t.greetingStudent
    : isTeacher
    ? t.greetingTeacher
    : t.greetingAdmin

  const subGreeting = isStudent
    ? t.subGreetingStudent
    : isTeacher
    ? t.subGreetingTeacher
    : t.subGreetingAdmin

  return (
    <div>
      {/* Top Page Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">
            {isStudent ? 'STUDENT LEARNING DASHBOARD' : isTeacher ? 'FACULTY & TEACHING SPACE' : 'ADMINISTRATIVE OVERVIEW'}
          </span>
          <h1 className="page-title">{greeting}</h1>
          <p className="page-subtitle">{subGreeting}</p>
        </div>

        <div className="date-indicator-badge">
          <CalendarDays size={16} color="var(--brand-primary)" />
          <span>Wednesday, October 15, 2026</span>
        </div>
      </div>

      {/* Hero Welcome Banner */}
      <div className="welcome-hero">
        <div className="welcome-hero-content">
          <span className="welcome-tag">
            <Sparkles size={14} />
            <span>{t.bannerKickerStudent}</span>
          </span>

          <h2>{t.bannerTitleStudent}</h2>
          <p>{t.bannerTextStudent}</p>

          <button
            className="hero-action-btn"
            onClick={() => setPage(isStudent ? 'Homework' : 'Classes')}
          >
            <span>{isStudent ? t.seeDue : t.openClasses}</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="hero-shapes" aria-hidden="true">
          <div className="shape-circle" />
          <div className="shape-badge">
            <Trophy size={18} color="#fde047" />
            <span>Rank 1 in Class 8B</span>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="stats-grid">
        <div
          className="stat-card-modern"
          onClick={() => setPage('Homework')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon-wrapper emerald">
            <BookOpen size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">{t.statHomeworkDue}</span>
            <strong className="stat-value">{pendingHomework.length}</strong>
            <span className="stat-subtext">2 due by tomorrow</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div
          className="stat-card-modern"
          onClick={() => setPage('Exams')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon-wrapper amber">
            <CalendarDays size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">{t.statNextExam}</span>
            <strong className="stat-value">Oct 24</strong>
            <span className="stat-subtext">Science & Tech · 9 days</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div
          className="stat-card-modern"
          onClick={() => setPage('Attendance')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon-wrapper sky">
            <UserCheck size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">{t.statAttendance}</span>
            <strong className="stat-value">96%</strong>
            <span className="stat-subtext">48 of 50 days present</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>

        <div
          className="stat-card-modern"
          onClick={() => setPage('Notices')}
          role="button"
          tabIndex={0}
        >
          <div className="stat-icon-wrapper purple">
            <Bell size={22} />
          </div>
          <div className="stat-data">
            <span className="stat-label">{t.statNotices}</span>
            <strong className="stat-value">4 New</strong>
            <span className="stat-subtext">Diwali circular released</span>
          </div>
          <ChevronRight size={18} color="var(--text-muted)" />
        </div>
      </div>

      {/* 2-Column Main Dashboard Layout */}
      <div className="dashboard-two-col">
        {/* Left Column: Schedule & Upcoming Activities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Timetable Panel */}
          <div className="content-panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <h2>{t.todaySchedule}</h2>
                <p>{t.timetableSubtitle}</p>
              </div>
              <button className="panel-header-link" onClick={() => setPage('Attendance')}>
                <span>{t.fullWeek}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="timetable-list">
              {timetable.map((lesson) => (
                <div
                  key={lesson.subject}
                  className={`timetable-card ${lesson.now ? 'now' : ''}`}
                >
                  <div className="time-slot">
                    <span>{lesson.time}</span>
                    <small>{lesson.end}</small>
                  </div>

                  <div className="time-divider" />

                  <div className="lesson-info">
                    <strong>{lesson.subject}</strong>
                    <small>{lesson.room} · {lesson.teacher}</small>
                  </div>

                  {lesson.now ? (
                    <span className="now-pill">NOW ACTIVE</span>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      45m
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activities Teaser */}
          <div className="content-panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <h2>{t.comingEvents}</h2>
                <p>{t.eventsSubtitle}</p>
              </div>
              <button className="panel-header-link" onClick={() => setPage('Activities')}>
                <span>{t.allActivities}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div
              className="hw-row-card"
              onClick={() => setPage('Activities')}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className="hw-subject-icon emerald">🚀</div>
              <div className="hw-details">
                <strong>Young Innovators & Science Fair 2026</strong>
                <small>Saturday, Oct 18 · School Main Auditorium · Open for registration</small>
              </div>
              <span className="badge-status submitted">REGISTERED</span>
            </div>

            <div
              className="hw-row-card"
              onClick={() => setPage('Activities')}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <div className="hw-subject-icon amber">🎨</div>
              <div className="hw-details">
                <strong>Inter-House Canvas & Poster Making Contest</strong>
                <small>Wednesday, Oct 22 · Art Studio · Theme: Our Shared Earth</small>
              </div>
              <span className="badge-status todo">OPEN</span>
            </div>
          </div>
        </div>

        {/* Right Column: Homework Quick Review & Friday Assembly */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Homework Glance Panel */}
          <div className="content-panel">
            <div className="panel-header">
              <div className="panel-header-title">
                <h2>{t.homeworkGlance}</h2>
                <p>{t.homeworkSubtitle}</p>
              </div>
              <button className="panel-header-link" onClick={() => setPage('Homework')}>
                <span>{t.viewAll}</span>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="homework-glance-list">
              {pendingHomework.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="hw-row-card"
                  onClick={() => setPage('Homework')}
                  role="button"
                  tabIndex={0}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`hw-subject-icon ${item.color}`}>{item.icon}</div>
                  <div className="hw-details">
                    <strong>{item.title}</strong>
                    <small>{item.subject} · Due {item.due}</small>
                  </div>
                  <span className="badge-status todo">To do</span>
                </div>
              ))}

              {pendingHomework.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                  Great job! You have completed all assignments for today.
                </p>
              )}
            </div>
          </div>

          {/* Friday Assembly Featured Card */}
          <div className="assembly-banner">
            <span className="assembly-tagline">{t.fridayTitle}</span>
            <h3>Kindness costs nothing, shares everything.</h3>
            <p>
              Join us for a morning of reflection, music by the New Ellinium Choir,
              and thought-provoking student presentations.
            </p>
            <div className="assembly-meta">
              <span>{t.assemblyTime}</span>
              <button
                onClick={() => setPage('Friday Special')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 800,
                  color: 'inherit',
                }}
              >
                <span>{t.explore}</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
