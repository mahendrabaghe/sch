import { useState } from 'react'
import { CheckCircle, Download, FileText, Plus } from 'lucide-react'
import type { ExamItem, ResultItem, Role } from '../types'

interface ExamsPageProps {
  exams: ExamItem[]
  results: ResultItem[]
  role: Role
  onToast: (msg: string) => void
}

export default function ExamsPage({ exams, results, role, onToast }: ExamsPageProps) {
  const [activeTab, setActiveTab] = useState<'Upcoming' | 'Results' | 'Past Papers'>('Upcoming')
  const isStudent = role === 'Student'

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">ACADEMIC ASSESSMENTS</span>
          <h1 className="page-title">Examinations & Performance</h1>
          <p className="page-subtitle">
            Datesheets, syllabus guides, report cards, and previous year examination papers.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-secondary"
            onClick={() => onToast('Generated Admit Card for Mid-Term Exams 2026.')}
          >
            <Download size={16} />
            <span>Download Admit Card</span>
          </button>

          {!isStudent && (
            <button
              className="btn-primary"
              onClick={() => onToast('Exam creation portal opened.')}
            >
              <Plus size={16} />
              <span>Schedule New Exam</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="toolbar-wrap">
        <div className="segmented-control">
          {(['Upcoming', 'Results', 'Past Papers'] as const).map((tab) => (
            <button
              key={tab}
              className={`segment-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Upcoming'
                ? 'Mid-Term Datesheet'
                : tab === 'Results'
                ? 'Term Report Cards'
                : 'Sample & Past Papers'}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Upcoming Exams Datesheet */}
      {activeTab === 'Upcoming' && (
        <div className="table-responsive">
          <table className="lms-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Date & Time</th>
                <th>Syllabus Scope</th>
                <th>Hall & Venue</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam.subject}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--brand-light)',
                          color: 'var(--brand-primary)',
                          display: 'grid',
                          placeItems: 'center',
                          fontWeight: 800,
                        }}
                      >
                        {exam.icon}
                      </span>
                      <strong>{exam.subject}</strong>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontWeight: 600 }}>{exam.date}</span>
                      <small style={{ color: 'var(--text-muted)' }}>{exam.time}</small>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>{exam.syllabus}</td>
                  <td>
                    <span
                      style={{
                        padding: '4px 8px',
                        backgroundColor: 'var(--bg-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '13px',
                      }}
                    >
                      {exam.room}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '13px' }}
                      onClick={() => onToast(`Syllabus checklist for ${exam.subject} opened.`)}
                    >
                      Study Guide
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Results */}
      {activeTab === 'Results' && (
        <div className="table-responsive">
          <table className="lms-table">
            <thead>
              <tr>
                <th>Assessment</th>
                <th>Evaluation Type</th>
                <th>Date Published</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((res) => {
                const percentage = Math.round((res.marksObtained / res.totalMarks) * 100)
                return (
                  <tr key={res.subject}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} color="var(--brand-primary)" />
                        <strong>{res.subject}</strong>
                      </div>
                    </td>
                    <td>{res.examName}</td>
                    <td>{res.date}</td>
                    <td>
                      <strong>{res.marksObtained}</strong> / {res.totalMarks}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                        {percentage}%
                      </span>
                    </td>
                    <td>
                      <span className="grade-badge">{res.grade}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Past Papers */}
      {activeTab === 'Past Papers' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '18px',
          }}
        >
          {['Science & Tech (2025)', 'Mathematics (2025)', 'English Literature (2025)', 'Hindi Language (2025)'].map(
            (paper) => (
              <div
                key={paper}
                className="content-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '18px',
                }}
              >
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--brand-light)',
                    color: 'var(--brand-primary)',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <FileText size={22} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong style={{ fontSize: '15px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {paper}
                  </strong>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    PDF · 1.4 MB · Mid-Term
                  </span>
                </div>

                <button
                  className="action-icon-btn"
                  onClick={() => onToast(`Downloading past paper: ${paper}`)}
                  title="Download paper"
                  aria-label="Download paper"
                >
                  <Download size={17} />
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
