import { useState } from 'react'
import { Check, Download, MoreHorizontal, Users } from 'lucide-react'

interface ClassesPageProps {
  onToast: (msg: string) => void
}

export default function ClassesPage({ onToast }: ClassesPageProps) {
  const [reviews, setReviews] = useState([
    {
      id: 1,
      student: 'Priya Sharma',
      class: 'Class 8-B',
      assignment: 'Fractions & Linear Equations',
      time: '2 hours ago',
      avatar: 'PS',
      color: 'amber',
    },
    {
      id: 2,
      student: 'Rohan Kumar',
      class: 'Class 8-A',
      assignment: 'Cell Organelles Diagram',
      time: '5 hours ago',
      avatar: 'RK',
      color: 'sky',
    },
    {
      id: 3,
      student: 'Ananya Singh',
      class: 'Class 7-C',
      assignment: 'Algebraic Expressions Practice',
      time: 'Yesterday',
      avatar: 'AS',
      color: 'purple',
    },
  ])

  function handleGrade(id: number, student: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
    onToast(`Graded and published feedback for ${student}!`)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">FACULTY ROSTER</span>
          <h1 className="page-title">My Classes & Sections</h1>
          <p className="page-subtitle">
            Manage student attendance rosters, grade homework submissions, and track term performance.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={() => onToast('Exported New Ellinium School Term Attendance & Grade Matrix (Excel).')}
        >
          <Download size={16} />
          <span>Export Academic Report</span>
        </button>
      </div>

      {/* Class Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {[
          { title: 'Class 8 · Section B', subject: 'Mathematics & Science', students: 34, attendance: '96%', color: 'var(--brand-primary)' },
          { title: 'Class 8 · Section A', subject: 'Advanced Algebra', students: 32, attendance: '94%', color: 'var(--accent-amber)' },
          { title: 'Class 7 · Section C', subject: 'Foundation Mathematics', students: 30, attendance: '92%', color: 'var(--accent-sky)' },
        ].map((cls) => (
          <div key={cls.title} className="content-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: cls.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {cls.subject}
              </span>
              <button className="action-icon-btn" style={{ width: '28px', height: '28px' }}>
                <MoreHorizontal size={16} />
              </button>
            </div>

            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, margin: '8px 0 16px' }}>
              {cls.title}
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={15} /> {cls.students} Enrolled
              </span>
              <span>
                Avg Attendance: <strong>{cls.attendance}</strong>
              </span>
            </div>

            <div style={{ height: '6px', borderRadius: '4px', backgroundColor: 'var(--bg-subtle)', marginTop: '12px', overflow: 'hidden' }}>
              <div style={{ width: cls.attendance, height: '100%', backgroundColor: cls.color, borderRadius: '4px' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Grading Queue Panel */}
      <div className="content-panel">
        <div className="panel-header">
          <div className="panel-header-title">
            <h2>Pending Submissions Queue ({reviews.length})</h2>
            <p>Timely feedback helps our New Ellinium students learn and excel</p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reviews.map((rev) => (
            <div
              key={rev.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 18px',
                backgroundColor: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'var(--brand-light)',
                    color: 'var(--brand-primary)',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 800,
                    fontSize: '14px',
                  }}
                >
                  {rev.avatar}
                </div>

                <div>
                  <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                    {rev.student}
                  </strong>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {rev.class} · {rev.assignment} · Submitted {rev.time}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => onToast(`Viewing document file for ${rev.student}`)}
                >
                  Inspect File
                </button>
                <button
                  className="btn-primary"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                  onClick={() => handleGrade(rev.id, rev.student)}
                >
                  <Check size={14} />
                  <span>Grade & Feedback</span>
                </button>
              </div>
            </div>
          ))}

          {reviews.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600 }}>All pending submissions have been reviewed and graded!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
