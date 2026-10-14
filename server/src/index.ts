import 'dotenv/config'
import { createHash, randomBytes } from 'node:crypto'
import { mkdir } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import bcrypt from 'bcryptjs'
import cors from 'cors'
import express, { type NextFunction, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import { Pool } from 'pg'

const app = express()
const port = Number(process.env.PORT ?? 4000)
const uploadDirectory = resolve(process.env.UPLOAD_DIR ?? './uploads')
const maxUploadBytes = Number(process.env.MAX_UPLOAD_MB ?? 10) * 1024 * 1024
const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('JWT_SECRET must be set before starting the API.')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
await mkdir(uploadDirectory, { recursive: true })

app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

interface Claims {
  id: string
  role: 'student' | 'teacher' | 'admin' | 'parent'
  schoolId: string
}
interface AuthRequest extends Request { user?: Claims }

function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const [kind, token] = (req.headers.authorization ?? '').split(' ')
  if (kind !== 'Bearer' || !token) return res.status(401).json({ error: 'Authentication required.' })
  try {
    req.user = jwt.verify(token, jwtSecret, { issuer: 'campus-lms' }) as Claims
    next()
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' })
  }
}

function allow(...roles: Claims['role'][]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'You do not have permission to do that.' })
    next()
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => callback(null, `${randomBytes(16).toString('hex')}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: maxUploadBytes, files: 1 },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
    if (!allowedTypes.has(file.mimetype)) return callback(new Error('Only photos, PDF, DOC, and DOCX files are allowed.'))
    callback(null, true)
  },
})

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, standardHeaders: true, legacyHeaders: false })

app.post('/api/auth/login', authLimiter, async (req, res, next) => {
  try {
    const identifier = String(req.body?.identifier ?? '').trim()
    const password = String(req.body?.password ?? '')
    if (!identifier || !password) return res.status(400).json({ error: 'School ID or email and password are required.' })
    const result = await pool.query<{ id: string; password_hash: string; role: Claims['role']; school_id: string; school_id_code: string; email: string; first_name: string; last_name: string }>(
      `SELECT id, password_hash, role, school_id AS school_id, school_id_code, email, first_name, last_name
       FROM users WHERE (lower(school_id_code) = lower($1) OR lower(email) = lower($1)) AND is_active = true LIMIT 1`, [identifier],
    )
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: 'The ID/email or password is incorrect.' })
    const token = jwt.sign({ id: user.id, role: user.role, schoolId: user.school_id }, jwtSecret, { expiresIn: '15m', issuer: 'campus-lms' })
    res.json({ token, expiresIn: 900, user: { id: user.id, role: user.role, schoolIdCode: user.school_id_code, email: user.email, firstName: user.first_name, lastName: user.last_name } })
  } catch (error) { next(error) }
})

app.post('/api/auth/forgot-password', async (req, res, next) => {
  try {
    const identifier = String(req.body?.identifier ?? '').trim()
    if (identifier) {
      const user = await pool.query<{ id: string; email: string }>(`SELECT id, email FROM users WHERE lower(school_id_code) = lower($1) OR lower(email) = lower($1) LIMIT 1`, [identifier])
      if (user.rows[0]) {
        const rawToken = randomBytes(32).toString('hex')
        const tokenHash = createHash('sha256').update(rawToken).digest('hex')
        await pool.query(`INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, now() + interval '30 minutes')`, [user.rows[0].id, tokenHash])
        const resetUrl = `${process.env.CLIENT_ORIGIN ?? 'http://localhost:5173'}/reset-password?token=${rawToken}`
        if (process.env.NODE_ENV !== 'production') console.info(`Development password reset link for ${user.rows[0].email}: ${resetUrl}`)
      }
    }
    res.status(202).json({ message: 'If that account exists, password reset instructions will be sent.' })
  } catch (error) { next(error) }
})

app.post('/api/auth/reset-password', async (req, res, next) => {
  const token = String(req.body?.token ?? '')
  const password = String(req.body?.password ?? '')
  if (password.length < 10) return res.status(400).json({ error: 'Password must contain at least 10 characters.' })
  try {
    const tokenHash = createHash('sha256').update(token).digest('hex')
    const result = await pool.query<{ user_id: string; id: string }>(`SELECT id, user_id FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() LIMIT 1`, [tokenHash])
    if (!result.rows[0]) return res.status(400).json({ error: 'This reset link is invalid or has expired.' })
    const passwordHash = await bcrypt.hash(password, 12)
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      await client.query('UPDATE users SET password_hash = $1, updated_at = now() WHERE id = $2', [passwordHash, result.rows[0].user_id])
      await client.query('UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL', [result.rows[0].user_id])
      await client.query('COMMIT')
      res.json({ message: 'Password updated. You can now sign in.' })
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  } catch (error) { next(error) }
})

app.get('/api/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT id, role, school_id_code, email, first_name, last_name, preferred_language, avatar_url FROM users WHERE id = $1 AND school_id = $2 AND is_active = true`, [req.user!.id, req.user!.schoolId])
    if (!result.rows[0]) return res.status(404).json({ error: 'Account not found.' })
    res.json(result.rows[0])
  } catch (error) { next(error) }
})

app.get('/api/homework', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const values: unknown[] = [req.user!.schoolId, req.user!.id]
    let classFilter = ''
    if (req.user!.role === 'student' || req.user!.role === 'parent') {
      classFilter = `AND a.class_id = (SELECT class_id FROM student_profiles WHERE user_id = $2)`
    } else if (req.user!.role === 'teacher') {
      classFilter = `AND EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.class_id = a.class_id AND ta.teacher_id = $2)`
    }
    const result = await pool.query(
      `SELECT a.id, a.title, a.instructions, a.due_at, a.max_marks, s.name AS subject,
              hs.status, hs.submitted_at, hs.marks, hs.feedback
       FROM homework_assignments a JOIN subjects s ON s.id = a.subject_id
       JOIN classes c ON c.id = a.class_id
       LEFT JOIN homework_submissions hs ON hs.assignment_id = a.id AND hs.student_id = $2
       WHERE c.school_id = $1 ${classFilter}
       ORDER BY a.due_at ASC`, values,
    )
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/homework', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { classId, subjectId, title, instructions, dueAt, maxMarks } = req.body ?? {}
    if (!classId || !subjectId || !title || !instructions || !dueAt) return res.status(400).json({ error: 'Class, subject, title, instructions, and due date are required.' })
    if (req.user!.role === 'teacher') {
      const assignment = await pool.query(`SELECT 1 FROM teacher_assignments WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3`, [req.user!.id, classId, subjectId])
      if (!assignment.rowCount) return res.status(403).json({ error: 'You are not assigned to this class and subject.' })
    }
    const result = await pool.query(`INSERT INTO homework_assignments (class_id, subject_id, teacher_id, title, instructions, due_at, max_marks) SELECT c.id, s.id, $3, $4, $5, $6, $7 FROM classes c JOIN subjects s ON s.id = $2 WHERE c.id = $1 AND c.school_id = $8 AND s.school_id = $8 RETURNING *`, [classId, subjectId, req.user!.id, title, instructions, dueAt, maxMarks ?? null, req.user!.schoolId])
    if (!result.rows[0]) return res.status(404).json({ error: 'Class or subject not found.' })
    res.status(201).json(result.rows[0])
  } catch (error) { next(error) }
})

app.post('/api/homework/:id/submissions', authenticate, allow('student'), upload.single('file'), async (req: AuthRequest, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Choose a file to submit.' })
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const submission = await client.query<{ id: string }>(
        `INSERT INTO homework_submissions (assignment_id, student_id, status, submitted_at)
         SELECT a.id, $2, CASE WHEN a.due_at < now() THEN 'late'::submission_status ELSE 'submitted'::submission_status END, now()
         FROM homework_assignments a JOIN student_profiles sp ON sp.class_id = a.class_id AND sp.user_id = $2
         JOIN classes c ON c.id = a.class_id WHERE a.id = $1 AND c.school_id = $3
         ON CONFLICT (assignment_id, student_id) DO UPDATE SET status = EXCLUDED.status, submitted_at = now()
         WHERE homework_submissions.status <> 'graded' RETURNING id`, [req.params.id, req.user!.id, req.user!.schoolId],
      )
      if (!submission.rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Assignment not found or submission is already graded.' }) }
      await client.query(`INSERT INTO submission_files (submission_id, original_name, storage_key, mime_type, size_bytes) VALUES ($1, $2, $3, $4, $5)`, [submission.rows[0].id, basename(req.file.originalname), req.file.filename, req.file.mimetype, req.file.size])
      await client.query('COMMIT')
      res.status(201).json({ id: submission.rows[0].id, status: 'submitted' })
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  } catch (error) { next(error) }
})

app.patch('/api/homework/submissions/:id/grade', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { marks, feedback } = req.body ?? {}
    if (typeof marks !== 'number' || !Number.isFinite(marks) || marks < 0 || typeof feedback !== 'string') return res.status(400).json({ error: 'Valid marks and feedback are required.' })
    const result = await pool.query(
      `UPDATE homework_submissions hs SET marks = $1, feedback = $2, status = 'graded', graded_by = $3, graded_at = now()
       FROM homework_assignments a JOIN classes c ON c.id = a.class_id
       WHERE hs.id = $4 AND hs.assignment_id = a.id AND c.school_id = $5
      AND (a.max_marks IS NULL OR $1 <= a.max_marks)
       AND ($6::account_role = 'admin' OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.teacher_id = $3 AND ta.class_id = a.class_id AND ta.subject_id = a.subject_id))
       RETURNING hs.*`, [marks, feedback, req.user!.id, req.params.id, req.user!.schoolId, req.user!.role],
    )
    if (!result.rows[0]) return res.status(404).json({ error: 'Submission not found or not assigned to you.' })
    res.json(result.rows[0])
  } catch (error) { next(error) }
})

app.get('/api/activities', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT a.*, u.first_name || ' ' || u.last_name AS author, count(ar.student_id)::int AS registrations FROM activities a JOIN users u ON u.id = a.created_by LEFT JOIN activity_registrations ar ON ar.activity_id = a.id WHERE a.school_id = $1 AND (a.class_id IS NULL OR a.class_id IN (SELECT class_id FROM student_profiles WHERE user_id = $2) OR $3::account_role IN ('teacher', 'admin')) GROUP BY a.id, u.first_name, u.last_name ORDER BY a.starts_at`, [req.user!.schoolId, req.user!.id, req.user!.role])
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/activities', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { classId, title, description, category, startsAt, registrationDeadline, capacity } = req.body ?? {}
    if (!title || !description || !category || !startsAt) return res.status(400).json({ error: 'Title, description, category, and date are required.' })
    if (req.user!.role === 'teacher' && !classId) return res.status(400).json({ error: 'Choose a class for this activity.' })
    if (classId) {
      const targetClass = await pool.query(`SELECT 1 FROM classes WHERE id = $1 AND school_id = $2`, [classId, req.user!.schoolId])
      if (!targetClass.rowCount) return res.status(404).json({ error: 'Class not found.' })
      if (req.user!.role === 'teacher') {
        const assignment = await pool.query(`SELECT 1 FROM teacher_assignments WHERE teacher_id = $1 AND class_id = $2`, [req.user!.id, classId])
        if (!assignment.rowCount) return res.status(403).json({ error: 'You are not assigned to this class.' })
      }
    }
    const result = await pool.query(`INSERT INTO activities (school_id, class_id, created_by, title, description, category, starts_at, registration_deadline, capacity) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`, [req.user!.schoolId, classId ?? null, req.user!.id, title, description, category, startsAt, registrationDeadline ?? null, capacity ?? null])
    res.status(201).json(result.rows[0])
  } catch (error) { next(error) }
})

app.post('/api/activities/:id/register', authenticate, allow('student'), async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`INSERT INTO activity_registrations (activity_id, student_id, entry_text) SELECT a.id, $2, $3 FROM activities a WHERE a.id = $1 AND a.school_id = $4 AND (a.class_id IS NULL OR a.class_id = (SELECT class_id FROM student_profiles WHERE user_id = $2)) AND (a.registration_deadline IS NULL OR a.registration_deadline > now()) ON CONFLICT (activity_id, student_id) DO NOTHING RETURNING *`, [req.params.id, req.user!.id, req.body?.entryText ?? null, req.user!.schoolId])
    if (!result.rows[0]) return res.status(409).json({ error: 'Activity unavailable or registration already exists.' })
    res.status(201).json(result.rows[0])
  } catch (error) { next(error) }
})

app.get('/api/assemblies', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT fa.*, COALESCE(json_agg(json_build_object('id', ai.id, 'type', ai.item_type, 'title', ai.title, 'description', ai.description, 'presenter', ai.presenter, 'startsAt', ai.starts_at) ORDER BY ai.sort_order) FILTER (WHERE ai.id IS NOT NULL), '[]') AS items FROM friday_assemblies fa LEFT JOIN assembly_items ai ON ai.assembly_id = fa.id WHERE fa.school_id = $1 AND fa.status <> 'draft' GROUP BY fa.id ORDER BY fa.assembly_date DESC`, [req.user!.schoolId])
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/assemblies', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  const { title, theme, thoughtOfDay, assemblyDate, startsAt, status, items } = req.body ?? {}
  if (!title || !theme || !assemblyDate) return res.status(400).json({ error: 'Title, theme, and assembly date are required.' })
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const assembly = await client.query(`INSERT INTO friday_assemblies (school_id, title, theme, thought_of_day, assembly_date, starts_at, status, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [req.user!.schoolId, title, theme, thoughtOfDay ?? null, assemblyDate, startsAt ?? '08:00', status === 'published' ? 'published' : 'scheduled', req.user!.id])
    for (const [index, item] of (Array.isArray(items) ? items : []).entries()) await client.query(`INSERT INTO assembly_items (assembly_id, item_type, title, description, presenter, starts_at, sort_order) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [assembly.rows[0].id, item.type ?? 'other', item.title, item.description ?? null, item.presenter ?? null, item.startsAt ?? null, index])
    await client.query('COMMIT')
    res.status(201).json(assembly.rows[0])
  } catch (error) { await client.query('ROLLBACK'); next(error) } finally { client.release() }
})

app.get('/api/exams', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT e.id, e.title, ep.exam_date, ep.starts_at, ep.ends_at, ep.syllabus, ep.max_marks, ep.admit_card_key, e.results_published_at, c.grade, c.name AS section, s.name AS subject, er.marks_obtained, er.grade AS result_grade, er.rank, er.remarks FROM exams e JOIN exam_papers ep ON ep.exam_id = e.id JOIN subjects s ON s.id = ep.subject_id JOIN classes c ON c.id = e.class_id LEFT JOIN exam_results er ON er.exam_id = e.id AND er.student_id = $2 AND er.subject_id = ep.subject_id WHERE e.school_id = $1 AND (e.class_id IN (SELECT class_id FROM student_profiles WHERE user_id = $2) OR $3::account_role IN ('teacher', 'admin')) ORDER BY ep.exam_date`, [req.user!.schoolId, req.user!.id, req.user!.role])
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/exams', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { academicYearId, classId, title, papers } = req.body ?? {}
    if (!academicYearId || !classId || !title || !Array.isArray(papers) || papers.length === 0) return res.status(400).json({ error: 'Exam, class, and at least one subject paper are required.' })
    const firstPaper = papers[0]
    if (!firstPaper.subjectId || !firstPaper.examDate || !firstPaper.startsAt || !firstPaper.endsAt) return res.status(400).json({ error: 'Each paper needs a subject, date, and start and end times.' })
    if (req.user!.role === 'teacher') {
      for (const paper of papers) {
        const assignment = await pool.query(`SELECT 1 FROM teacher_assignments WHERE teacher_id = $1 AND class_id = $2 AND subject_id = $3`, [req.user!.id, classId, paper.subjectId])
        if (!assignment.rowCount) return res.status(403).json({ error: 'You are not assigned to every paper subject.' })
      }
    }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      const result = await client.query(`INSERT INTO exams (school_id, academic_year_id, class_id, title, exam_date, starts_at, ends_at, syllabus, created_by) SELECT $1, ay.id, c.id, $4, $5, $6, $7, NULL, $8 FROM academic_years ay JOIN classes c ON c.academic_year_id = ay.id WHERE ay.id = $2 AND c.id = $3 AND c.school_id = $1 RETURNING *`, [req.user!.schoolId, academicYearId, classId, title, firstPaper.examDate, firstPaper.startsAt, firstPaper.endsAt, req.user!.id])
    if (!result.rows[0]) return res.status(404).json({ error: 'Class or academic year not found.' })
      for (const paper of papers) {
        if (!paper.subjectId || !paper.examDate || !paper.startsAt || !paper.endsAt) throw new Error('Each paper needs a subject, date, and start and end times.')
        const inserted = await client.query(`INSERT INTO exam_papers (exam_id, subject_id, exam_date, starts_at, ends_at, syllabus, max_marks, admit_card_key) SELECT $1, s.id, $3, $4, $5, $6, $7, $8 FROM subjects s WHERE s.id = $2 AND s.school_id = $9 RETURNING id`, [result.rows[0].id, paper.subjectId, paper.examDate, paper.startsAt, paper.endsAt, paper.syllabus ?? null, paper.maxMarks ?? 100, paper.admitCardKey ?? null, req.user!.schoolId])
        if (!inserted.rowCount) throw new Error('A paper subject does not belong to this school.')
      }
      await client.query('COMMIT')
      res.status(201).json(result.rows[0])
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  } catch (error) { next(error) }
})

app.post('/api/exams/:id/results', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const records = req.body?.results
    if (!Array.isArray(records)) return res.status(400).json({ error: 'A results array is required.' })
    if (req.user!.role === 'teacher') {
      const assignment = await pool.query(`SELECT 1 FROM exams e JOIN exam_papers ep ON ep.exam_id = e.id JOIN teacher_assignments ta ON ta.class_id = e.class_id AND ta.subject_id = ep.subject_id WHERE e.id = $1 AND ta.teacher_id = $2 AND e.school_id = $3`, [req.params.id, req.user!.id, req.user!.schoolId])
      if (!assignment.rowCount) return res.status(403).json({ error: 'You are not assigned to this exam.' })
    }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const record of records) {
        const saved = await client.query(`INSERT INTO exam_results (exam_id, subject_id, student_id, marks_obtained, max_marks, grade, rank, remarks) SELECT e.id, s.id, u.id, $4, $5, $6, $7, $8 FROM exams e JOIN exam_papers ep ON ep.exam_id = e.id AND ep.subject_id = $2 JOIN subjects s ON s.id = ep.subject_id JOIN users u ON u.id = $3 JOIN student_profiles sp ON sp.user_id = u.id AND sp.class_id = e.class_id WHERE e.id = $1 AND e.school_id = $9 AND s.school_id = $9 AND u.school_id = $9 AND $4 >= 0 AND $5 > 0 AND $4 <= $5 AND ($10::account_role = 'admin' OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.teacher_id = $11 AND ta.class_id = e.class_id AND ta.subject_id = s.id)) ON CONFLICT (exam_id, subject_id, student_id) DO UPDATE SET marks_obtained = EXCLUDED.marks_obtained, max_marks = EXCLUDED.max_marks, grade = EXCLUDED.grade, rank = EXCLUDED.rank, remarks = EXCLUDED.remarks`, [req.params.id, record.subjectId, record.studentId, record.marks, record.maxMarks, record.grade ?? null, record.rank ?? null, record.remarks ?? null, req.user!.schoolId, req.user!.role, req.user!.id])
        if (!saved.rowCount) throw new Error('A result was invalid or outside the selected class and subject.')
      }
      await client.query(`UPDATE exams SET results_published_at = now() WHERE id = $1 AND school_id = $2`, [req.params.id, req.user!.schoolId])
      await client.query('COMMIT')
      res.json({ saved: records.length })
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  } catch (error) { next(error) }
})

app.get('/api/notices', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT n.id, n.title, n.body, n.published_at, n.expires_at, n.attachment_key, u.first_name || ' ' || u.last_name AS author FROM notices n JOIN users u ON u.id = n.created_by WHERE n.school_id = $1 AND (n.class_id IS NULL OR n.class_id IN (SELECT class_id FROM student_profiles WHERE user_id = $2) OR $3::account_role IN ('teacher', 'admin')) AND (n.expires_at IS NULL OR n.expires_at > now()) ORDER BY n.published_at DESC`, [req.user!.schoolId, req.user!.id, req.user!.role])
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/notices', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { classId, title, body, expiresAt } = req.body ?? {}
    if (!title || !body) return res.status(400).json({ error: 'Title and notice body are required.' })
    if (req.user!.role === 'teacher' && !classId) return res.status(400).json({ error: 'Choose a class for this notice.' })
    if (classId) {
      const targetClass = await pool.query(`SELECT 1 FROM classes WHERE id = $1 AND school_id = $2`, [classId, req.user!.schoolId])
      if (!targetClass.rowCount) return res.status(404).json({ error: 'Class not found.' })
      if (req.user!.role === 'teacher') {
        const assignment = await pool.query(`SELECT 1 FROM teacher_assignments WHERE teacher_id = $1 AND class_id = $2`, [req.user!.id, classId])
        if (!assignment.rowCount) return res.status(403).json({ error: 'You are not assigned to this class.' })
      }
    }
    const result = await pool.query(`INSERT INTO notices (school_id, class_id, created_by, title, body, expires_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [req.user!.schoolId, classId ?? null, req.user!.id, title, body, expiresAt ?? null])
    res.status(201).json(result.rows[0])
  } catch (error) { next(error) }
})

app.get('/api/attendance', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT attendance_date, status, note FROM attendance_records WHERE student_id = $1 ORDER BY attendance_date DESC LIMIT 90`, [req.user!.id])
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/attendance', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const { classId, date, records } = req.body ?? {}
    if (!classId || !date || !Array.isArray(records)) return res.status(400).json({ error: 'Class, date, and attendance records are required.' })
    if (req.user!.role === 'teacher') {
      const assignment = await pool.query(`SELECT 1 FROM teacher_assignments WHERE teacher_id = $1 AND class_id = $2`, [req.user!.id, classId])
      if (!assignment.rowCount) return res.status(403).json({ error: 'You are not assigned to this class.' })
    }
    const client = await pool.connect()
    try {
      await client.query('BEGIN')
      for (const record of records) await client.query(`INSERT INTO attendance_records (class_id, student_id, marked_by, attendance_date, status, note) SELECT sp.class_id, u.id, $3, $4, $5::attendance_status, $6 FROM student_profiles sp JOIN users u ON u.id = sp.user_id WHERE sp.user_id = $1 AND sp.class_id = $2 AND u.school_id = $7 ON CONFLICT (student_id, attendance_date) DO UPDATE SET status = EXCLUDED.status, note = EXCLUDED.note, marked_by = EXCLUDED.marked_by`, [record.studentId, classId, req.user!.id, date, record.status, record.note ?? null, req.user!.schoolId])
      await client.query('COMMIT')
      res.json({ saved: records.length })
    } catch (error) { await client.query('ROLLBACK'); throw error } finally { client.release() }
  } catch (error) { next(error) }
})

app.get('/api/classes', authenticate, allow('teacher', 'admin'), async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT c.id, c.grade, c.name AS section, count(sp.user_id)::int AS students FROM classes c LEFT JOIN student_profiles sp ON sp.class_id = c.id WHERE c.school_id = $1 AND ($2::account_role = 'admin' OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.class_id = c.id AND ta.teacher_id = $3)) GROUP BY c.id ORDER BY c.grade, c.name`, [req.user!.schoolId, req.user!.role, req.user!.id])
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.get('/api/notifications', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const result = await pool.query(`SELECT id, title, body, notification_type, resource_type, resource_id, read_at, created_at FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`, [req.user!.id])
    res.json(result.rows)
  } catch (error) { next(error) }
})

app.post('/api/notifications/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await pool.query(`UPDATE notifications SET read_at = now() WHERE id = $1 AND user_id = $2`, [req.params.id, req.user!.id])
    res.status(204).end()
  } catch (error) { next(error) }
})

app.get('/api/files/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const file = await pool.query<{ storage_key: string; original_name: string; mime_type: string }>(
      `SELECT sf.storage_key, sf.original_name, sf.mime_type FROM submission_files sf
       JOIN homework_submissions hs ON hs.id = sf.submission_id
       JOIN homework_assignments a ON a.id = hs.assignment_id
       JOIN classes c ON c.id = a.class_id
       WHERE sf.id = $1 AND c.school_id = $2 AND (
         hs.student_id = $3 OR $4::account_role = 'admin' OR EXISTS (
           SELECT 1 FROM teacher_assignments ta WHERE ta.teacher_id = $3 AND ta.class_id = a.class_id AND ta.subject_id = a.subject_id
         )
       )`, [req.params.id, req.user!.schoolId, req.user!.id, req.user!.role],
    )
    if (!file.rows[0]) return res.status(404).json({ error: 'File not found.' })
    res.type(file.rows[0].mime_type).download(resolve(uploadDirectory, file.rows[0].storage_key), basename(file.rows[0].original_name))
  } catch (error) { next(error) }
})

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof multer.MulterError) return res.status(error.code === 'LIMIT_FILE_SIZE' ? 413 : 400).json({ error: error.code === 'LIMIT_FILE_SIZE' ? 'File is larger than the upload limit.' : error.message })
  const message = error instanceof Error ? error.message : 'Unexpected server error.'
  if (message.startsWith('Only photos')) return res.status(415).json({ error: message })
  console.error(error)
  res.status(500).json({ error: 'Unexpected server error.' })
})

app.listen(port, () => console.info(`Campus LMS API listening on http://localhost:${port}`))
