import { useState, useEffect } from 'react'
import LoginPage from './LoginPage'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './components/Dashboard'
import HomeworkPage from './components/HomeworkPage'
import ActivitiesPage from './components/ActivitiesPage'
import FridayPage from './components/FridayPage'
import ExamsPage from './components/ExamsPage'
import AttendancePage from './components/AttendancePage'
import NoticesPage from './components/NoticesPage'
import ProfilePage from './components/ProfilePage'
import ClassesPage from './components/ClassesPage'

import type { Page, Role } from './types'
import {
  initialHomeworkList,
  initialNotifications,
  recentResults,
  schoolActivities,
  schoolNotices,
  weekTimetable,
  examSchedule,
} from './data/mockData'
import { translations } from './data/translations'
import { Activity, BookOpen, CalendarDays, Check, ClipboardCheck, Home, X } from 'lucide-react'

export default function App() {
  const [role, setRole] = useState<Role>('Student')
  const [authenticated, setAuthenticated] = useState(false)
  const [isDemo, setIsDemo] = useState(true)
  const [page, setPage] = useState<Page>('Home')

  // Theme & Language
  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem('nesTheme') === 'dark'
  })
  const [hindi, setHindi] = useState(false)

  // Interactive LMS Data
  const [homework, setHomework] = useState(initialHomeworkList)
  const [activities, setActivities] = useState(schoolActivities)
  const [notices] = useState(schoolNotices)
  const [notifications, setNotifications] = useState(initialNotifications)

  // Popups & Toast
  const [notifOpen, setNotifOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    localStorage.setItem('nesTheme', dark ? 'dark' : 'light')
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])

  function showToast(msg: string) {
    setToastMessage(msg)
    window.setTimeout(() => setToastMessage(''), 3000)
  }

  async function signIn(identifier: string, password: string) {
    const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
    const res = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const data = await res.json() as { error?: string; token?: string; user?: { role: string; firstName?: string } }

    if (!res.ok || !data.token || !data.user) {
      throw new Error(data.error ?? 'Invalid school identifier or password.')
    }

    localStorage.setItem('campusToken', data.token)
    const normalizedRole = data.user.role.toLowerCase()
    if (normalizedRole === 'student') setRole('Student')
    else if (normalizedRole === 'teacher') setRole('Teacher')
    else setRole('Admin')

    setIsDemo(false)
    setAuthenticated(true)
    showToast(`Welcome back, ${data.user.firstName ?? 'Scholar'}!`)
  }

  function enterDemo(demoRole: Role) {
    setRole(demoRole)
    setIsDemo(true)
    setAuthenticated(true)
    showToast(`Exploring New Ellinium School as ${demoRole}!`)
  }

  function signOut() {
    localStorage.removeItem('campusToken')
    setAuthenticated(false)
    setIsDemo(false)
    setPage('Home')
    showToast('Signed out successfully.')
  }

  const pendingHomeworkCount = homework.filter((item) => item.status === 'To do').length
  const t = hindi ? translations.hi : translations.en

  if (!authenticated) {
    return <LoginPage signIn={signIn} enterDemo={enterDemo} />
  }

  return (
    <div className={`app-shell ${dark ? 'dark' : ''}`}>
      {/* Desktop Sidebar */}
      <Sidebar
        page={page}
        setPage={(p) => {
          setPage(p)
          setMenuOpen(false)
        }}
        role={role}
        hindi={hindi}
        pendingHomeworkCount={pendingHomeworkCount}
      />

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div className="mobile-drawer-overlay open" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="school-crest" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                  N
                </div>
                <strong style={{ fontSize: '16px' }}>New Ellinium School</strong>
              </div>
              <button onClick={() => setMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {(
                [
                  'Home',
                  'Homework',
                  'Activities',
                  'Friday Special',
                  'Exams',
                  'Attendance',
                  'Notices',
                  'Profile',
                  ...(role !== 'Student' ? ['Classes' as Page] : []),
                ] as Page[]
              ).map((p) => (
                <button
                  key={p}
                  className={`nav-link ${page === p ? 'active' : ''}`}
                  onClick={() => {
                    setPage(p)
                    setMenuOpen(false)
                  }}
                >
                  <span>{p}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Wrapper */}
      <div className="main-wrapper">
        <Topbar
          page={page}
          role={role}
          setRole={setRole}
          isDemo={isDemo}
          dark={dark}
          setDark={setDark}
          hindi={hindi}
          setHindi={setHindi}
          notifications={notifications}
          setNotifications={setNotifications}
          notifOpen={notifOpen}
          setNotifOpen={setNotifOpen}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          onOpenProfile={() => setPage('Profile')}
        />

        <main className="content-area">
          {page === 'Home' && (
            <Dashboard
              role={role}
              setPage={setPage}
              homework={homework}
              timetable={weekTimetable}
              hindi={hindi}
            />
          )}

          {page === 'Homework' && (
            <HomeworkPage
              items={homework}
              setItems={setHomework}
              role={role}
              hindi={hindi}
              onToast={showToast}
            />
          )}

          {page === 'Activities' && (
            <ActivitiesPage
              activities={activities}
              setActivities={setActivities}
              role={role}
              onToast={showToast}
            />
          )}

          {page === 'Friday Special' && (
            <FridayPage role={role} onToast={showToast} />
          )}

          {page === 'Exams' && (
            <ExamsPage
              exams={examSchedule}
              results={recentResults}
              role={role}
              onToast={showToast}
            />
          )}

          {page === 'Attendance' && <AttendancePage role={role} />}

          {page === 'Notices' && (
            <NoticesPage notices={notices} role={role} onToast={showToast} />
          )}

          {page === 'Profile' && (
            <ProfilePage role={role} signOut={signOut} onToast={showToast} />
          )}

          {page === 'Classes' && <ClassesPage onToast={showToast} />}
        </main>

        {/* Footer */}
        <footer
          style={{
            borderTop: '1px solid var(--border-light)',
            padding: '20px 36px',
            marginTop: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span>{t.copyright}</span>
          <span>Knowledge · Integrity · Excellence</span>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-bar" aria-label="Bottom Navigation">
        <button
          className={`mobile-nav-btn ${page === 'Home' ? 'active' : ''}`}
          onClick={() => setPage('Home')}
        >
          <Home size={19} />
          <span>Home</span>
        </button>

        <button
          className={`mobile-nav-btn ${page === 'Homework' ? 'active' : ''}`}
          onClick={() => setPage('Homework')}
        >
          <BookOpen size={19} />
          <span>Homework</span>
        </button>

        <button
          className={`mobile-nav-btn ${page === 'Activities' ? 'active' : ''}`}
          onClick={() => setPage('Activities')}
        >
          <Activity size={19} />
          <span>Activities</span>
        </button>

        <button
          className={`mobile-nav-btn ${page === 'Friday Special' ? 'active' : ''}`}
          onClick={() => setPage('Friday Special')}
        >
          <CalendarDays size={19} />
          <span>Friday</span>
        </button>

        <button
          className={`mobile-nav-btn ${page === 'Exams' ? 'active' : ''}`}
          onClick={() => setPage('Exams')}
        >
          <ClipboardCheck size={19} />
          <span>Exams</span>
        </button>
      </nav>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container">
          <Check size={18} color="#22c55e" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
