import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const demoPassword = 'Campus2026!'
const passwordHash = await bcrypt.hash(demoPassword, 12)

try {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const school = await client.query<{ id: string }>(
      `INSERT INTO schools (name) VALUES ('Sunrise Public School')
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id`,
    )
    const schoolId = school.rows[0]?.id ?? (await client.query<{ id: string }>(`SELECT id FROM schools WHERE name = 'Sunrise Public School' LIMIT 1`)).rows[0].id
    const year = await client.query<{ id: string }>(
      `INSERT INTO academic_years (school_id, name, starts_on, ends_on, is_current)
       VALUES ($1, '2026-27', '2026-04-01', '2027-03-31', true)
       ON CONFLICT (school_id, name) DO UPDATE SET is_current = true RETURNING id`, [schoolId],
    )
    const yearId = year.rows[0].id
    const klass = await client.query<{ id: string }>(
      `INSERT INTO classes (school_id, academic_year_id, grade, name)
       VALUES ($1, $2, 8, 'B') ON CONFLICT (academic_year_id, grade, name) DO UPDATE SET name = EXCLUDED.name RETURNING id`, [schoolId, yearId],
    )
    const classId = klass.rows[0].id
    for (const subject of [{ name: 'Mathematics', code: 'MATH' }, { name: 'English', code: 'ENG' }, { name: 'Science', code: 'SCI' }, { name: 'Hindi', code: 'HIN' }]) {
      await client.query(`INSERT INTO subjects (school_id, name, code) VALUES ($1, $2, $3) ON CONFLICT (school_id, code) DO NOTHING`, [schoolId, subject.name, subject.code])
    }
    const accounts = [
      { id: 'student-demo', code: 'SPS-2026-0842', email: 'student@sunrise.edu', role: 'student', first: 'Aarav', last: 'Rao' },
      { id: 'teacher-demo', code: 'TCH-2026-0017', email: 'teacher@sunrise.edu', role: 'teacher', first: 'Maya', last: 'Kapoor' },
      { id: 'admin-demo', code: 'ADM-2026-0001', email: 'admin@sunrise.edu', role: 'admin', first: 'School', last: 'Admin' },
    ]
    for (const account of accounts) {
      const user = await client.query<{ id: string }>(
        `INSERT INTO users (school_id, school_id_code, email, password_hash, role, first_name, last_name)
         VALUES ($1, $2, $3, $4, $5::account_role, $6, $7)
         ON CONFLICT (school_id, school_id_code) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash
         RETURNING id`, [schoolId, account.code, account.email, passwordHash, account.role, account.first, account.last],
      )
      if (account.role === 'student') {
        await client.query(`INSERT INTO student_profiles (user_id, class_id, roll_number) VALUES ($1, $2, '08') ON CONFLICT (user_id) DO UPDATE SET class_id = EXCLUDED.class_id`, [user.rows[0].id, classId])
      }
    }
    const teacher = await client.query<{ id: string }>(`SELECT id FROM users WHERE school_id = $1 AND school_id_code = 'TCH-2026-0017'`, [schoolId])
    const math = await client.query<{ id: string }>(`SELECT id FROM subjects WHERE school_id = $1 AND code = 'MATH'`, [schoolId])
    await client.query(`INSERT INTO teacher_assignments (teacher_id, class_id, subject_id, is_class_teacher) VALUES ($1, $2, $3, true) ON CONFLICT DO NOTHING`, [teacher.rows[0].id, classId, math.rows[0].id])
    await client.query(`INSERT INTO homework_assignments (class_id, subject_id, teacher_id, title, instructions, due_at, max_marks)
      VALUES ($1, $2, $3, 'Fractions practice — worksheet 4', 'Complete questions 1–12 and show your working.', '2026-10-16 20:00:00+05:30', 10)
      ON CONFLICT (class_id, subject_id, title, due_at) DO NOTHING`, [classId, math.rows[0].id, teacher.rows[0].id])
    const assembly = await client.query<{ id: string }>(`INSERT INTO friday_assemblies (school_id, title, theme, thought_of_day, assembly_date, starts_at, status, created_by)
      VALUES ($1, 'Friday Special Morning', 'Kindness costs nothing, shares everything.', 'One small act can make someone’s whole day.', '2026-10-17', '08:00', 'published', $2)
      ON CONFLICT (school_id, assembly_date) DO UPDATE SET title = EXCLUDED.title RETURNING id`, [schoolId, teacher.rows[0].id])
    await client.query(`INSERT INTO assembly_items (assembly_id, item_type, title, description, presenter, starts_at, sort_order)
      SELECT $1, item_type, title, description, presenter, starts_at::time, sort_order FROM (VALUES
        ('speech', 'Thought of the day', 'Kindness costs nothing, shares everything.', 'Aarav Rao, Class 8B', '08:05', 1),
        ('performance', 'A song for everyone', 'Sunshine Choir performance.', 'Classes 6–8', '08:12', 2),
        ('news', 'The week around us', 'Weekly news and school updates.', 'School News Team', '08:22', 3),
        ('quiz', 'Kindness in action', 'A quick quiz for all classes.', 'Class 8B', '08:32', 4)
      ) AS items(item_type, title, description, presenter, starts_at, sort_order)
      WHERE NOT EXISTS (SELECT 1 FROM assembly_items WHERE assembly_id = $1)`, [assembly.rows[0].id])
    await client.query(`INSERT INTO notices (school_id, created_by, title, body, published_at)
      SELECT $1, $2, 'Diwali break & school timings', 'School will remain closed from October 20–23. Classes resume Friday, October 24.', '2026-10-14'
      WHERE NOT EXISTS (SELECT 1 FROM notices WHERE school_id = $1 AND title = 'Diwali break & school timings')`, [schoolId, teacher.rows[0].id])
    await client.query('COMMIT')
    console.log(`Demo accounts seeded. Shared password: ${demoPassword}`)
    console.log('student@sunrise.edu / teacher@sunrise.edu / admin@sunrise.edu')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
} finally {
  await pool.end()
}
