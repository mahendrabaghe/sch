import { useRef, useEffect } from 'react'
import { Bell, ChevronDown, ChevronRight, Languages, Menu, Moon, Sun, X } from 'lucide-react'
import type { NotificationItem, Page, Role } from '../types'

interface TopbarProps {
  page: Page
  role: Role
  setRole: (r: Role) => void
  isDemo: boolean
  dark: boolean
  setDark: (d: boolean) => void
  hindi: boolean
  setHindi: (h: boolean) => void
  notifications: NotificationItem[]
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>
  notifOpen: boolean
  setNotifOpen: (open: boolean) => void
  menuOpen: boolean
  setMenuOpen: (open: boolean) => void
  onOpenProfile: () => void
}

export default function Topbar({
  page,
  role,
  setRole,
  isDemo,
  dark,
  setDark,
  hindi,
  setHindi,
  notifications,
  setNotifications,
  notifOpen,
  setNotifOpen,
  menuOpen,
  setMenuOpen,
  onOpenProfile,
}: TopbarProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const unreadCount = notifications.filter((n) => n.unread).length
  const userInitials = role === 'Student' ? 'AR' : role === 'Teacher' ? 'MK' : 'AD'

  // Close notifications when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [notifOpen, setNotifOpen])

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumbs">
          <span>New Ellinium Portal</span>
          <ChevronRight size={14} />
          <strong>{page}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        {/* Role Switcher Pill */}
        <div className="role-badge-selector">
          <span className="role-pulse" />
          <select
            value={role}
            disabled={!isDemo}
            onChange={(e) => setRole(e.target.value as Role)}
            aria-label="Select demo role"
          >
            <option value="Student">Student (Aarav)</option>
            <option value="Teacher">Teacher (Ms. Maya)</option>
            <option value="Admin">Admin (School)</option>
          </select>
          {isDemo && <ChevronDown size={14} color="var(--text-muted)" />}
        </div>

        {/* Language Switcher */}
        <button
          className="action-icon-btn"
          onClick={() => setHindi(!hindi)}
          title="Toggle English / हिन्दी"
          aria-label="Toggle language"
        >
          <Languages size={18} />
          <span className="lang-pill-text">{hindi ? 'हि' : 'EN'}</span>
        </button>

        {/* Theme Switcher */}
        <button
          className="action-icon-btn"
          onClick={() => setDark(!dark)}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={19} color="#facc15" /> : <Moon size={19} />}
        </button>

        {/* Notifications Popover */}
        <div style={{ position: 'relative' }} ref={popoverRef}>
          <button
            className="action-icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && <span className="unread-dot" />}
          </button>

          {notifOpen && (
            <div className="notif-popover">
              <div className="notif-header">
                <h3>Notifications ({unreadCount})</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 700 }}
                    >
                      Mark all read
                    </button>
                  )}
                  <button onClick={() => setNotifOpen(false)} aria-label="Close">
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="notif-list">
                {notifications.map((item) => (
                  <div key={item.id} className={`notif-item ${item.unread ? 'unread' : ''}`}>
                    <span className="notif-dot" />
                    <div className="notif-content">
                      <span className="notif-title">{item.title}</span>
                      <span className="notif-time">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar Profile Quick Link */}
        <button
          className="user-avatar"
          onClick={onOpenProfile}
          title="Open Profile"
          aria-label="Open Profile"
          style={{ width: '38px', height: '38px', fontSize: '13px' }}
        >
          {userInitials}
        </button>
      </div>
    </header>
  )
}
