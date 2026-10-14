import { useState, type FormEvent } from 'react'
import { ChevronRight, GraduationCap } from 'lucide-react'

type Role = 'Student' | 'Teacher' | 'Admin'
type LoginPageProps = {
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

  async function submit(event: FormEvent<HTMLFormElement>) {
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
        if (!response.ok) throw new Error('Could not send reset instructions. Please try again.')
        setMessage('If that account exists, reset instructions will be sent.')
      } else {
        await signIn(identifier, password)
      }
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-screen">
      <section className="login-side-art">
        <a className="brand login-brand" href="#login">
          <span className="brand-mark"><GraduationCap size={22} /></span>
          <span className="brand-copy"><strong>campus</strong><small>LEARNING, TOGETHER</small></span>
        </a>
        <div className="login-art-copy">
          <span className="welcome-kicker">SUNRISE PUBLIC SCHOOL</span>
          <h1>Curiosity looks<br />good on you.</h1>
          <p>Your school day, a little more connected.</p>
        </div>
        <div className="login-illustration" aria-hidden="true">
          <span className="login-orbit" />
          <span className="login-sun" />
          <span className="login-books"><i /><i /><i /></span>
          <span className="login-spark">✳</span>
          <span className="login-leaf">♧</span>
        </div>
        <span className="login-side-footer">A brighter way to learn, every day.</span>
      </section>
      <section className="login-form-side">
        <div className="login-form-wrap">
          <span className="login-mobile-mark"><GraduationCap size={22} /></span>
          <p className="eyebrow">YOUR LEARNING SPACE</p>
          <h2>{forgot ? 'Reset your password' : 'Welcome back'}</h2>
          <p className="login-subtitle">
            {forgot ? 'Enter your school ID or email for reset instructions.' : 'Sign in to pick up where your curiosity left off.'}
          </p>
          <form onSubmit={submit}>
            <label htmlFor="school-identifier">School ID or email</label>
            <input
              id="school-identifier"
              autoComplete="username"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="e.g. SPS-2026-0842"
              required
            />
            {!forgot && (
              <div className="password-field">
                <label htmlFor="account-password">Password</label>
                <input
                  id="account-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
            )}
            {error && <p className="login-error" role="alert">{error}</p>}
            {message && <p className="login-message" role="status">{message}</p>}
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : forgot ? 'Send reset instructions' : 'Sign in'}
              <ChevronRight size={16} />
            </button>
          </form>
          <button className="forgot-link" onClick={() => { setForgot(!forgot); setError(''); setMessage('') }}>
            {forgot ? 'Back to sign in' : 'Forgot password?'}
          </button>
          <div className="demo-divider"><span />or explore a demo<span /></div>
          <div className="demo-buttons">
            <button onClick={() => enterDemo('Student')}>
              <span className="demo-avatar student-demo">AR</span>
              <span>Student<small>Aarav · Class 8B</small></span>
              <ChevronRight size={15} />
            </button>
            <button onClick={() => enterDemo('Teacher')}>
              <span className="demo-avatar teacher-demo">MK</span>
              <span>Teacher<small>Maya · Mathematics</small></span>
              <ChevronRight size={15} />
            </button>
            <button onClick={() => enterDemo('Admin')}>
              <span className="demo-avatar admin-demo">AD</span>
              <span>Admin<small>School administrator</small></span>
              <ChevronRight size={15} />
            </button>
          </div>
          <p className="demo-disclaimer">Demo mode uses sample data and does not authenticate with the school API.</p>
        </div>
        <footer className="login-footer">© 2026 Sunrise Public School <span>Privacy · Help</span></footer>
      </section>
    </main>
  )
}
