import axiosInstance from '../lib/axios'

export interface Question {
  id: number
  content: string
  question_type: string
  difficulty: string
  answers: Answer[]
  topic_name: string
  guidance?: string
}

export interface Answer {
  id: number
  content: string
  is_correct?: boolean
  explanation?: string
}

export interface MockExam {
  id: number
  title: string
  description: string
  exam_type: number | string
  exam_type_name?: string
  subject: number | string
  subject_name?: string
  created_by?: string
  duration_minutes: number
  total_marks: number
  passing_score: number
  is_active: boolean
  is_public: boolean
  question_count: number
  attempt_count: number
  average_score: number
  created_at: string
  updated_at: string
  questions?: Question[]
}

export interface ExamAttempt {
  id: number
  user_name: string
  mock_exam: MockExam
  started_at: string
  completed_at: string | null
  time_taken_seconds: number
  is_submitted: boolean
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | 'TIME_UP'
  score: number
  percentage: number
  raw_responses: Record<string, number>
  auto_graded: boolean
  attempted_questions: number
  remaining_time_seconds: number
  is_time_expired: boolean
  ip_address?: string
  user_agent?: string
}

export interface ExamResult {
  id: number
  attempt: ExamAttempt
  total_score: number
  percentage: number
  percentage_display: string
  grade: string
  passed: boolean
  correct_answers: number
  incorrect_answers: number
  unanswered: number
  detailed_breakdown: {
    topics: Record<string, any>
    questions: Record<string, any>
    summary: {
      correct: number
      incorrect: number
      unanswered: number
      total: number
    }
  }
  performance_summary: Record<string, any>
  recommendations: string[]
  generated_at: string
  updated_at: string
}

export interface ExamSubmission {
  raw_responses: Record<string, number>
  time_taken_seconds: number
}

export const ExamService = {
  /**
   * Get all available mock exams
   */
  getExams: async (params?: any) => {
    const response = await axiosInstance.get<{ results: MockExam[] }>('/exams/', {
      params,
    })
    return response.data.results || response.data
  },

  /**
   * Get a specific mock exam with all details
   */
  getExamDetail: async (examId: number): Promise<MockExam> => {
    const response = await axiosInstance.get<MockExam>(`/exams/${examId}/`)
    return response.data
  },

  /**
   * Get statistics for a specific exam
   */
  getExamStats: async (examId: number) => {
    const response = await axiosInstance.get(`/exams/${examId}/stats/`)
    return response.data
  },

  /**
   * Create a JAMB mock exam
   */
  createJAMBExam: async (payload: {
    subject_id: number
    exam_type_id: number
    num_questions?: number
    duration_minutes?: number
    difficulty_distribution?: Record<string, number>
  }): Promise<MockExam> => {
    const response = await axiosInstance.post<MockExam>('/exams/create_jamb_exam/', payload)
    return response.data
  },


  createExam: async (payload: {
    subject_name: string
    exam_format?: string
    mode?: 'past_questions' | 'ai_generated'
    year?: number
    num_questions?: number
    duration_minutes?: number
    difficulty_distribution?: {
      EASY?: number
      MEDIUM?: number
      HARD?: number
    }
  }): Promise<MockExam> => {
    const response = await axiosInstance.post<MockExam>('/exams/create_exam/', payload)
    return response.data
  },

  /**
   * Start a new exam attempt
   */
  startExam: async (examId: number): Promise<ExamAttempt> => {
    const response = await axiosInstance.post<ExamAttempt>(`/exams/${examId}/start/`, {})
    return response.data
  },

  /**
   * Submit exam answers
   */
  submitExam: async (
    examId: number,
    submission: ExamSubmission
  ): Promise<{
    attempt: ExamAttempt
    result: ExamResult
    validation: any
  }> => {
    const response = await axiosInstance.post(`/exams/${examId}/submit/`, submission)
    return response.data
  },

  /**
   * Get exam result
   */
  getExamResult: async (examId: number): Promise<ExamResult> => {
    const response = await axiosInstance.get<ExamResult>(`/exams/${examId}/result/`)
    return response.data
  },

  /**
   * Get user's exam attempts
   */
  getMyAttempts: async (params?: any) => {
    const response = await axiosInstance.get('/exams/my-attempts/', { params })
    return response.data.results || response.data
  },

  /**
   * Get specific exam attempt details
   */
  getAttemptDetail: async (attemptId: number): Promise<ExamAttempt> => {
    const response = await axiosInstance.get<ExamAttempt>(`/exams/attempts/${attemptId}/`)
    return response.data
  },
}
