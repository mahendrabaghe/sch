import { useState } from 'react'
import { Bell, Download, FileText, Plus, Search, User } from 'lucide-react'
import type { NoticeItem, Role } from '../types'

interface NoticesPageProps {
  notices: NoticeItem[]
  role: Role
  onToast: (msg: string) => void
}

export default function NoticesPage({ notices, role, onToast }: NoticesPageProps) {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const isAdmin = role === 'Admin'

  const categories = ['All', 'ACADEMIC CIRCULAR', 'CLASS 8 UPDATES', 'SPORTS COUNCIL', 'TRANSPORTATION']

  const filtered = notices.filter((n) => {
    const matchCat = filter === 'All' || n.category === filter
    const matchSearch = `${n.title} ${n.detail} ${n.author}`.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <span className="page-kicker">OFFICIAL COMMUNICATIONS</span>
          <h1 className="page-title">Notices & Campus Circulars</h1>
          <p className="page-subtitle">
            Verified official circulars, holiday calendars, and administrative notifications from New Ellinium School.
          </p>
        </div>

        {isAdmin && (
          <button
            className="btn-primary"
            onClick={() => onToast('Notice composer opened for administrators.')}
          >
            <Plus size={16} />
            <span>Publish Circular</span>
          </button>
        )}
      </div>

      {/* Featured Urgent Notice Banner */}
      <div className="notice-featured-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '3px 8px',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            OFFICIAL CIRCULAR · OCT 14, 2026
          </span>
          <span style={{ fontSize: '13px', color: 'var(--brand-primary)', fontWeight: 700 }}>
            School-wide Notice
          </span>
        </div>

        <h3>Diwali Festive Break & Adjusted School Schedule</h3>
        <p>
          New Ellinium School will remain closed from October 20 to October 23, 2026 for Diwali festivities.
          Regular academic classes will resume on Friday, October 24 at standard hours. Wishing all our students,
          teachers, and families a joyful, safe, and illuminated celebration!
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid var(--brand-border)',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
            <User size={15} />
            <span>Authorized by New Ellinium School Administrative Office</span>
          </span>

          <button
            className="btn-secondary"
            style={{ padding: '6px 14px', fontSize: '13px' }}
            onClick={() => onToast('Downloading Circular-Diwali-2026.pdf')}
          >
            <Download size={14} />
            <span>Download PDF Circular</span>
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="toolbar-wrap">
        <div className="segmented-control">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`segment-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="search-field-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search circulars..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Notice List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((item) => (
          <div
            key={item.id}
            className="content-panel"
            style={{ padding: '18px 22px', display: 'flex', flexDirection: 'row', gap: '16px', alignItems: 'flex-start' }}
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
              <Bell size={20} />
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  {item.category}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>· {item.date}</span>
              </div>

              <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.title}
              </h4>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {item.detail}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Published by: <strong>{item.author}</strong>
                </span>

                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--brand-primary)',
                  }}
                  onClick={() => onToast(`Circular details for "${item.title}" opened.`)}
                >
                  <FileText size={14} />
                  <span>View Details</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
