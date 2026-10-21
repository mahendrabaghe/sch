import { useState, useMemo } from 'react'
import { 
  BookOpen, 
  CalendarDays, 
  Check, 
  CheckCircle2, 
  Clock, 
  FileUp, 
  Plus, 
  Search, 
  UploadCloud, 
  X 
} from 'lucide-react'
import type { HomeworkItem, Role } from '../types'
import { translations } from '../data/translations'

interface HomeworkPageProps {
  items: HomeworkItem[]
  setItems: React.Dispatch<React.SetStateAction<HomeworkItem[]>>
  role: Role
  hindi: boolean
  onToast: (msg: string) => void
}

export default function HomeworkPage({
  items,
  setItems,
  role,
  hindi,
  onToast,
}: HomeworkPageProps) {
  const t = hindi ? translations.hi : translations.en
  const isStudent = role === 'Student'

  const [activeFilter, setActiveFilter] = useState<'All' | 'To do' | 'Submitted' | 'Graded'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [modalItem, setModalItem] = useState<HomeworkItem | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newSubject, setNewSubject] = useState('Mathematics')
  const [newDetail, setNewDetail] = useState('')
  const [newDue, setNewDue] = useState('Tomorrow, 6:00 PM')

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesFilter = activeFilter === 'All' || item.status === activeFilter
      const textToSearch = `${item.subject} ${item.title} ${item.detail}`.toLowerCase()
      const matchesSearch = textToSearch.includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [items, activeFilter, searchQuery])

  function handleUploadClick(item: HomeworkItem) {
    setModalItem(item)
  }

  function confirmUpload(file: File) {
    if (!modalItem) return
    if (file.size > 10 * 1024 * 1024) {
      onToast('File exceeds maximum size limit (10 MB)')
      return
    }

    setItems((prev) =>
      prev.map((hw) =>
        hw.id === modalItem.id
          ? {
              ...hw,
              status: 'Submitted',
              submittedAt: 'Just now',
            }
          : hw
      )
    )
    onToast(`Submitted ${file.name} successfully!`)
    setModalItem(null)
  }

  function handleCreateHomework(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim()) return

    const newItem: HomeworkItem = {
      id: `hw-${Date.now()}`,
      subject: newSubject,
      title: newTitle.trim(),
      detail: newDetail.trim() || 'Please complete exercises and submit by the scheduled deadline.',
      due: newDue.trim(),
      status: 'To do',
      color: 'emerald',
      icon: '∑',
    }

    setItems((prev) => [newItem, ...prev])
    onToast(`Assignment "${newTitle}" created for students!`)
    setNewTitle('')
    setNewDetail('')
    setCreateModalOpen(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">ACADEMIC WORKLOAD</span>
          <h1 className="page-title">{t.homework}</h1>
          <p className="page-subtitle">
            {isStudent
              ? 'Keep track of coursework, upload files, and review teacher feedback.'
              : 'Create new class homework, evaluate submissions, and publish grades.'}
          </p>
        </div>

        {!isStudent && (
          <button className="btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={18} />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {/* Filter Toolbar */}
      <div className="toolbar-wrap">
        <div className="segmented-control">
          {(['All', 'To do', 'Submitted', 'Graded'] as const).map((filter) => (
            <button
              key={filter}
              className={`segment-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'All'
                ? t.filterAll
                : filter === 'To do'
                ? t.filterTodo
                : filter === 'Submitted'
                ? t.filterSubmitted
                : t.filterGraded}
            </button>
          ))}
        </div>

        <div className="search-field-box">
          <Search size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Assignment List */}
      <div className="assignments-grid">
        {filteredItems.map((item) => (
          <article className="assignment-expanded-card" key={item.id}>
            <div className={`assignment-icon-large ${item.color}`}>{item.icon}</div>

            <div className="assignment-body">
              <div className="assignment-header-row">
                <span className="assignment-subject-tag">{item.subject}</span>
                <span className={`badge-status ${item.status.toLowerCase().replace(' ', '')}`}>
                  {item.status}
                </span>
                {item.mark && (
                  <span className="badge-status graded" style={{ fontWeight: 800 }}>
                    Mark: {item.mark}
                  </span>
                )}
              </div>

              <h3>{item.title}</h3>
              <p>{item.detail}</p>

              <div className="assignment-meta-row">
                <span className="assignment-meta-item">
                  <CalendarDays size={15} />
                  <span>Due: {item.due}</span>
                </span>

                {item.submittedAt && (
                  <span className="assignment-meta-item">
                    <Clock size={15} />
                    <span>Submitted on: {item.submittedAt}</span>
                  </span>
                )}

                {item.teacherFeedback && (
                  <span className="assignment-meta-item teacher-note-pill">
                    <CheckCircle2 size={15} />
                    <span>{item.teacherFeedback}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isStudent ? (
              item.status === 'To do' ? (
                <button className="btn-primary" onClick={() => handleUploadClick(item)}>
                  <UploadCloud size={16} />
                  <span>{t.uploadWork}</span>
                </button>
              ) : (
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--brand-primary)',
                    fontWeight: 700,
                    fontSize: '13px',
                    padding: '8px 14px',
                    backgroundColor: 'var(--brand-light)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Check size={16} />
                  <span>{item.status}</span>
                </span>
              )
            ) : (
              <button
                className="btn-secondary"
                onClick={() => onToast(`Review queue for "${item.title}" opened.`)}
              >
                <span>Review Submissions (28)</span>
              </button>
            )}
          </article>
        ))}

        {filteredItems.length === 0 && (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
            }}
          >
            <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              No assignments found
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Try adjusting your filter or search query.
            </p>
          </div>
        )}
      </div>

      {/* Upload File Modal */}
      {modalItem && (
        <div className="modal-backdrop" onClick={() => setModalItem(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Assignment Work</h3>
              <button onClick={() => setModalItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div>
                <strong style={{ fontSize: '16px', display: 'block', marginBottom: '4px' }}>
                  {modalItem.title}
                </strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {modalItem.subject} · Due {modalItem.due}
                </span>
              </div>

              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '36px 20px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-subtle)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  const input = document.getElementById('hw-file-input') as HTMLInputElement
                  input?.click()
                }}
              >
                <FileUp size={40} color="var(--brand-primary)" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>
                  Click to select a file from your device
                </p>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  PDF, DOCX, PNG, or JPG (up to 10 MB)
                </span>
                <input
                  id="hw-file-input"
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) confirmUpload(file)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Assignment Modal for Teachers */}
      {createModalOpen && (
        <div className="modal-backdrop" onClick={() => setCreateModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Assignment</h3>
              <button onClick={() => setCreateModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="modal-body">
              <div className="form-group">
                <label>Subject</label>
                <select
                  className="form-control"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science & Tech">Science & Tech</option>
                  <option value="English Literature">English Literature</option>
                  <option value="Hindi Language">Hindi Language</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>

              <div className="form-group">
                <label>Assignment Title</label>
                <input
                  className="form-control"
                  placeholder="e.g. Linear Algebra Worksheet 5"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Instructions & Detail</label>
                <textarea
                  className="form-control"
                  style={{ height: '80px', padding: '10px 14px', resize: 'vertical' }}
                  placeholder="Provide instructions, questions, or textbook references..."
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Submission Deadline</label>
                <input
                  className="form-control"
                  placeholder="e.g. Friday, Oct 24, 8:00 PM"
                  value={newDue}
                  onChange={(e) => setNewDue(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
