CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN CREATE TYPE account_role AS ENUM ('student', 'teacher', 'admin', 'parent'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'late', 'graded'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  default_language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (name)
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  school_id_code TEXT NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role account_role NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, school_id_code),
  UNIQUE (school_id, email)
);
CREATE INDEX users_school_role_idx ON users(school_id, role);

CREATE TABLE academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (school_id, name)
);

CREATE TABLE classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  grade SMALLINT NOT NULL,
  name TEXT NOT NULL,
  UNIQUE (academic_year_id, grade, name)
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  UNIQUE (school_id, code)
);

CREATE TABLE student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id),
  roll_number TEXT NOT NULL,
  guardian_name TEXT,
  guardian_email TEXT,
  UNIQUE (class_id, roll_number)
);

CREATE TABLE teacher_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  is_class_teacher BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (teacher_id, class_id, subject_id)
);

CREATE TABLE timetable_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID REFERENCES users(id),
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL,
  room TEXT,
  CHECK (ends_at > starts_at)
);

CREATE TABLE homework_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  teacher_id UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  instructions TEXT NOT NULL,
  due_at TIMESTAMPTZ NOT NULL,
  max_marks NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (class_id, subject_id, title, due_at)
);
CREATE INDEX homework_class_due_idx ON homework_assignments(class_id, due_at);

CREATE TABLE homework_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE homework_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status submission_status NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  marks NUMERIC(6,2),
  feedback TEXT,
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMPTZ,
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE submission_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES homework_submissions(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  registration_deadline TIMESTAMPTZ,
  capacity INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE activity_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL
);

CREATE TABLE activity_registrations (
  activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  entry_text TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (activity_id, student_id)
);

CREATE TABLE friday_assemblies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  thought_of_day TEXT,
  assembly_date DATE NOT NULL,
  starts_at TIME NOT NULL DEFAULT '08:00',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  created_by UUID NOT NULL REFERENCES users(id),
  UNIQUE (school_id, assembly_date)
);

CREATE TABLE assembly_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assembly_id UUID NOT NULL REFERENCES friday_assemblies(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('news', 'performance', 'speech', 'quiz', 'announcement', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  presenter TEXT,
  starts_at TIME,
  sort_order SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  class_id UUID NOT NULL REFERENCES classes(id),
  title TEXT NOT NULL,
  exam_date DATE NOT NULL,
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL,
  syllabus TEXT,
  admit_card_key TEXT,
  results_published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES users(id),
  CHECK (ends_at > starts_at)
);

CREATE TABLE exam_papers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  exam_date DATE NOT NULL,
  starts_at TIME NOT NULL,
  ends_at TIME NOT NULL,
  syllabus TEXT,
  max_marks NUMERIC(6,2) NOT NULL DEFAULT 100,
  admit_card_key TEXT,
  UNIQUE (exam_id, subject_id),
  CHECK (ends_at > starts_at)
);

CREATE TABLE exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id),
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  marks_obtained NUMERIC(6,2) NOT NULL,
  max_marks NUMERIC(6,2) NOT NULL,
  grade TEXT,
  rank INTEGER,
  remarks TEXT,
  UNIQUE (exam_id, subject_id, student_id),
  CHECK (marks_obtained >= 0 AND max_marks > 0 AND marks_obtained <= max_marks)
);

CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  marked_by UUID NOT NULL REFERENCES users(id),
  attendance_date DATE NOT NULL,
  status attendance_status NOT NULL,
  note TEXT,
  UNIQUE (student_id, attendance_date)
);
CREATE INDEX attendance_class_date_idx ON attendance_records(class_id, attendance_date);

CREATE TABLE notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  attachment_key TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  notification_type TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_unread_idx ON notifications(user_id, created_at DESC) WHERE read_at IS NULL;

CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
