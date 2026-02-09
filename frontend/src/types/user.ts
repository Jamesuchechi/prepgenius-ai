export type StudentType = 'individual' | 'institutional'

export type GradeLevel = 'ss1' | 'ss2' | 'ss3' | 'post_secondary'

export type ExamTarget = 'jamb' | 'waec' | 'neco' | 'utme' | 'post_utme'

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  profile_picture?: string
  bio?: string
  student_type: StudentType
  grade_level?: GradeLevel
  exam_targets: ExamTarget[]
  is_email_verified: boolean
  timezone: string
  language: string
  created_at: string
  updated_at: string
  last_login_date?: string
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
  detail?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  email: string
  first_name: string
  last_name: string
  password: string
  password_confirm: string
  student_type?: StudentType
  grade_level?: GradeLevel
  exam_targets?: ExamTarget[]
}

export interface ChangePasswordPayload {
  old_password: string
  new_password: string
  new_password_confirm: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  new_password: string
  new_password_confirm: string
}

export interface EmailVerification {
  token: string
}
