import { useState, type FormEvent } from 'react'
import { ArrowRight, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react'
import type { Role } from './types'

interface LoginPageProps {
  signIn: (identifier: string, password: string) => Promise<void>
  enterDemo: (role: Role) => void
}

export default function LoginPage({ signIn, enterDemo }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [forgot, setForgot] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (forgot) {
        const api = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'
        const response = await fetch(`${api}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier }),
        })
        if (!response.ok) throw new Error('Could not send reset instructions. Please check the ID or email.')
        setMessage('If that account exists, reset instructions have been dispatched.')
      } else {
        await signIn(identifier, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      {/* Left Showcase Banner */}
      <section className="login-showcase">
        <div className="showcase-glow-circle" />
        <div className="showcase-glow-bottom" />

        <div className="login-brand-header">
          <div className="login-crest">N</div>
          <div className="login-brand-text">
            <h1>New Ellinium School</h1>
            <p>Excellence in Learning · Est. 2026</p>
          </div>
        </div>

        <div className="showcase-content">
          <div className="showcase-badge">
            <Sparkles size={14} />
            <span>Academic Session 2026–27</span>
          </div>

          <h2 className="showcase-headline">
            Where curiosity grows into greatness.
          </h2>

          <p className="showcase-subtext">
            Step into New Ellinium School’s unified portal. Seamlessly manage your class schedule,
            homework submissions, examinations, and vibrant school community activities.
          </p>

          <div className="showcase-feature-list">
            <div className="showcase-feature-item">
              <span className="feature-check-icon"><CheckCircle2 size={14} /></span>
              <span>Personalized student timetable & real-time attendance</span>
            </div>
            <div className="showcase-feature-item">
              <span className="feature-check-icon"><CheckCircle2 size={14} /></span>
              <span>Fast online homework submission with teacher grading</span>
            </div>
            <div className="showcase-feature-item">
              <span className="feature-check-icon"><CheckCircle2 size={14} /></span>
              <span>Examinations datesheet, syllabus & published report cards</span>
            </div>
            <div className="showcase-feature-item">
              <span className="feature-check-icon"><CheckCircle2 size={14} /></span>
              <span>Friday Special morning assembly & inter-house competitions</span>
            </div>
          </div>
        </div>

        <div className="showcase-footer">
          <span>© 2026 New Ellinium School</span>
          <span>Knowledge · Integrity · Innovation</span>
        </div>
      </section>

      {/* Right Form Area */}
      <section className="login-form-area">
        <div className="login-form-card">
          <div className="form-header-group">
            <span className="login-kicker-tag">PORTAL ACCESS</span>
            <h2>{forgot ? 'Reset Password' : 'Sign in to your account'}</h2>
            <p>
              {forgot
                ? 'Enter your school ID or registered email to receive recovery instructions.'
                : 'Welcome to New Ellinium School. Sign in with your credentials or explore via demo.'}
            </p>
          </div>

          {error && <div className="alert-box error">{error}</div>}
          {message && <div className="alert-box success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-field-wrapper">
              <label htmlFor="school-id-input">School ID or Registered Email</label>
              <input
                id="school-id-input"
                className="auth-input"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. NES-2026-0842 or student@ellinium.edu"
                required
              />
            </div>

            {!forgot && (
              <div className="form-field-wrapper">
                <label htmlFor="password-input">Password</label>
                <input
                  id="password-input"
                  className="auth-input"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your secret password"
                  required
                />
              </div>
            )}

            <button className="auth-submit-btn" type="submit" disabled={loading}>
              {loading ? (
                <span>Authenticating…</span>
              ) : forgot ? (
                <>
                  <span>Send Recovery Instructions</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <button
            type="button"
            className="toggle-forgot-link"
            onClick={() => {
              setForgot(!forgot)
              setError('')
              setMessage('')
            }}
          >
            {forgot ? 'Return to regular sign in' : 'Forgot your password?'}
          </button>

          <div className="demo-section-divider">or explore instant demo</div>

          <div className="demo-role-grid">
            <button
              type="button"
              className="demo-role-card"
              onClick={() => enterDemo('Student')}
            >
              <div className="demo-role-avatar student">AR</div>
              <div className="demo-role-info">
                <strong>Student Experience</strong>
                <small>Aarav Rao · Class 8-B (Science & Tech)</small>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </button>

            <button
              type="button"
              className="demo-role-card"
              onClick={() => enterDemo('Teacher')}
            >
              <div className="demo-role-avatar teacher">MK</div>
              <div className="demo-role-info">
                <strong>Faculty & Teacher Space</strong>
                <small>Ms. Maya Kapoor · Mathematics Department</small>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </button>

            <button
              type="button"
              className="demo-role-card"
              onClick={() => enterDemo('Admin')}
            >
              <div className="demo-role-avatar admin">AD</div>
              <div className="demo-role-info">
                <strong>School Administration</strong>
                <small>Principal & Administrative Office</small>
              </div>
              <ChevronRight size={18} color="var(--text-muted)" />
            </button>
          </div>

          <p className="demo-disclaimer-text">
            Demo roles allow full interactive exploration of all New Ellinium School features.
          </p>
        </div>
      </section>
    </div>
  )
}
