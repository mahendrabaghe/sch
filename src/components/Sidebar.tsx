import { 
  Activity, 
  Bell, 
  BookOpen, 
  CalendarDays, 
  ChevronRight, 
  CircleHelp, 
  ClipboardCheck, 
  Home, 
  Users 
} from 'lucide-react'
import type { Page, Role } from '../types'
import { translations } from '../data/translations'

interface SidebarProps {
  page: Page
  setPage: (p: Page) => void
  role: Role
  hindi: boolean
  pendingHomeworkCount: number
}

export default function Sidebar({ page, setPage, role, hindi, pendingHomeworkCount }: SidebarProps) {
  const t = hindi ? translations.hi : translations.en
  const isStaff = role !== 'Student'

  const mainNav: { id: Page; label: string; icon: typeof Home; count?: number }[] = [
    { id: 'Home', label: t.home, icon: Home },
    { id: 'Homework', label: t.homework, icon: BookOpen, count: pendingHomeworkCount },
    { id: 'Activities', label: t.activities, icon: Activity },
    { id: 'Friday Special', label: t.fridaySpecial, icon: CalendarDays },
    { id: 'Exams', label: t.exams, icon: ClipboardCheck },
  ]

  const schoolNav: { id: Page; label: string; icon: typeof Home }[] = [
    { id: 'Attendance', label: t.attendance, icon: ClipboardCheck },
    { id: 'Notices', label: t.notices, icon: Bell },
    ...(isStaff ? [{ id: 'Classes' as Page, label: t.classes, icon: Users }] : []),
  ]

  const userInitials = role === 'Student' ? 'AR' : role === 'Teacher' ? 'MK' : 'AD'
  const userName = role === 'Student' ? 'Aarav Rao' : role === 'Teacher' ? 'Maya Kapoor' : 'School Admin'

  return (
    <aside className="sidebar">
      {/* Brand & Crest */}
      <div className="school-brand">
        <div className="school-crest">N</div>
        <div className="school-brand-text">
          <span className="school-brand-title">New Ellinium</span>
          <span className="school-brand-tagline">Academic Portal</span>
        </div>
      </div>

      {/* School Campus Pill */}
      <div className="campus-pill">
        <div className="campus-pill-info">
          <span className="campus-pill-name">New Ellinium School</span>
          <span className="campus-pill-class">Class 8 · Section B</span>
        </div>
        <span className="campus-badge">2026–27</span>
      </div>

      {/* Main Learning Navigation */}
      <span className="nav-section-title">{t.navLearn}</span>
      <nav className="sidebar-nav" aria-label="Main Navigation">
        {mainNav.map((item) => {
          const Icon = item.icon
          const isActive = page === item.id
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
              {Boolean(item.count) && <span className="nav-link-badge">{item.count}</span>}
            </button>
          )
        })}
      </nav>

      {/* School Operations Navigation */}
      <span className="nav-section-title spaced">{t.navSchool}</span>
      <nav className="sidebar-nav" aria-label="School Navigation">
        {schoolNav.map((item) => {
          const Icon = item.icon
          const isActive = page === item.id
          return (
            <button
              key={item.id}
              className={`nav-link ${isActive ? 'active' : ''}`}
              onClick={() => setPage(item.id)}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button className="support-banner" onClick={() => setPage('Notices')}>
          <div className="support-icon">
            <CircleHelp size={18} />
          </div>
          <div>
            <strong>Need Assistance?</strong>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Helpdesk & circulars</p>
          </div>
          <ChevronRight size={15} style={{ marginLeft: 'auto', color: 'var(--text-muted)' }} />
        </button>

        <button className="sidebar-user" onClick={() => setPage('Profile')}>
          <div className="user-avatar">{userInitials}</div>
          <div className="user-details">
            <span className="user-name">{userName}</span>
            <span className="user-role-label">{role} Account</span>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>
      </div>
    </aside>
  )
}
