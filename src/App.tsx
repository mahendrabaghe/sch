import { useMemo, useRef, useState } from 'react'
import LoginPage from './LoginPage'
import {
  Activity, Bell, BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, ClipboardCheck, Clock3, CloudUpload, FileText, GraduationCap, Home,
  Languages, LogOut, Menu, Moon, MoreHorizontal, Plus, Search,
  Settings, ShieldCheck, Sun, Users, X,
} from 'lucide-react'

type Role = 'Student' | 'Teacher' | 'Admin'
type Page = 'Home' | 'Homework' | 'Activities' | 'Friday Special' | 'Exams' | 'Attendance' | 'Notices' | 'Profile' | 'Classes'

type HomeworkItem = {
  subject: string
  title: string
  due: string
  status: 'To do' | 'Submitted' | 'Graded'
  color: string
  icon: string
  detail: string
  mark?: string
}

const initialHomework: HomeworkItem[] = [
  { subject: 'Mathematics', title: 'Fractions practice — worksheet 4', due: 'Today, 8:00 PM', status: 'To do', color: 'mint', icon: '∑', detail: 'Complete questions 1–12. Show your working for each answer.' },
  { subject: 'English', title: 'A letter to my future self', due: 'Tomorrow', status: 'To do', color: 'peach', icon: 'Aa', detail: 'Write 150–200 words. Remember to include a greeting and sign-off.' },
  { subject: 'Science', title: 'Parts of a flowering plant', due: 'Oct 20', status: 'Submitted', color: 'blue', icon: '✳', detail: 'Label the diagram and write one function for each part.' },
  { subject: 'Hindi', title: 'कविता का सारांश', due: 'Oct 22', status: 'Graded', color: 'lilac', icon: 'अ', detail: 'Write a short summary of the poem from chapter 6.', mark: '9 / 10' },
]

const navItems: { page: Page; icon: typeof Home }[] = [
  { page: 'Home', icon: Home },
  { page: 'Homework', icon: BookOpen },
  { page: 'Activities', icon: Activity },
  { page: 'Friday Special', icon: CalendarDays },
  { page: 'Exams', icon: ClipboardCheck },
]

const timetable = [
  { time: '08:00', end: '08:45', subject: 'Mathematics', room: 'Room 204', color: 'mint', now: true },
  { time: '08:50', end: '09:35', subject: 'English', room: 'Room 204', color: 'peach' },
  { time: '09:50', end: '10:35', subject: 'Science', room: 'Lab 1', color: 'blue' },
  { time: '10:40', end: '11:25', subject: 'Hindi', room: 'Room 204', color: 'lilac' },
]

function App() {
  const [role, setRole] = useState<Role>('Student')
  const [authenticated, setAuthenticated] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [page, setPage] = useState<Page>('Home')
  const [homework, setHomework] = useState(initialHomework)
  const [dark, setDark] = useState(false)
  const [hindi, setHindi] = useState(false)
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [toast, setToast] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const isStaff = role !== 'Student'

  async function signIn(identifier: string, password: string) {
    const response = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    })
    const result = await response.json() as { error?: string; token?: string; user?: { role: string } }
    if (!response.ok || !result.token || !result.user) throw new Error(result.error ?? 'Unable to sign in.')
    localStorage.setItem('campusToken', result.token)
    if (!['student', 'teacher', 'admin'].includes(result.user.role)) throw new Error('This account role is not available in the current client.')
    setRole(result.user.role.charAt(0).toUpperCase() + result.user.role.slice(1) as Role)
    setIsDemo(false)
    setAuthenticated(true)
  }

  function enterDemo(demoRole: Role) {
    setRole(demoRole)
    setIsDemo(true)
    setAuthenticated(true)
  }

  function signOut() {
    localStorage.removeItem('campusToken')
    setAuthenticated(false)
    setIsDemo(false)
  }

  const filteredHomework = useMemo(() => homework.filter((item) =>
    `${item.subject} ${item.title} ${item.status}`.toLowerCase().includes(query.toLowerCase())), [homework, query])

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  function uploadHomework(index: number) {
    if (fileInput.current) {
      fileInput.current.dataset.index = String(index)
      fileInput.current.click()
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    const index = Number(event.target.dataset.index)
    if (!file || Number.isNaN(index)) return
    if (file.size > 10 * 1024 * 1024) {
      showToast('File must be smaller than 10 MB')
      event.target.value = ''
      return
    }
    setHomework((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, status: 'Submitted' } : item))
    showToast(`${file.name} submitted successfully`)
    event.target.value = ''
  }

  const go = (next: Page) => {
    setPage(next)
    setMenuOpen(false)
  }

  if (!authenticated) {
    return <LoginPage signIn={signIn} enterDemo={enterDemo} />
  }

  return (
    <div className={dark ? 'app-shell dark' : 'app-shell'}>
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={(event) => { event.preventDefault(); go('Home') }}>
          <span className="brand-mark"><GraduationCap size={22} strokeWidth={2.2} /></span>
          <span className="brand-copy"><strong>campus</strong><small>LEARNING, TOGETHER</small></span>
        </a>
        <div className="school-switch"><div className="school-emblem">S</div><div><strong>Sunrise Public School</strong><small>Class 8 · Section B</small></div><ChevronDown size={15} /></div>
        <p className="nav-label">LEARN</p>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ page: item, icon: Icon }) => <button key={item} className={page === item ? 'nav-item active' : 'nav-item'} onClick={() => go(item)}><Icon size={18} /><span>{item}</span>{item === 'Homework' && <span className="nav-count">2</span>}</button>)}
        </nav>
        <p className="nav-label more-label">YOUR SCHOOL</p>
        <nav className="side-nav" aria-label="School navigation">
          {([{ page: 'Attendance' as Page, icon: ClipboardCheck }, { page: 'Notices' as Page, icon: Bell }, ...(isStaff ? [{ page: 'Classes' as Page, icon: Users }] : [])]).map(({ page: item, icon: Icon }) => <button key={item} className={page === item ? 'nav-item active' : 'nav-item'} onClick={() => go(item)}><Icon size={18} /><span>{item}</span></button>)}
        </nav>
        <div className="sidebar-bottom"><div className="help-box"><span className="help-icon"><CircleHelp size={17} /></span><span><strong>Need a hand?</strong><small>We're here to help</small></span><ChevronRight size={15} /></div><button className="profile-mini" onClick={() => go('Profile')}><div className="avatar avatar-green">{role === 'Student' ? 'AR' : role === 'Teacher' ? 'MK' : 'AD'}</div><span><strong>{role === 'Student' ? 'Aarav Rao' : role === 'Teacher' ? 'Maya Kapoor' : 'School Admin'}</strong><small>{role} account</small></span><MoreHorizontal size={18} /></button></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={21} /></button>
          <div className="breadcrumb"><span>My learning</span><ChevronRight size={14} /><strong>{page}</strong></div>
          <div className="top-actions">
            <label className="role-select"><span className="role-dot" /><select value={role} disabled={!isDemo} onChange={(event) => { setRole(event.target.value as Role); setPage('Home') }} aria-label={isDemo ? 'Preview role' : 'Current role'}><option>Student</option><option>Teacher</option><option>Admin</option></select><ChevronDown size={14} /></label>
            <button className="icon-button language-button" aria-label="Change language" title="English / हिन्दी" onClick={() => setHindi(!hindi)}><Languages size={18} /><span>{hindi ? 'हि' : 'EN'}</span></button>
            <button className="icon-button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title="Toggle theme" onClick={() => setDark(!dark)}>{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="notification-wrap"><button className="icon-button bell-button" aria-label="Notifications" onClick={() => setNoticeOpen(!noticeOpen)}><Bell size={19} /><i /></button>{noticeOpen && <div className="notification-popover"><div className="popover-heading"><strong>Notifications</strong><button onClick={() => setNoticeOpen(false)} aria-label="Close notifications"><X size={16} /></button></div><p><span className="notification-dot" />New homework: Fractions practice<span className="notification-time">10 min ago</span></p><p><span className="notification-dot orange-dot" />Science quiz on Friday<span className="notification-time">Yesterday</span></p><p><span className="notification-dot blue-dot" />Your plant diagram was received<span className="notification-time">Oct 12</span></p></div>}</div>
            <div className="avatar avatar-green top-avatar">{role === 'Student' ? 'AR' : role === 'Teacher' ? 'MK' : 'AD'}</div>
          </div>
        </header>

        {menuOpen && <div className="mobile-drawer">{[...navItems.map((item) => item.page), 'Attendance' as Page, 'Notices' as Page].map((item) => <button key={item} className={page === item ? 'nav-item active' : 'nav-item'} onClick={() => go(item)}>{item}</button>)}</div>}
        <div className="content-wrap">
          {page === 'Home' && <Dashboard role={role} go={go} homework={homework} />}
          {page === 'Homework' && <HomeworkPage items={filteredHomework} query={query} setQuery={setQuery} upload={uploadHomework} role={role} />}
          {page === 'Activities' && <ActivitiesPage role={role} toast={showToast} />}
          {page === 'Friday Special' && <FridayPage role={role} toast={showToast} />}
          {page === 'Exams' && <ExamsPage role={role} toast={showToast} />}
          {page === 'Attendance' && <AttendancePage role={role} />}
          {page === 'Notices' && <NoticesPage role={role} toast={showToast} />}
          {page === 'Profile' && <ProfilePage role={role} signOut={signOut} />}
          {page === 'Classes' && <ClassesPage toast={showToast} />}
        </div>
        <footer className="footer"><span>© 2026 Sunrise Public School</span><span>Made for curious minds <span className="footer-spark">✳</span></span></footer>
      </main>

      <nav className="mobile-nav" aria-label="Bottom navigation">{navItems.map(({ page: item, icon: Icon }) => <button key={item} className={page === item ? 'mobile-nav-item selected' : 'mobile-nav-item'} onClick={() => go(item)}><Icon size={19} strokeWidth={page === item ? 2.4 : 1.8} /><span>{item === 'Friday Special' ? 'Friday' : item}</span></button>)}</nav>
      <input ref={fileInput} className="visually-hidden" type="file" accept="image/*,.pdf,.doc,.docx" capture="environment" onChange={handleFileChange} />
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  )
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</div>
}

function Dashboard({ role, go, homework }: { role: Role; go: (page: Page) => void; homework: HomeworkItem[] }) {
  const isStudent = role === 'Student'
  const pending = homework.filter((item) => item.status === 'To do').length
  return <>
    <PageHeading eyebrow={isStudent ? 'WEDNESDAY, OCTOBER 15' : role === 'Teacher' ? 'TEACHER SPACE · WEDNESDAY, OCT 15' : 'ADMIN OVERVIEW · WEDNESDAY, OCT 15'} title={isStudent ? 'Good morning, Aarav' : role === 'Teacher' ? 'Good morning, Maya' : 'Good morning, Admin'} description={isStudent ? 'A fresh day to learn something new.' : 'Here’s what is happening across your school today.'} action={<button className="date-pill"><CalendarDays size={16} /> Wednesday, Oct 15</button>} />
    <div className="welcome-banner"><div className="welcome-text"><span className="welcome-kicker">{isStudent ? 'YOUR WEDNESDAY, AT A GLANCE' : 'TODAY AT SUNRISE PUBLIC SCHOOL'}</span><h2>{isStudent ? <>Small steps make<br />big discoveries.</> : <>A good day to<br />make a difference.</>}</h2><p>{isStudent ? 'You have 4 classes and 2 assignments to keep you moving.' : 'Your school community is ready for a full day of learning.'}</p><button className="banner-link" onClick={() => go(isStudent ? 'Homework' : 'Classes')}>{isStudent ? 'See what’s due' : 'Open your classes'}<ChevronRight size={15} /></button></div><div className="banner-art" aria-hidden="true"><div className="sun-disc" /><div className="book-stack"><span /><span /><span /></div><span className="art-star star-one">✳</span><span className="art-star star-two">✦</span><span className="art-leaf">⌁</span><span className="art-cloud">☁</span></div><div className="banner-side-note"><span className="weather">☀</span><span>28°</span><small>Have a lovely day</small></div></div>
    <div className="stats-row">
      <StatCard icon={<BookOpen size={18} />} label={isStudent ? 'Homework due' : 'Assignments to review'} value={isStudent ? String(pending) : '12'} sub={isStudent ? '2 due this week' : 'Across 3 classes'} tone="mint" onClick={() => go('Homework')} />
      <StatCard icon={<CalendarDays size={18} />} label={isStudent ? 'Next exam' : 'Next school event'} value={isStudent ? 'Oct 24' : 'Oct 17'} sub={isStudent ? 'Science · 9 days' : 'Friday Special Assembly'} tone="peach" onClick={() => go(isStudent ? 'Exams' : 'Friday Special')} />
      <StatCard icon={<ClipboardCheck size={18} />} label={isStudent ? 'Attendance' : 'Attendance today'} value={isStudent ? '94%' : '96%'} sub={isStudent ? 'You’re doing great!' : '248 students present'} tone="blue" onClick={() => go('Attendance')} />
      <StatCard icon={<Bell size={18} />} label="School notices" value="3 new" sub="Nothing urgent" tone="lilac" onClick={() => go('Notices')} />
    </div>
    <div className="dashboard-grid">
      <section className="panel timetable-panel"><div className="section-head"><div><h2>{isStudent ? 'Today’s timetable' : 'Today’s schedule'}</h2><p>Wednesday · Class 8B</p></div><button className="text-link" onClick={() => go('Attendance')}>Full week <ChevronRight size={14} /></button></div><div className="timeline">{timetable.map((lesson) => <div key={lesson.subject} className={lesson.now ? 'timeline-row current' : 'timeline-row'}><div className="time-label">{lesson.time}<small>{lesson.end}</small></div><div className={`timeline-dot ${lesson.color}`} /><div className={`lesson-card ${lesson.color}`}><div><strong>{lesson.subject}</strong><small>{lesson.room} · {lesson.subject === 'Mathematics' ? 'Ms. Kapoor' : lesson.subject === 'Science' ? 'Mr. Sharma' : 'Mrs. Das'}</small></div><span className="lesson-duration"><Clock3 size={13} />45 min</span></div>{lesson.now && <span className="now-tag">NOW</span>}</div>)}</div><button className="schedule-link" onClick={() => go('Attendance')}>View full timetable <ChevronRight size={15} /></button></section>
      <section className="panel homework-panel"><div className="section-head"><div><h2>Homework to do</h2><p>A little progress goes a long way</p></div><button className="circle-arrow" aria-label="View all homework" onClick={() => go('Homework')}><ChevronRight size={17} /></button></div><div className="homework-list">{homework.filter((item) => item.status === 'To do').slice(0, 3).map((item) => <button className="homework-row" key={item.title} onClick={() => go('Homework')}><span className={`subject-icon ${item.color}`}>{item.icon}</span><span className="homework-copy"><strong>{item.title}</strong><small>{item.subject} · Due {item.due}</small></span><ChevronRight size={16} /></button>)}</div><div className="homework-footer"><span><span className="small-dot" />{pendingCount(homework)} items need your attention</span><button onClick={() => go('Homework')}>View all</button></div></section>
      <section className="panel activity-panel"><div className="section-head"><div><h2>Coming up at school</h2><p>Make room for something fun</p></div><button className="text-link" onClick={() => go('Activities')}>All activities <ChevronRight size={14} /></button></div><div className="event-row"><div className="event-date"><strong>18</strong><small>OCT</small></div><div className="event-copy"><strong>Young Innovators Fair</strong><small>Saturday · School auditorium</small><span className="event-chip">REGISTRATION OPEN</span></div><span className="event-emoji">✳</span></div><div className="event-row"><div className="event-date event-date-orange"><strong>24</strong><small>OCT</small></div><div className="event-copy"><strong>Science Week begins</strong><small>Friday · Classes 6–10</small><span className="event-chip event-chip-blue">COMING SOON</span></div><span className="event-emoji">⚗</span></div></section>
      <section className="panel friday-panel"><div className="friday-top"><span className="friday-icon"><CalendarDays size={17} /></span><span className="friday-badge">THIS FRIDAY</span><button className="friday-arrow" aria-label="Open Friday Special" onClick={() => go('Friday Special')}><ChevronRight size={17} /></button></div><p className="friday-kicker">FRIDAY SPECIAL MORNING</p><h2>Kindness costs<br />nothing, shares everything.</h2><div className="friday-bottom"><span><span className="assembly-dot" />Assembly starts at 8:00 AM</span><button onClick={() => go('Friday Special')}>Explore <ChevronRight size={14} /></button></div><span className="friday-decoration">✳</span></section>
    </div>
  </>
}

function pendingCount(items: HomeworkItem[]) { return items.filter((item) => item.status === 'To do').length }

function StatCard({ icon, label, value, sub, tone, onClick }: { icon: React.ReactNode; label: string; value: string; sub: string; tone: string; onClick: () => void }) {
  return <button className="stat-card" onClick={onClick}><span className={`stat-icon ${tone}`}>{icon}</span><span className="stat-info"><small>{label}</small><strong>{value}</strong><span>{sub}</span></span><ChevronRight className="stat-chevron" size={16} /></button>
}

function HomeworkPage({ items, query, setQuery, upload, role }: { items: HomeworkItem[]; query: string; setQuery: (value: string) => void; upload: (index: number) => void; role: Role }) {
  const [filter, setFilter] = useState('All')
  const visibleItems = filter === 'All' ? items : items.filter((item) => item.status === filter)
  return <><PageHeading eyebrow={role === 'Student' ? 'YOUR LEARNING' : 'CLASSROOM'} title="Homework" description={role === 'Student' ? 'Keep track of your work and celebrate every finish.' : 'Assign work, review submissions, and help every learner grow.'} action={role === 'Student' ? <span className="due-summary"><span className="small-dot" />{pendingCount(items)} to do</span> : <button className="primary-button" onClick={() => window.alert('Assignment creator is ready to connect to the API.')}><Plus size={16} />Create homework</button>} /><div className="filter-toolbar"><div className="segmented">{['All', 'To do', 'Submitted', 'Graded'].map((item) => <button key={item} className={filter === item ? 'segment selected' : 'segment'} onClick={() => setFilter(item)}>{item}</button>)}</div><label className="search-box"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search homework" /></label></div><div className="assignment-list">{visibleItems.map((item) => <article className="assignment-card" key={item.title}><div className={`assignment-icon ${item.color}`}>{item.icon}</div><div className="assignment-info"><div className="assignment-heading"><span className="subject-name">{item.subject}</span><StatusBadge status={item.status} /></div><h2>{item.title}</h2><p>{item.detail}</p><div className="assignment-meta"><span><CalendarDays size={14} />Due {item.due}</span>{item.mark && <span className="teacher-feedback"><Check size={14} />Ms. Kapoor: Great work! <strong>{item.mark}</strong></span>}</div></div>{role === 'Student' && <button className={item.status === 'To do' ? 'upload-button' : 'upload-button completed'} onClick={() => item.status === 'To do' ? upload(initialHomework.findIndex((homeworkItem) => homeworkItem.title === item.title)) : undefined}>{item.status === 'To do' ? <><CloudUpload size={16} /><span>Upload work</span></> : <><Check size={16} /><span>{item.status}</span></>}</button>}{role !== 'Student' && <button className="upload-button" onClick={() => window.alert('Submission review is ready to connect to the API.')}><Users size={16} /><span>Review 28</span></button>}</article>)}</div>{visibleItems.length === 0 && <div className="empty-state"><BookOpen size={22} /><strong>No homework found</strong><span>Try another search or filter.</span></div>}</>
}

function StatusBadge({ status }: { status: string }) { return <span className={`status-badge status-${status.toLowerCase().replace(' ', '-')}`}><span />{status}</span> }

function ActivitiesPage({ role, toast }: { role: Role; toast: (message: string) => void }) {
  return <><PageHeading eyebrow="BEYOND THE CLASSROOM" title="Activities" description="Find your people, try something new, and make memories along the way." action={role !== 'Student' && <button className="primary-button" onClick={() => toast('Activity editor opened')}><Plus size={16} />Post an activity</button>} /><div className="activity-feature"><div className="feature-art"><div className="feature-sun" /><span className="feature-shape shape-one">✦</span><span className="feature-shape shape-two">✳</span><span className="feature-ribbon">OPEN FOR ENTRIES</span><div className="feature-plant">♧</div></div><div className="feature-content"><div className="event-label">SCHOOL-WIDE · COMPETITION</div><h2>Young Innovators Fair</h2><p>Have an idea that could make everyday life better? Build a prototype, share your story, and inspire your whole school.</p><div className="feature-details"><span><CalendarDays size={15} />Saturday, October 18</span><span><Users size={15} />Classes 6–10</span></div><button className="primary-button" onClick={() => toast('You’re registered for the Young Innovators Fair!')}>Register now <ChevronRight size={16} /></button></div></div><div className="section-head activity-section-head"><div><h2>More ways to get involved</h2><p>There’s a place for every kind of curious</p></div><button className="text-link" onClick={() => toast('Showing all activities')}>View calendar <CalendarDays size={14} /></button></div><div className="activity-cards"><ActivityCard icon="◈" color="peach" category="CREATIVE ARTS" title="Inter-house poster contest" detail="Create a poster around this year’s theme: Our Shared Earth." date="Entries close Oct 22" action="Submit entry" onClick={() => toast('Entry submission opened')} /><ActivityCard icon="⚽" color="mint" category="SPORTS" title="Junior football trials" detail="Show us your footwork. Trials are open to Classes 6–8." date="Thursday, Oct 23 · 3:30 PM" action="Join the team" onClick={() => toast('You’ve joined the football trials list!')} /><ActivityCard icon="✿" color="lilac" category="CLUBS" title="Eco Club: Garden morning" detail="Help us plant herbs and care for the school garden." date="Every Saturday · 8:30 AM" action="Join club" onClick={() => toast('Welcome to Eco Club!')} /></div></>
}

function ActivityCard({ icon, color, category, title, detail, date, action, onClick }: { icon: string; color: string; category: string; title: string; detail: string; date: string; action: string; onClick: () => void }) {
  return <article className="activity-card"><div className={`activity-card-art ${color}`}><span>{icon}</span><span className="activity-art-orbit" /></div><div className="activity-card-body"><span className="event-label">{category}</span><h3>{title}</h3><p>{detail}</p><span className="activity-date"><CalendarDays size={14} />{date}</span><button className="activity-action" onClick={onClick}>{action}<ChevronRight size={15} /></button></div></article>
}

function FridayPage({ role, toast }: { role: Role; toast: (message: string) => void }) {
  const [selected, setSelected] = useState(17)
  return <><PageHeading eyebrow="GATHER, SHARE, BEGIN AGAIN" title="Friday Special" description="A little inspiration to carry into the weekend." action={role !== 'Student' && <button className="primary-button" onClick={() => toast('Assembly planner opened')}><Plus size={16} />Plan assembly</button>} /><div className="assembly-hero"><div className="assembly-sun" /><div className="assembly-copy"><span className="assembly-overline">FRIDAY SPECIAL MORNING · OCTOBER 17</span><h2>Kindness costs nothing,<br />shares everything.</h2><p>One small act can make someone’s whole day. Let’s make room for more of them.</p><div className="assembly-byline"><span className="avatar avatar-cream">✳</span><span>Thought for the day<small>Shared by Class 8B</small></span></div></div><div className="assembly-graphic" aria-hidden="true"><span className="assembly-big-star">✳</span><span className="assembly-line line-a" /><span className="assembly-line line-b" /><span className="assembly-leaf">♧</span><span className="assembly-heart">♡</span></div><span className="assembly-label">WEEK 7 · OCTOBER</span></div><div className="friday-layout"><section className="panel assembly-program"><div className="section-head"><div><h2>This week’s assembly</h2><p>Friday · 8:00–8:40 AM · School courtyard</p></div><span className="live-label"><span />UPCOMING</span></div><div className="program-list"><ProgramRow time="8:00" type="WELCOME" title="A warm welcome" detail="Opening by our Head Teacher" /><ProgramRow time="8:05" type="THOUGHT OF THE DAY" title="Kindness costs nothing" detail="Presented by Aarav Rao, Class 8B" /><ProgramRow time="8:12" type="STUDENT PERFORMANCE" title="A song for everyone" detail="Sunshine Choir · Classes 6–8" /><ProgramRow time="8:22" type="WEEKLY NEWS" title="The week around us" detail="News, school updates & celebrations" /><ProgramRow time="8:32" type="QUICK QUIZ" title="Kindness in action" detail="Bring your thinking caps!" last /></div></section><section className="panel friday-archive"><div className="section-head"><div><h2>Past Fridays</h2><p>Take a moment to look back</p></div><div className="archive-arrows"><button aria-label="Previous Friday" onClick={() => setSelected(Math.max(3, selected - 1))}><ChevronLeft size={16} /></button><button aria-label="Next Friday" onClick={() => setSelected(Math.min(31, selected + 1))}><ChevronRight size={16} /></button></div></div><div className="archive-selected"><span className="archive-icon">{selected === 17 ? '✳' : '♫'}</span><span className="archive-day">FRIDAY, OCTOBER {selected}</span><strong>{selected === 17 ? 'Kindness costs nothing' : selected < 17 ? 'A little courage goes far' : 'The magic of small things'}</strong><span>Class 8B · 4 activities</span><button className="archive-link" onClick={() => toast(`Opened the October ${selected} assembly`)}>View this assembly <ChevronRight size={14} /></button></div><div className="archive-dots"><span /><span /><span className="active" /><span /><span /><span /></div><button className="archive-all" onClick={() => toast('Assembly archive opened')}>Browse all past Fridays <ChevronRight size={14} /></button></section></div></>
}

function ProgramRow({ time, type, title, detail, last }: { time: string; type: string; title: string; detail: string; last?: boolean }) {
  return <div className={last ? 'program-row last' : 'program-row'}><span className="program-time">{time}</span><span className="program-line"><span /></span><div className="program-copy"><span>{type}</span><strong>{title}</strong><small>{detail}</small></div><ChevronRight size={16} /></div>
}

function ExamsPage({ role, toast }: { role: Role; toast: (message: string) => void }) {
  const [tab, setTab] = useState('Upcoming')
  return <><PageHeading eyebrow="GET READY, YOU’VE GOT THIS" title={role === 'Student' ? 'Exams & results' : 'Exams & results'} description="Your exam plan, all in one place. Prepare at your own pace." action={role !== 'Student' && <button className="primary-button" onClick={() => toast('New exam form opened')}><Plus size={16} />Create exam</button>} /><div className="exam-summary"><div className="exam-summary-icon"><ClipboardCheck size={22} /></div><div><span>YOUR NEXT EXAM</span><strong>Mid-term examinations</strong><small>Begins Friday, October 24 · 9 days to go</small></div><button className="download-button" onClick={() => toast('Admit card download started')}><FileText size={16} /><span>Admit card</span></button></div><div className="exam-tabs">{['Upcoming', 'Results', 'Past papers'].map((item) => <button key={item} className={tab === item ? 'exam-tab selected' : 'exam-tab'} onClick={() => setTab(item)}>{item}</button>)}</div>{tab === 'Upcoming' ? <div className="exam-table"><div className="exam-table-head"><span>SUBJECT</span><span>DATE & TIME</span><span>SYLLABUS</span><span>PREPARATION</span></div>{[['Science', 'Fri, Oct 24 · 9:00 AM', 'Chapters 4–6', '3 chapters'], ['Mathematics', 'Mon, Oct 27 · 9:00 AM', 'Units 1–5', '5 units'], ['English', 'Wed, Oct 29 · 9:00 AM', 'Literature + writing', '2 sections'], ['Hindi', 'Fri, Oct 31 · 9:00 AM', 'पाठ 5–8', '4 lessons']].map(([subject, date, syllabus, prep], index) => <div className="exam-row" key={subject}><span className={`exam-subject-icon exam-color-${index}`}>{['⚗', '∑', 'Aa', 'अ'][index]}</span><strong>{subject}</strong><span>{date}</span><span>{syllabus}</span><button className="prep-button" onClick={() => toast(`${subject} syllabus opened`)}>{prep}<ChevronRight size={14} /></button></div>)}</div> : tab === 'Results' ? <div className="result-list">{[['Science', 'Quiz 3', 'Oct 10', '9 / 10', 'A'], ['Mathematics', 'Unit test 2', 'Oct 6', '18 / 20', 'A+'], ['English', 'Reading journal', 'Oct 2', '8 / 10', 'A']].map(([subject, test, date, marks, grade]) => <div className="result-row" key={test}><span>{subject}</span><strong>{test}</strong><span>{date}</span><strong>{marks}</strong><span className="grade-chip">{grade}</span></div>)}</div> : <div className="papers-grid"><button onClick={() => toast('Science paper downloaded')}><FileText size={20} /><strong>Science</strong><span>Mid-term 2025 · PDF</span><CloudUpload size={16} /></button><button onClick={() => toast('Math paper downloaded')}><FileText size={20} /><strong>Mathematics</strong><span>Mid-term 2025 · PDF</span><CloudUpload size={16} /></button><button onClick={() => toast('English paper downloaded')}><FileText size={20} /><strong>English</strong><span>Mid-term 2025 · PDF</span><CloudUpload size={16} /></button></div>}</>
}

function AttendancePage({ role }: { role: Role }) {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const dates = Array.from({ length: 35 }, (_, index) => index < 3 ? '' : String(index - 2))
  return <><PageHeading eyebrow="SHOWING UP MATTERS" title="Attendance" description={role === 'Student' ? 'Your month at a glance. Keep building your good habits.' : 'Class attendance overview for October.'} /><div className="attendance-overview"><div className="attendance-score"><div className="score-ring"><strong>94<small>%</small></strong></div><div><span>THIS TERM</span><strong>{role === 'Student' ? 'You’re on a great streak!' : 'Class 8B is doing well'}</strong><small>Present for 47 of 50 school days</small></div></div><div className="attendance-legend"><span><i className="present-dot" />Present <strong>47</strong></span><span><i className="absent-dot" />Absent <strong>2</strong></span><span><i className="late-dot" />Late <strong>1</strong></span></div></div><div className="panel attendance-calendar"><div className="section-head"><div><h2>October 2026</h2><p>Tap a date to see attendance details</p></div><div className="archive-arrows"><button aria-label="Previous month"><ChevronLeft size={16} /></button><button aria-label="Next month"><ChevronRight size={16} /></button></div></div><div className="calendar-grid">{days.map((day, index) => <span className="weekday" key={`${day}${index}`}>{day}</span>)}{dates.map((date, index) => <button key={`${date}${index}`} className={date === '15' ? 'calendar-day today' : ['5', '12'].includes(date) ? 'calendar-day absent' : date && Number(date) < 15 && index % 7 !== 6 && index % 7 !== 5 ? 'calendar-day present' : 'calendar-day'} disabled={!date || Number(date) > 15}>{date}{date && Number(date) < 15 && index % 7 !== 6 && index % 7 !== 5 && <i />}</button>)}</div></div><div className="attendance-note"><span><ShieldCheck size={18} /></span><p><strong>Every day is a new chance.</strong><br />Being here helps you learn, connect, and grow with your classmates.</p></div></>
}

function NoticesPage({ role, toast }: { role: Role; toast: (message: string) => void }) {
  return <><PageHeading eyebrow="A NOTE FROM YOUR SCHOOL" title="Notices & circulars" description="Important updates and little things worth knowing." action={role === 'Admin' && <button className="primary-button" onClick={() => toast('New notice composer opened')}><Plus size={16} />Post a notice</button>} /><div className="notice-feature"><span className="notice-pin">✳</span><span className="event-label">SCHOOL-WIDE · OCTOBER 14</span><h2>Diwali break & school timings</h2><p>School will remain closed from October 20–23 for the Diwali break. Classes resume on Friday, October 24, at the usual time. Wishing all our families a bright and joyful celebration!</p><div className="notice-byline"><span className="avatar avatar-orange">SP</span><span>Sunrise Public School Administration<small>Yesterday · For all classes</small></span></div><button className="notice-download" onClick={() => toast('Circular PDF downloaded')}><FileText size={15} />Download circular <CloudUpload size={14} /></button></div><div className="notice-list"><NoticeRow category="CLASS 8 · OCTOBER 13" title="Bring your science project materials" detail="Please bring your chart paper and labelled plant samples for Thursday’s class activity." tone="mint" /><NoticeRow category="SPORTS · OCTOBER 11" title="Inter-house football fixtures" detail="The updated match schedule for next week is available on the school notice board." tone="peach" /><NoticeRow category="TRANSPORT · OCTOBER 09" title="Route 4 pickup adjustment" detail="The 7:25 AM pickup will move to 7:20 AM starting Monday, October 13." tone="blue" /></div></>
}

function NoticeRow({ category, title, detail, tone }: { category: string; title: string; detail: string; tone: string }) {
  return <article className="notice-row"><span className={`notice-row-icon ${tone}`}><Bell size={17} /></span><div><span className="event-label">{category}</span><h3>{title}</h3><p>{detail}</p></div><ChevronRight size={16} /></article>
}

function ProfilePage({ role, signOut }: { role: Role; signOut: () => void }) {
  return <><PageHeading eyebrow="A LITTLE ABOUT YOU" title="My profile" description="Keep your details up to date and make this space yours." /><div className="profile-layout"><section className="panel profile-card"><div className="profile-cover"><span>✳</span></div><div className="profile-details"><div className="avatar avatar-large">{role === 'Student' ? 'AR' : role === 'Teacher' ? 'MK' : 'AD'}</div><span className="profile-role">{role.toUpperCase()} · SUNRISE PUBLIC SCHOOL</span><h2>{role === 'Student' ? 'Aarav Rao' : role === 'Teacher' ? 'Maya Kapoor' : 'School Administrator'}</h2><p>{role === 'Student' ? 'Class 8 · Section B · Roll no. 08' : role === 'Teacher' ? 'Mathematics · Middle School' : 'Campus administration'}</p><div className="profile-info-grid"><span><small>SCHOOL ID</small><strong>{role === 'Student' ? 'SPS-2026-0842' : role === 'Teacher' ? 'TCH-2026-0017' : 'ADM-2026-0001'}</strong></span><span><small>EMAIL</small><strong>{role === 'Student' ? 'aarav.rao@sunrise.edu' : role === 'Teacher' ? 'maya.kapoor@sunrise.edu' : 'admin@sunrise.edu'}</strong></span><span><small>CLASS TEACHER</small><strong>{role === 'Student' ? 'Ms. Maya Kapoor' : '—'}</strong></span><span><small>ACADEMIC YEAR</small><strong>2026–27</strong></span></div><button className="secondary-button"><Settings size={16} />Edit profile</button></div></section><section className="panel profile-settings"><div className="section-head"><div><h2>Preferences</h2><p>Make Campus feel right for you</p></div></div><PreferenceRow icon={<Languages size={17} />} title="Language" detail="English (US)" /><PreferenceRow icon={<Bell size={17} />} title="Notifications" detail="Homework, exams, school news" /><PreferenceRow icon={<ShieldCheck size={17} />} title="Privacy & security" detail="Password and account access" /><button className="sign-out-button" onClick={signOut}><LogOut size={16} />Sign out</button></section></div></>
}

function PreferenceRow({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <button className="preference-row"><span>{icon}</span><span><strong>{title}</strong><small>{detail}</small></span><ChevronRight size={16} /></button>
}

function ClassesPage({ toast }: { toast: (message: string) => void }) {
  return <><PageHeading eyebrow="YOUR TEACHING SPACE" title="My classes" description="A quick view of your learners and the work ahead." action={<button className="primary-button" onClick={() => toast('Class report exported')}><CloudUpload size={16} />Export report</button>} /><div className="class-overview"><ClassCard title="Class 8 · Section B" subject="Mathematics" students="32 students" tone="mint" progress="78%" /><ClassCard title="Class 8 · Section A" subject="Mathematics" students="30 students" tone="peach" progress="84%" /><ClassCard title="Class 7 · Section C" subject="Mathematics" students="29 students" tone="blue" progress="71%" /></div><section className="panel class-table-panel"><div className="section-head"><div><h2>Needs your attention</h2><p>Small timely feedback makes a big difference</p></div><button className="text-link" onClick={() => toast('All submissions opened')}>See all <ChevronRight size={14} /></button></div><div className="needs-row"><span className="avatar avatar-peach">PS</span><span><strong>Priya Sharma</strong><small>Class 8B · Fractions practice</small></span><span className="needs-due">Submitted 2 hours ago</span><button className="review-button" onClick={() => toast('Opening Priya’s submission')}>Review</button></div><div className="needs-row"><span className="avatar avatar-blue">RK</span><span><strong>Rohan Kumar</strong><small>Class 8A · Fractions practice</small></span><span className="needs-due">Submitted yesterday</span><button className="review-button" onClick={() => toast('Opening Rohan’s submission')}>Review</button></div><div className="needs-row"><span className="avatar avatar-lilac">AS</span><span><strong>Ananya Singh</strong><small>Class 7C · Unit test 2</small></span><span className="needs-due">Marks to publish</span><button className="review-button" onClick={() => toast('Opening Ananya’s result')}>Review</button></div></section><div className="staff-shortcuts"><button onClick={() => toast('Attendance marking opened')}><ClipboardCheck size={17} /><span>Mark attendance</span><ChevronRight size={15} /></button><button onClick={() => toast('New notice composer opened')}><Bell size={17} /><span>Post a class notice</span><ChevronRight size={15} /></button><button onClick={() => toast('Exam management opened')}><FileText size={17} /><span>Manage exams</span><ChevronRight size={15} /></button></div></>
}

function ClassCard({ title, subject, students, tone, progress }: { title: string; subject: string; students: string; tone: string; progress: string }) {
  return <article className="class-card"><div className={`class-card-top ${tone}`}><span><BookOpen size={19} /></span><MoreHorizontal size={18} /></div><div className="class-card-body"><span className="event-label">{subject.toUpperCase()}</span><h2>{title}</h2><div className="class-card-meta"><span><Users size={14} />{students}</span><span>Attendance <strong>{progress}</strong></span></div><div className="progress-track"><span style={{ width: progress }} /></div></div></article>
}

export default App
