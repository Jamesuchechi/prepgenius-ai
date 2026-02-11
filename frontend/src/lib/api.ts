const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  detail?: string
  message?: string
}

export interface LoginResponse {
  user: any
  tokens: {
    access: string
    refresh: string
  }
}

export interface RegisterResponse {
  detail: string
  user: any
  tokens: {
    access: string
    refresh: string
  }
}

export interface UserProfile {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number?: string
  profile_picture?: string
  bio?: string
  student_type: string
  grade_level?: string
  exam_targets: string[]
  is_email_verified: boolean
  created_at: string
}

// Helper to get token from storage
function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

// Helper to create headers with auth token
function getAuthHeaders(): HeadersInit {
  const token = getToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// Generic API call handler with error handling
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    // Handle session expiry (401 Unauthorized)
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Clear cookie for middleware too
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    }

    let data: any = {}
    try {
      data = await response.json()
    } catch (e) {
      // If response is not JSON (e.g. 500 HTML page), handle gracefully
      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}: ${response.statusText}`)
      }
      return {} as T
    }

    if (!response.ok) {
      throw new Error(data.detail || data.message || data.error || `API request failed with status ${response.status}`)
    }

    return data
  } catch (error: any) {
    console.error(`API Error (${endpoint}):`, error)
    throw error
  }
}

// Authentication APIs
export async function signIn(email: string, password: string): Promise<LoginResponse> {
  return apiCall<LoginResponse>('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
}

export async function signUp(data: {
  email: string
  password: string
  first_name: string
  last_name: string
  exam_targets: string[]
}): Promise<RegisterResponse> {
  return apiCall<RegisterResponse>('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function logout(refreshToken: string): Promise<{ detail: string }> {
  return apiCall('/auth/logout/', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ refresh: refreshToken })
  })
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  return apiCall('/auth/refresh/', {
    method: 'POST',
    body: JSON.stringify({ refresh })
  })
}

export async function verifyEmail(token: string): Promise<{ detail: string; user: any }> {
  return apiCall('/auth/verify-email/', {
    method: 'POST',
    body: JSON.stringify({ token })
  })
}

export async function requestPasswordReset(email: string): Promise<{ detail: string }> {
  return apiCall('/auth/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email })
  })
}

export async function confirmPasswordReset(
  token: string,
  newPassword: string
): Promise<{ detail: string }> {
  return apiCall('/auth/password-reset-confirm/', {
    method: 'POST',
    body: JSON.stringify({ token, new_password: newPassword })
  })
}

// User Profile APIs
export async function getCurrentUser(): Promise<UserProfile> {
  return apiCall('/users/me/', {
    method: 'GET',
    headers: getAuthHeaders()
  })
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return apiCall('/users/me/update_profile/', {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
}

export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ detail: string }> {
  return apiCall('/users/me/change_password/', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword
    })
  })
}

// Content Interfaces
export interface ExamType {
  id: number
  name: string
  full_name: string
  level: string
}

export interface Subject {
  id: number
  name: string
  category: string
  icon: string
  color: string
}

export interface Topic {
  id: number
  name: string
  subject: number
}

// Question Interfaces
export interface Answer {
  id: number
  content: string
}

export interface Question {
  id: number
  content: string
  question_type: 'MCQ' | 'THEORY'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  subject: number
  topic: number
  exam_type: number
  answers: Answer[]
}

export interface QuestionAttemptResult {
  correct: boolean
  explanation: string
  correct_answer_id: number
}

// ... (existing Authentication and User APIs) ...

// Content APIs
export async function getExamTypes(): Promise<ExamType[]> {
  try {
    const data = await apiCall<{ results: ExamType[] }>('/content/exam-types/', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return data?.results || []
  } catch (error) {
    console.error('getExamTypes failed:', error)
    return []
  }
}

export async function getSubjects(): Promise<Subject[]> {
  try {
    const data = await apiCall<{ results: Subject[] }>('/content/subjects/', {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return data?.results || []
  } catch (error) {
    console.error('getSubjects failed:', error)
    return []
  }
}

export async function getTopics(subjectId: number): Promise<Topic[]> {
  try {
    const data = await apiCall<{ results: Topic[] }>(`/content/topics/?subject=${subjectId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    })
    return data?.results || []
  } catch (error) {
    console.error('getTopics failed:', error)
    return []
  }
}

// Question APIs
export async function generateQuestions(data: {
  subject_id: number
  topic_id: number
  exam_type_id: number
  difficulty: string
  count: number
}): Promise<Question[]> {
  return apiCall<Question[]>('/questions/generate/', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  })
}

export async function attemptQuestion(
  questionId: number,
  selectedAnswerId: number
): Promise<QuestionAttemptResult> {
  return apiCall<QuestionAttemptResult>(`/questions/${questionId}/attempt/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ selected_answer_id: selectedAnswerId })
  })
}