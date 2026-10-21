export type Role = 'Student' | 'Teacher' | 'Admin'

export type Page = 
  | 'Home' 
  | 'Homework' 
  | 'Activities' 
  | 'Friday Special' 
  | 'Exams' 
  | 'Attendance' 
  | 'Notices' 
  | 'Profile' 
  | 'Classes'

export interface HomeworkItem {
  id: string
  subject: string
  title: string
  due: string
  status: 'To do' | 'Submitted' | 'Graded'
  color: 'emerald' | 'amber' | 'sky' | 'purple' | 'rose'
  icon: string
  detail: string
  mark?: string
  teacherFeedback?: string
  submittedAt?: string
}

export interface TimetableLesson {
  time: string
  end: string
  subject: string
  room: string
  teacher: string
  color: 'emerald' | 'amber' | 'sky' | 'purple'
  now?: boolean
}

export interface ActivityItem {
  id: string
  icon: string
  color: 'emerald' | 'amber' | 'sky' | 'purple'
  category: string
  title: string
  detail: string
  date: string
  venue: string
  eligibility: string
  registered: boolean
}

export interface NoticeItem {
  id: string
  category: string
  title: string
  detail: string
  date: string
  author: string
  tone: 'emerald' | 'amber' | 'sky' | 'purple'
  urgent?: boolean
}

export interface ExamItem {
  subject: string
  date: string
  time: string
  syllabus: string
  room: string
  icon: string
  color: 'emerald' | 'amber' | 'sky' | 'purple'
}

export interface ResultItem {
  subject: string
  examName: string
  date: string
  marksObtained: number
  totalMarks: number
  grade: string
}

export interface NotificationItem {
  id: string
  title: string
  time: string
  tone: 'emerald' | 'amber' | 'sky'
  unread: boolean
}
